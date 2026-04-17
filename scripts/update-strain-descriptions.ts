/**
 * One-time script: update product descriptions + sativa/indica % from Leafly data
 * Run: npx tsx --env-file=.env scripts/update-strain-descriptions.ts
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

const updates: {
  nameContains: string
  description: string
  sativaPercent?: number
  indicaPercent?: number
  strainType?: 'INDICA' | 'SATIVA' | 'HYBRID' | 'CBD'
}[] = [
  // ── Flowers (Květy) ────────────────────────────────────────────────────────
  {
    nameContains: 'Zero Gravity',
    strainType: 'HYBRID',
    sativaPercent: 50,
    indicaPercent: 50,
    description:
      'Vyvážený hybrid vzniklý unikátním křížením Holy Grail Kush a Smurfzilla. Zero Gravity přináší harmonickou euforii a kreativní rozlet, aniž by přehlušil mysl nebo tělo. Charakteristické svěží citrusové a bobulovité tóny doplněné jemnými jehličnatými podtóny. Ideální volba pro ty, kdo hledají vyvážený zážitek pro mysl i tělo.',
  },
  {
    nameContains: 'White Widow',
    strainType: 'HYBRID',
    sativaPercent: 60,
    indicaPercent: 40,
    description:
      'Jedna z nejslavnějších odrůd na světě, vyšlechtěná v 90. letech v Nizozemsku společností Green House Seeds. White Widow je výsledkem křížení brazilské sativa landrasy s jihoindickou indicou bohatou na pryskyřici. Hustá poupata pokrytá bílými krystaly signalizují výjimečnou potenci. Přináší euforické, povznášející a hovorné účinky s výraznou dřevitou a zemitou vůní.',
  },
  {
    nameContains: 'Tangie',
    strainType: 'SATIVA',
    sativaPercent: 70,
    indicaPercent: 30,
    description:
      'Oblíbená sativa vzniklá křížením California Orange a Skunk-1, přímý odkaz na legendární Tangerine Dream z 90. let. Tangie okamžitě pohltí osvěžující vůní mandarinky a citrusů. Přináší euforické a zaostřené účinky ideální pro kreativní aktivity a ranní použití. Dominantní terpény myrcene, terpinolene a pinene zajišťují výjimečný aromatický profil.',
  },
  {
    nameContains: 'Sour Gorilla',
    strainType: 'SATIVA',
    sativaPercent: 70,
    indicaPercent: 30,
    description:
      'Silná sativa vzniklá křížením legendárního GG4 (Gorilla Glue #4) a Sour Diesel. Sour Gorilla, známá také jako Gorilla Diesel, přináší razantní energetický nástup kombinovaný s kreativní jasností mysli. Charakteristická výraznou dieselovou a pryskyřičnatou vůní s pichlavými zemitými podtóny. Oblíbená mezi kreativci a aktivními uživateli.',
  },
  {
    nameContains: 'Pineapple',
    strainType: 'HYBRID',
    sativaPercent: 60,
    indicaPercent: 40,
    description:
      'Ikonický sativa-dominantní hybrid vzniklý křížením Trainwreck a Hawaiian. Pineapple Express je proslulý intenzivní tropickou vůní čerstvého ananasu a citrusů. Přináší dlouhotrvající energické a euforické účinky ideální pro ranní a odpolední použití. Výjimečná schopnost podpořit kreativitu, dobrou náladu a smysl pro humor.',
  },
  {
    nameContains: 'Orange Tsunami',
    strainType: 'HYBRID',
    sativaPercent: 40,
    indicaPercent: 60,
    description:
      'Hybridní kříženec Orange Crush a Blueberry s mírnou převahou indivy. Orange Tsunami uchvátí výraznou citrusovou vůní sladkých pomerančů s jemnými bobulovitými podtóny. Přináší vyvážené účinky kombinující mentální svěžest a energii s příjemnou tělesnou relaxací. Oblíbená odrůda pro uvolnění po náročném dni.',
  },
  {
    nameContains: 'Bubblegum',
    strainType: 'HYBRID',
    sativaPercent: 40,
    indicaPercent: 60,
    description:
      'Klasická indica-dominantní hybridní odrůda původem z Indiany, sbírající cannabis ocenění od roku 1994. Bubblegum okouzluje sladkými ovocnými vůněmi a chutí připomínající žvýkačku s květinovými a bobulovitými podtóny. Přináší příjemnou tělesnou relaxaci kombinovanou s euforií a povznášející náladou. Dokonalá volba pro večerní odpočinek.',
  },
  {
    nameContains: 'Afghan',
    strainType: 'INDICA',
    sativaPercent: 10,
    indicaPercent: 90,
    description:
      'Čistokrevná indica pocházející z horských oblastí Afghánistánu, kde rostly původní cannabis variety. Afghan (Afghani) je ceněna pro výjimečnou produkci pryskyřice, která se přenáší do potomků po celém světě. Poskytuje hlubokou tělesnou relaxaci, euforii a klidný spánek. Zemitá, dřevitá vůně s pichlavými jehličnatými a sladkými podtóny.',
  },

  // ── Syringes (concentrates) ────────────────────────────────────────────────
  {
    nameContains: 'Velvet Apricot',
    strainType: 'HYBRID',
    sativaPercent: 40,
    indicaPercent: 60,
    description:
      'Prémiový koncentrát s hedvábnou texturou a výraznou vůní zralých meruněk. Velvet Apricot je indica-dominantní extrakt přinášející příjemnou tělesnou relaxaci obalenou ve sladkých ovocných tónech. Výjimečná čistota extrakce zachovává plné spektrum terpenů pro autentický meruňkový profil. Ideální pro večerní chvíle klidu a pohody.',
  },
  {
    nameContains: 'Sweet Orange',
    strainType: 'HYBRID',
    sativaPercent: 60,
    indicaPercent: 40,
    description:
      'Sativa-dominantní koncentrát inspirovaný citrusovými odrůdami s výraznou vůní sladkého pomeranče a mandarinky. Sweet Orange přináší povznášející euforické účinky kombinované s příjemnou tělesnou relaxací. Limonenové terpény zajišťují intenzivní citrusový profil a přirozeně pozitivní náladu. Osvěžující volba pro aktivní část dne.',
  },
  {
    nameContains: 'Super Kush',
    strainType: 'INDICA',
    sativaPercent: 10,
    indicaPercent: 90,
    description:
      'Čistý indica koncentrát vzniklý z legendárního křížení Northern Lights #5 a Hindu Kush. Super Kush přináší jasnou mysl při hlubokém tělesném uvolnění — ideální pro ty, kteří hledají relaxaci bez přílišné sedace. Jemné mentolové, květinové a zemité tóny spolu s myrceneovým profilem zaručují uklidňující a příjemný zážitek.',
  },
  {
    nameContains: 'Strawberry Jam',
    strainType: 'SATIVA',
    sativaPercent: 70,
    indicaPercent: 30,
    description:
      'Sativa-dominantní koncentrát s intenzivní jahodovou vůní připomínající čerstvě uvařený džem. Strawberry Jam je inspirován legendárním Strawberry Cough, křížením Haze a Strawberry Fields. Přináší povznášející a energetické účinky s výraznou cerebrální euforií. Sladká jahodová chuť s bobulovými a tropickými podtóny potěší i nejnáročnější gurmány.',
  },
  {
    nameContains: 'Stinky Skunk',
    strainType: 'HYBRID',
    sativaPercent: 50,
    indicaPercent: 50,
    description:
      'Koncentrát inspirovaný legendárním Skunk #1 — odrůdou, která od konce 70. let formuje celosvětový cannabis trh. Stinky Skunk vychází z jedinečné kombinace genetik Afghani, Acapulco Gold a Colombian Gold. Výrazná pikantní, zemitá a pryskyřičnatá vůně s charakteristickým skunk aroma. Přináší kreativní euforii, povznášející náladu a energetickou pohodu.',
  },
  {
    nameContains: 'Raspberry Rush',
    strainType: 'SATIVA',
    sativaPercent: 70,
    indicaPercent: 30,
    description:
      'Sativa-dominantní koncentrát s výraznou malinovou a bobulovitou vůní. Raspberry Rush je inspirován Raspberry Cough, křížením kambodžské landrasy a ICE. Přináší čiré, povznášející účinky ideální pro produktivitu a kreativní aktivity. Sladká malinová chuť s jahodovými a tropickými podtóny zaručuje osvěžující zážitek.',
  },
  {
    nameContains: 'Peach Ice',
    strainType: 'HYBRID',
    sativaPercent: 50,
    indicaPercent: 50,
    description:
      'Hybridní koncentrát s osvěžující vůní čerstvých broskví a ledového čaje. Peach Ice Tea přináší příjemnou vyváženost mezi mentální svěžestí a tělesnou relaxací. Sladká broskevná chuť s jemnými citrusovými a ledovými podtóny — jako doušek studeného ledového čaje v horkém létě. Ideální pro odpolední relaxaci.',
  },
  {
    nameContains: 'Marocan',
    strainType: 'HYBRID',
    sativaPercent: 40,
    indicaPercent: 60,
    description:
      'Prémiový koncentrát inspirovaný tradiční marockou technikou zpracování hašiše. Marocan Hash vyniká charakteristickou zemitou a pryskyřičnatou vůní s jemnými kořeněnými a dřevitými podtóny. Přináší příjemnou tělesnou relaxaci a klidný mentální stav typický pro tradiční hašiš ze severní Afriky. Osvědčená klasika pro milovníky tradičních extraktů.',
  },
  {
    nameContains: 'Lazy Lemon',
    strainType: 'SATIVA',
    sativaPercent: 70,
    indicaPercent: 30,
    description:
      'Sativa koncentrát s výraznou vůní a chutí čerstvě loupané citronové kůry. Lazy Lemon je inspirován Lemon Haze, křížením Lemon Skunk a Silver Haze. Přináší veselé a euforické účinky povzbuzující kreativitu a hovornou náladu. Svěží citrusová chuť s limetkovými a pepřovými podtóny zaručuje osvěžující zážitek.',
  },
  {
    nameContains: 'Juicy Pear',
    strainType: 'HYBRID',
    sativaPercent: 55,
    indicaPercent: 45,
    description:
      'Hybridní koncentrát s osvěžující vůní šťavnaté hrušky a tropického ovoce. Juicy Pear přináší příjemnou vyváženost mezi energetickými a relaxačními účinky. Sladká a šťavnatá chuť čerstvé hrušky s jemnými citrusovými podtóny vás pohltí od prvního okamžiku. Oblíbená volba pro ty, kdo milují ovocné a sladké profily.',
  },
  {
    nameContains: 'Chocolate Banana',
    strainType: 'HYBRID',
    sativaPercent: 40,
    indicaPercent: 60,
    description:
      'Indica-dominantní hybridní koncentrát inspirovaný oblíbeným Banana Kush, křížením Ghost OG a Skunk Haze. Chocolate Banana okouzluje intenzivní vůní zralých banánů s čokoládovými a tropickými podtóny. Přináší příjemnou tělesnou relaxaci s euforií a hovornou náladou. Sladká, banánová a čokoládová chuť je neodolatelnou pochoutkou.',
  },
  {
    nameContains: 'Cantaloupe',
    strainType: 'SATIVA',
    sativaPercent: 65,
    indicaPercent: 35,
    description:
      'Sativa-dominantní koncentrát s výraznou vůní čerstvého cukrového melounu a tropického ovoce. Cantaloupe Melon přináší povznášející a kreativní účinky kombinované s příjemnou euforií a energií. Sladká a šťavnatá melounová chuť s tropickými podtóny — osvěžující volba pro aktivní a slunečné dny.',
  },
  {
    nameContains: 'Candy Ice Cream',
    strainType: 'HYBRID',
    sativaPercent: 25,
    indicaPercent: 75,
    description:
      'Indica-dominantní hybridní koncentrát inspirovaný legendárním Ice Cream Cake, křížením Wedding Cake a Gelato #33. Candy Ice Cream oslňuje krémovou vůní vanilky, sladkého těsta a jemného pepře. Přináší hlubokou tělesnou relaxaci a klidný mentální stav — ideální pro večerní a noční použití. Výjimečná sladká, máslová chuť jako dezert po náročném dni.',
  },
  {
    nameContains: 'Bubble Hash',
    strainType: 'HYBRID',
    sativaPercent: 50,
    indicaPercent: 50,
    description:
      'Tradiční vodní extrakt vyráběný metodou ledového propírání (bubble hash). Bubble Hash se vyznačuje výjimečnou čistotou a plným spektrem kanabinoidů a terpenů bez chemického zpracování. Zemitá pryskyřičnatá chuť a vůně původní odrůdy jsou zachovány v maximální míře. Autentický a čistý zážitek pro znalce tradičních extraktů.',
  },

  // ── Hash (Hašiš) ──────────────────────────────────────────────────────────
  {
    nameContains: 'Red Hash',
    strainType: 'INDICA',
    sativaPercent: 20,
    indicaPercent: 80,
    description:
      'Prémiový červený hašiš tradiční výroby z nejkvalitnějších afghánských a indických landras. Red Hash se vyznačuje charakteristickým červeno-hnědým zbarvením a bohatou, zemitou pryskyřičnatou vůní s kořeněnými a dřevitými podtóny. Přináší hlubokou tělesnou relaxaci, klidný mentální stav a euforii typickou pro kvalitní tradiční hašiš.',
  },
  {
    nameContains: 'Dark Brown Hash',
    strainType: 'INDICA',
    sativaPercent: 20,
    indicaPercent: 80,
    description:
      'Klasický tmavý hašiš tradiční receptury připomínající legendární marocký nebo afghánský hašiš. Dark Brown Hash se vyznačuje tmavě hnědým zbarvením a intenzivní zemitou, kořeněnou a dřevitou vůní. Jemné pryskyřičnaté tóny doprovázejí příjemnou tělesnou relaxaci a uklidňující mentální účinky. Osvědčená klasika pro milovníky tradičního hašiše.',
  },
  {
    nameContains: 'Bounty Hash',
    strainType: 'HYBRID',
    sativaPercent: 30,
    indicaPercent: 70,
    description:
      'Výběrový prémiový hašiš z nejkvalitnějších landras vybraných pro maximální obsah pryskyřice a terpenů. Bounty Hash se pyšní bohatou a komplexní pryskyřičnatou vůní se sladkými, zemitými a kořeněnými podtóny. Přináší hlubokou tělesnou relaxaci a euforické mentální uvolnění. Skutečná pochoutka pro náročné milovníky tradičního hašiše.',
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
      const data: any = { description: upd.description }
      if (upd.sativaPercent !== undefined) data.sativaPercent = upd.sativaPercent
      if (upd.indicaPercent !== undefined) data.indicaPercent = upd.indicaPercent
      if (upd.strainType !== undefined) data.strainType = upd.strainType
      await db.product.update({ where: { id: p.id }, data })
      console.log(`✓  Updated: ${p.name}`)
      updated++
    }
  }
  console.log(`\nDone — ${updated} product(s) updated.`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
