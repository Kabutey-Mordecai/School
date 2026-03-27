import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const school = await prisma.school.upsert({
    where: { code: "EDUCORE-DEMO" },
    update: {},
    create: {
      name: "EduCore Demo School",
      code: "EDUCORE-DEMO",
    },
  });

  const defaultPasswordHash = await bcrypt.hash("ChangeMe123!", 10);

  const users = [
    { email: "admin@educore.local", role: UserRole.ADMIN },
    { email: "teacher@educore.local", role: UserRole.TEACHER },
    { email: "parent@educore.local", role: UserRole.PARENT },
    { email: "student@educore.local", role: UserRole.STUDENT },
    { email: "accountant@educore.local", role: UserRole.ACCOUNTANT },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { schoolId_email: { schoolId: school.id, email: user.email } },
      update: {},
      create: {
        schoolId: school.id,
        email: user.email,
        passwordHash: defaultPasswordHash,
        firstName: user.role,
        lastName: "Demo",
        role: user.role,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
