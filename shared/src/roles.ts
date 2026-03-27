export const roles = [
  "admin",
  "teacher",
  "parent",
  "student",
  "accountant",
] as const;

export type Role = (typeof roles)[number];

export const rolePriority: Record<Role, number> = {
  admin: 100,
  teacher: 70,
  parent: 40,
  student: 30,
  accountant: 80,
};
