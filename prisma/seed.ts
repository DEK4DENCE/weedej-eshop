import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import "dotenv/config"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // Categories
  const flowers = await prisma.category.upsert({
    where: { slug: "flowers" },
    update: {},
    create: { name: "Flowers", slug: "flowers", description: "Premium cannabis flowers" },
  })
  const extracts = await prisma.category.upsert({
    where: { slug: "extracts" },
    update: {},
    create: { name: "Extracts", slug: "extracts", description: "Concentrates and extracts" },
  })
  const edibles = await prisma.category.upsert({
    where: { slug: "edibles" },
    update: {},
    create: { name: "Edibles", slug: "edibles", description: "CBD-infused foods" },
  })

  // Products
  const products = [
    {
      name: "Blue Dream",
      slug: "blue-dream",
      description: "A sativa-dominant hybrid with blueberry aroma. Smooth, balanced high with creative energy.",
      categoryId: flowers.id,
      thcContent: 21.0,
      cbdContent: 0.1,
      imageUrls: ["https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=800"],
      variants: [
        { name: "1g", price: 12.99, stock: 50, sku: "blue-dream-1g" },
        { name: "3.5g", price: 39.99, stock: 30, sku: "blue-dream-3.5g" },
        { name: "7g", price: 74.99, stock: 20, sku: "blue-dream-7g" },
      ],
    },
    {
      name: "OG Kush",
      slug: "og-kush",
      description: "Classic indica-leaning hybrid. Earthy pine and sour lemon with woody undertones.",
      categoryId: flowers.id,
      thcContent: 23.5,
      cbdContent: 0.2,
      imageUrls: ["https://images.unsplash.com/photo-1617839625591-e5a789593135?w=800"],
      variants: [
        { name: "1g", price: 14.99, stock: 40, sku: "og-kush-1g" },
        { name: "3.5g", price: 44.99, stock: 25, sku: "og-kush-3.5g" },
      ],
    },
    {
      name: "CBD Isolate Powder",
      slug: "cbd-isolate-powder",
      description: "99%+ pure CBD isolate. Odorless and tasteless, perfect for any consumption method.",
      categoryId: extracts.id,
      thcContent: 0.0,
      cbdContent: 99.0,
      imageUrls: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800"],
      variants: [
        { name: "500mg", price: 24.99, stock: 100, sku: "cbd-isolate-500mg" },
        { name: "1000mg", price: 44.99, stock: 60, sku: "cbd-isolate-1000mg" },
      ],
    },
    {
      name: "CBD Gummies",
      slug: "cbd-gummies",
      description: "Delicious fruit-flavored gummies with 25mg CBD each. Perfect for daily wellness.",
      categoryId: edibles.id,
      thcContent: 0.0,
      cbdContent: 25.0,
      imageUrls: ["https://images.unsplash.com/photo-1582499668609-4461f3b8a5a3?w=800"],
      variants: [
        { name: "10 pieces", price: 19.99, stock: 80, sku: "cbd-gummies-10pc" },
        { name: "30 pieces", price: 49.99, stock: 50, sku: "cbd-gummies-30pc" },
      ],
    },
    {
      name: "Girl Scout Cookies",
      slug: "girl-scout-cookies",
      description: "Sweet and earthy with hints of mint and cherry. Famous for full-body relaxation.",
      categoryId: flowers.id,
      thcContent: 25.0,
      cbdContent: 0.1,
      imageUrls: ["https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=800"],
      variants: [
        { name: "1g", price: 15.99, stock: 35, sku: "gsc-1g" },
        { name: "3.5g", price: 49.99, stock: 20, sku: "gsc-3.5g" },
      ],
    },
    {
      name: "Full Spectrum CBD Oil",
      slug: "full-spectrum-cbd-oil",
      description: "1000mg CBD with full spectrum terpene profile. Sublingual drops for fast absorption.",
      categoryId: extracts.id,
      thcContent: 0.2,
      cbdContent: 10.0,
      imageUrls: ["https://images.unsplash.com/photo-1579991028491-65a72cfed7e7?w=800"],
      variants: [
        { name: "30ml", price: 39.99, stock: 70, sku: "cbd-oil-30ml" },
        { name: "60ml", price: 69.99, stock: 40, sku: "cbd-oil-60ml" },
      ],
    },
  ]

  for (const productData of products) {
    const { variants, ...data } = productData
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: { ...data, isActive: true, isFeatured: true },
    })
    for (const variant of variants) {
      await prisma.productVariant.upsert({
        where: { sku: variant.sku },
        update: {},
        create: { ...variant, productId: product.id },
      })
    }
  }

  // Admin user
  const adminPasswordHash = await bcrypt.hash("Admin123!", 12)
  await prisma.user.upsert({
    where: { email: "admin@weedejna.cz" },
    update: {},
    create: {
      email: "admin@weedejna.cz",
      name: "Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  })

  // Test customer
  const customerPasswordHash = await bcrypt.hash("Customer123!", 12)
  await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      emailVerified: new Date(),
      dateOfBirth: new Date("1990-01-01"),
    },
  })

  console.log("Seeding complete!")
}

main().catch(console.error).finally(() => prisma.$disconnect())
