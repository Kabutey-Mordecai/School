import { UserRole, type User } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../common/http-errors.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthResult = {
  user: Pick<
    User,
    "id" | "email" | "firstName" | "lastName" | "role" | "schoolId"
  >;
  tokens: AuthTokens;
};

type TokenPayload = {
  sub: string;
  schoolId: string;
  role: UserRole;
};

async function resolveSchoolId(input: LoginInput): Promise<string> {
  if (input.schoolId) {
    const school = await prisma.school.findUnique({
      where: {
        id: input.schoolId,
      },
      select: {
        id: true,
      },
    });

    if (school) {
      return school.id;
    }
  }

  if (!input.schoolCode) {
    throw new HttpError("Invalid credentials", 401);
  }

  const school = await prisma.school.findUnique({
    where: {
      code: input.schoolCode,
    },
    select: {
      id: true,
    },
  });

  if (!school) {
    throw new HttpError("Invalid credentials", 401);
  }

  return school.id;
}

const accessTokenTtl = env.JWT_ACCESS_TTL as jwt.SignOptions["expiresIn"];
const refreshTokenTtl = env.JWT_REFRESH_TTL as jwt.SignOptions["expiresIn"];

function signTokens(payload: TokenPayload): AuthTokens {
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: accessTokenTtl,
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: refreshTokenTtl,
  });

  return { accessToken, refreshToken };
}

function toAuthResult(user: User): AuthResult {
  const payload: TokenPayload = {
    sub: user.id,
    schoolId: user.schoolId,
    role: user.role,
  };

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      schoolId: user.schoolId,
    },
    tokens: signTokens(payload),
  };
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        schoolId_email: {
          schoolId: input.schoolId,
          email: input.email,
        },
      },
    });

    if (existingUser) {
      throw new HttpError("User already exists", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        schoolId: input.schoolId,
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
      },
    });

    return toAuthResult(user);
  } catch (err) {
    console.error("registerUser error:", err);
    throw err;
  }
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  try {
    const schoolId = await resolveSchoolId(input);

    const user = await prisma.user.findUnique({
      where: {
        schoolId_email: {
          schoolId,
          email: input.email,
        },
      },
    });

    if (!user || !user.isActive) {
      throw new HttpError("Invalid credentials", 401);
    }

    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new HttpError("Invalid credentials", 401);
    }

    return toAuthResult(user);
  } catch (err) {
    console.error("loginUser error:", err);
    throw err;
  }
}

export function refreshAuthToken(refreshToken: string): AuthTokens {
  try {
    const payload = jwt.verify(
      refreshToken,
      env.JWT_REFRESH_SECRET,
    ) as TokenPayload;
    return signTokens({
      sub: payload.sub,
      schoolId: payload.schoolId,
      role: payload.role,
    });
  } catch (err) {
    console.error("refreshAuthToken error:", err);
    throw new HttpError("Invalid refresh token", 401);
  }
}
