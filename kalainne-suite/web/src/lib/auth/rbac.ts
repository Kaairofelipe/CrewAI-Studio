import type { Role } from "@prisma/client";

export const rolePolicies: Record<Role, string[]> = {
  admin: ["*"],
  marketing: [
    "view:dashboard",
    "read:scripts",
    "write:scripts",
    "read:campaigns",
    "write:campaigns",
    "execute:ai",
    "read:leads",
  ],
  consultor: [
    "view:dashboard",
    "read:scripts",
    "read:campaigns",
    "read:leads",
    "write:leads",
    "execute:ai",
  ],
  regulatorio: [
    "view:dashboard",
    "read:claims",
    "write:claims",
    "read:scripts",
    "review:content",
  ],
};

export function hasPermission(role: Role, permission: string) {
  const policy = rolePolicies[role];
  return policy.includes("*") || policy.includes(permission);
}
