/**
 * One-time script: add top effects + top flavors from Leafly to all products
 * Run: npx tsx scripts/update-strain-effects.ts
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

const updates: { nameContains: string; effects: string[]; flavours: string[] }[] = [
  // Flowers
  {
    nameContains: 'Zero Gravity',
    effects:  ['Euforický', 'Kreativní', 'Energický'],
    flavours: ['Citron', 'Borůvka', 'Borovice'],
  },
  {
    nameContains: 'White Widow',
    effects:  ['Euforický', 'Povznášející', 'Hovorný'],
    flavours: ['Dřevo', 'Země', 'Květiny'],
  },
  {
    nameContains: 'Tangie',
    effects:  ['Energický', 'Soustředěný', 'Povznášející'],
    flavours: ['Pomeranč', 'Citrus', 'Meruňka'],
  },
  {
    nameContains: 'Sour Gorilla',
    effects:  ['Energický', 'Kreativní', 'Soustředěný'],
    flavours: ['Diesel', 'Borovice', 'Země'],
  },
  {
    nameContains: 'Pineapple',
    effects:  ['Šťastný', 'Veselý', 'Energický'],
    flavours: ['Ananas', 'Tropické', 'Citrus'],
  },
  {
    nameContains: 'Orange Tsunami',
    effects:  ['Energický', 'Kreativní', 'Uvolněný'],
    flavours: ['Citrus', 'Pomeranč', 'Vanilka'],
  },
  {
    nameContains: 'Bubblegum',
    effects:  ['Šťastný', 'Uvolněný', 'Euforický'],
    flavours: ['Sladký', 'Bobule', 'Květiny'],
  },
  {
    nameContains: 'Afghan',
    effects:  ['Uvolněný', 'Euforický', 'Ospalý'],
    flavours: ['Země', 'Dřevo', 'Borovice'],
  },
  {
    nameContains: 'Sour Gorilla',
    effects:  ['Energický', 'Kreativní', 'Soustředěný'],
    flavours: ['Diesel', 'Borovice', 'Země'],
  },
  // Syringes
  {
    nameContains: 'Velvet Apricot',
    effects:  ['Uvolněný', 'Euforický', 'Šťastný'],
    flavours: ['Meruňka', 'Sladký', 'Ovoce'],
  },
  {
    nameContains: 'Sweet Orange',
    effects:  ['Uvolněný', 'Šťastný', 'Euforický'],
    flavours: ['Pomeranč', 'Citrus', 'Sladký'],
  },
  {
    nameContains: 'Super Kush',
    effects:  ['Uvolněný', 'Šťastný', 'Hladový'],
    flavours: ['Mentol', 'Květiny', 'Země'],
  },
  {
    nameContains: 'Strawberry Jam',
    effects:  ['Povznášející', 'Energický', 'Šťastný'],
    flavours: ['Jahoda', 'Sladký', 'Bobule'],
  },
  {
    nameContains: 'Stinky Skunk',
    effects:  ['Hladový', 'Šťastný', 'Kreativní'],
    flavours: ['Skunk', 'Pikantní', 'Země'],
  },
  {
    nameContains: 'Raspberry Rush',
    effects:  ['Soustředěný', 'Povznášející', 'Energický'],
    flavours: ['Malina', 'Sladký', 'Jahoda'],
  },
  {
    nameContains: 'Peach Ice',
    effects:  ['Šťastný', 'Uvolněný', 'Kreativní'],
    flavours: ['Broskev', 'Sladký', 'Citrus'],
  },
  {
    nameContains: 'Marocan',
    effects:  ['Uvolněný', 'Ospalý', 'Euforický'],
    flavours: ['Země', 'Koření', 'Dřevo'],
  },
  {
    nameContains: 'Lazy Lemon',
    effects:  ['Šťastný', 'Kreativní', 'Euforický'],
    flavours: ['Citron', 'Citrus', 'Limetka'],
  },
  {
    nameContains: 'Juicy Pear',
    effects:  ['Šťastný', 'Uvolněný', 'Euforický'],
    flavours: ['Hruška', 'Sladký', 'Tropické'],
  },
  {
    nameContains: 'Chocolate Banana',
    effects:  ['Uvolněný', 'Hovorný', 'Euforický'],
    flavours: ['Banán', 'Čokoláda', 'Tropické'],
  },
  {
    nameContains: 'Cantaloupe',
    effects:  ['Šťastný', 'Kreativní', 'Energický'],
    flavours: ['Meloun', 'Sladký', 'Tropické'],
  },
  {
    nameContains: 'Candy Ice Cream',
    effects:  ['Ospalý', 'Uvolněný', 'Hladový'],
    flavours: ['Vanilka', 'Máslo', 'Sladký'],
  },
  {
    nameContains: 'Bubble Hash',
    effects:  ['Uvolněný', 'Euforický', 'Šťastný'],
    flavours: ['Země', 'Borovice', 'Dřevo'],
  },
  // Hash
  {
    nameContains: 'Red Hash',
    effects:  ['Uvolněný', 'Ospalý', 'Euforický'],
    flavours: ['Země', 'Koření', 'Borovice'],
  },
  {
    nameContains: 'Dark Brown Hash',
    effects:  ['Uvolněný', 'Ospalý', 'Euforický'],
    flavours: ['Země', 'Dřevo', 'Koření'],
  },
  {
    nameContains: 'Bounty Hash',
    effects:  ['Uvolněný', 'Euforický', 'Šťastný'],
    flavours: ['Země', 'Sladký', 'Borovice'],
  },
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
        data: { effects: upd.effects, flavours: upd.flavours },
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
