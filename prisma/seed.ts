import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@mogafinance.co.tz" },
    update: {},
    create: {
      email: "admin@mogafinance.co.tz",
      password: hashedPassword,
      name: "Admin Officer",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { nationalId: "19850312345001" },
      update: {},
      create: {
        firstName: "Grace",
        lastName: "Mwangi",
        dateOfBirth: new Date("1985-03-12"),
        nationalId: "19850312345001",
        email: "grace.mwangi@example.com",
        phone: "+255 712 345 001",
        address: "Plot 45, Sinza",
        city: "Dar es Salaam",
        employmentStatus: "EMPLOYED",
        employerName: "Tanzania Revenue Authority",
        monthlyIncome: 1200000,
      },
    }),
    prisma.customer.upsert({
      where: { nationalId: "19900617345002" },
      update: {},
      create: {
        firstName: "Joseph",
        lastName: "Kimaro",
        dateOfBirth: new Date("1990-06-17"),
        nationalId: "19900617345002",
        email: "joseph.kimaro@example.com",
        phone: "+255 713 456 002",
        address: "Msasani Peninsula, House 12",
        city: "Dar es Salaam",
        employmentStatus: "SELF_EMPLOYED",
        employerName: "Kimaro Hardware",
        monthlyIncome: 2500000,
      },
    }),
    prisma.customer.upsert({
      where: { nationalId: "19780922345003" },
      update: {},
      create: {
        firstName: "Amina",
        lastName: "Hassan",
        dateOfBirth: new Date("1978-09-22"),
        nationalId: "19780922345003",
        email: "amina.hassan@example.com",
        phone: "+255 714 567 003",
        address: "Kariakoo, Lindi St.",
        city: "Dar es Salaam",
        employmentStatus: "EMPLOYED",
        employerName: "CRDB Bank",
        monthlyIncome: 1800000,
      },
    }),
  ]);

  console.log(`✅ ${customers.length} customers created`);
  console.log("\n✨ Seed complete!");
  console.log("\n📋 Login credentials:");
  console.log("   Email:    admin@mogafinance.co.tz");
  console.log("   Password: admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
