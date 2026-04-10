// Promotes a user to admin role
// Usage: node scripts/make-admin.mjs your@email.com

import { execSync } from "child_process";

const email = process.argv[2];
if (!email) {
  console.log("Usage: node scripts/make-admin.mjs your@email.com");
  process.exit(1);
}

const sql = `UPDATE User SET role = 'admin' WHERE email = '${email.replace(/'/g, "''")}';`;

try {
  execSync(`npx prisma db execute --stdin`, {
    input: sql,
    cwd: process.cwd(),
    stdio: ["pipe", "inherit", "inherit"],
  });
  console.log("Made admin:", email);
} catch {
  console.error("Failed to promote user:", email);
  process.exit(1);
}
