/**
 * One-time script: add top terpenes from Leafly to all products
 * Run: npx tsx scripts/update-strain-terpenes.ts
 */
import { config } from 'dotenv'
config({ path: '.env.production.local' })
config({ path: '.env.production' })
config({ path: '.env.local' })
config()
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter })

const updates: { nameContains: string; terpenes: string[] }[] = [
  // Flowers
  { nameContains: 'Zero Gravity',    terpenes: ['Terpinolen', 'Myrcen', 'Ocimen'] },
  { nameContains: 'White Widow',     terpenes: ['Myrcen', 'Karyofylen', 'Pinen'] },
  { nameContains: 'Tangie',          terpenes: ['Myrcen', 'Ocimen', 'Terpinolen'] },
  { nameContains: 'Sour Gorilla',    terpenes: ['Myrcen', 'Karyofylen', 'Limonen'] },
  { nameContains: 'Pineapple',       terpenes: ['Myrcen', 'Karyofylen', 'Pinen'] },
  { nameContains: 'Orange Tsunami',  terpenes: ['Myrcen', 'Limonen', 'Karyofylen'] },
  { nameContains: 'Bubblegum',       terpenes: ['Myrcen', 'Karyofylen', 'Limonen'] },
  { nameContains: 'Afghan',          terpenes: ['Myrcen', 'Karyofylen', 'Pinen'] },
  // Syringes
  { nameContains: 'Velvet Apricot',  terpenes: ['Myrcen', 'Terpinolen', 'Ocimen'] },
  { nameContains: 'Sweet Orange',    terpenes: ['Limonen', 'Myrcen', 'Karyofylen'] },
  { nameContains: 'Super Kush',      terpenes: ['Myrcen', 'Karyofylen', 'Humulen'] },
  { nameContains: 'Strawberry Jam',  terpenes: ['Myrcen', 'Karyofylen', 'Ocimen'] },
  { nameContains: 'Stinky Skunk',    terpenes: ['Myrcen', 'Karyofylen', 'Limonen'] },
  { nameContains: 'Raspberry Rush',  terpenes: ['Myrcen', 'Ocimen', 'Terpinolen'] },
  { nameContains: 'Peach Ice',       terpenes: ['Myrcen', 'Karyofylen', 'Linalool'] },
  { nameContains: 'Marocan',         terpenes: ['Myrcen', 'Karyofylen', 'Humulen'] },
  { nameContains: 'Lazy Lemon',      terpenes: ['Limonen', 'Myrcen', 'Terpinolen'] },
  { nameContains: 'Juicy Pear',      terpenes: ['Myrcen', 'Ocimen', 'Terpinolen'] },
  { nameContains: 'Chocolate Banana',terpenes: ['Myrcen', 'Karyofylen', 'Limonen'] },
  { nameContains: 'Cantaloupe',      terpenes: ['Myrcen', 'Ocimen', 'Terpinolen'] },
  { nameContains: 'Candy Ice Cream', terpenes: ['Myrcen', 'Linalool', 'Karyofylen'] },
  { nameContains: 'Bubble Hash',     terpenes: ['Myrcen', 'Karyofylen', 'Pinen'] },
  // Hash
  { nameContains: 'Red Hash',        terpenes: ['Myrcen', 'Karyofylen', 'Humulen'] },
  { nameContains: 'Dark Brown Hash', terpenes: ['Myrcen', 'Karyofylen', 'Humulen'] },
  { nameContains: 'Bounty Hash',     terpenes: ['Myrcen', 'Karyofylen', 'Limonen'] },
]

async function main() {
  let updated = 0
  for (const upd of updates) {
    const products = await db.product.findMany({
      where: { name: { contains: upd.nameContains, mode: 'insensitive' } },
      select: { id: true, name: true },
    })
    if (!products.length) {
      console.log(`⚠  Not found: "${upd.nameContains}"`)
      continue
    }
    for (const p of products) {
      await db.product.update({
        where: { id: p.id },
        data: { terpenes: upd.terpenes },
      })
      console.log(`✓  ${p.name}`)
      updated++
    }
  }
  console.log(`\nDone — ${updated} product(s) updated.`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
