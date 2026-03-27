// Script to activate all users in the database

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function activateAllUsers() {
  const result = await prisma.user.updateMany({
    data: { isActive: true },
  });
  console.log(`Activated ${result.count} users.`);
  await prisma.$disconnect();
}

activateAllUsers().catch((e) => {
  console.error(e);
  process.exit(1);
});
