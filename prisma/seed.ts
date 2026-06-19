import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");

  await prisma.auctionBid.deleteMany();
  await prisma.block.deleteMany();
  await prisma.itemRequest.deleteMany();
  await prisma.forumPost.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.review.deleteMany();
  await prisma.report.deleteMany();
  await prisma.message.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.product.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.user.deleteMany();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be defined in the .env file.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Admin Super",
      password: passwordHash,
      role: "ADMIN",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNHGXXXN0HalBGzloxINZMMSzMyVOiycrqvk3PbqEwA_94KME1WyZakRq3Cz9UgL8LV99bJsX0aPVY8igwU1k-Rvo1c_u-3waxN0WJDoQ4P__hQ3IryOUWF4VAXzQOQoH7sLL6E6fGeLgYlkcwgJ0yjie3YnfVWSwlWNXCaMHl426zU3TfAf4aHUiW6yck9vnmExGyIX7G-6sDCBCqx7YZx7jVOW1iU-ZmqFi5EGNJ2SEsdG2kw-3w_bbRDAb2dyHPqyJYsPT_MAM",
      isVerified: true,
      isEmailVerified: true,
    },
  });

  console.log("Seeding complete successfully! Database contains only the initial admin user.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

