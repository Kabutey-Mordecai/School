import { Router } from "express";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schemas.js";
import { loginUser, refreshAuthToken, registerUser } from "./auth.service.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const result = await registerUser(input);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const tokens = refreshAuthToken(refreshToken);
    res.status(200).json(tokens);
  } catch (error) {
    next(error);
  }
});
