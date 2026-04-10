// Run with: node scripts/make-admin.mjs your@email.com
import { PrismaClient } from "../generated/prisma/client/default.js";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.log("Usage: node scripts/make-admin.mjs your@email.com");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const user = await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });
  console.log("Made admin:", user.email);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
