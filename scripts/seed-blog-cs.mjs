import pg from 'pg'
const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const posts = [
  {
    id: 'blog-thcx-001',
    title: 'THC-X: Co je nový kanabinoind a jak funguje?',
    slug: 'thc-x-novy-kanabinoind',
    excerpt: 'THC-X je nový syntetický derivát THC, který se v posledních letech objevuje na trhu s CBD produkty. Co ho odlišuje od běžného THC a jaké jsou jeho účinky?',
    content: `# THC-X: Co je nový kanabinoind a jak funguje?

## Úvod

V rychle se rozvíjejícím světě kanabinoidů se neustále objevují nové látky, které přitahují pozornost vědců i spotřebitelů. Jedním z nejdiskutovanějších nováčků je **THC-X** – látka, která kombinuje vlastnosti tradičního THC s unikátními chemickými modifikacemi.

## Co je THC-X?

THC-X (hexahydrokanabinoidy acetátový derivát) je polosyntetický kanabinoind vytvořený chemickou úpravou přírodního THC. Na rozdíl od běžného delta-9 THC má THC-X odlišnou molekulární strukturu, která ovlivňuje způsob, jakým se váže na endokanabinoidní receptory v lidském těle.

Klíčové vlastnosti THC-X:
- **Vyšší lipofilita** – lépe proniká buněčnými membránami
- **Delší poločas rozpadu** – účinky mohou trvat déle
- **Odlišná vazba na CB1 a CB2 receptory** – jiný profil účinků oproti klasickému THC

## Jak THC-X působí na tělo?

THC-X se váže primárně na CB1 receptory v mozku a centrální nervové soustavě. Výzkumy naznačují, že jeho psychoaktivní potenciál může být až **1,5–2× vyšší** než u delta-9 THC, avšak s méně anxiogenními vedlejšími účinky.

Uživatelé mohou pociťovat:
- Relaxaci a uvolnění svalového napětí
- Mírnou euforii bez výrazné paranoi
- Zlepšení nálady a snížení stresu
- Podporu spánku

## Právní status THC-X v ČR

V České republice se THC-X nachází v **právní šedé zóně**. Zákon o návykových látkách reguluje specifické sloučeniny, nikoliv obecné chemické třídy. THC-X není výslovně uveden v seznamu zakázaných látek, avšak jeho status se může měnit v závislosti na interpretaci zákona.

> **Důležité upozornění:** Legislativa v oblasti nových syntetických kanabinoidů se rychle vyvíjí. Vždy se informujte o aktuálním právním stavu před zakoupením produktů obsahujících THC-X.

## THC-X vs. CBD: Klíčové rozdíly

| Vlastnost | CBD | THC-X |
|-----------|-----|-------|
| Psychoaktivita | Žádná | Střední až vysoká |
| Právní status v ČR | Legální (do 1% THC) | Nejasný |
| Terapeutické využití | Rozsáhlé | Výzkum probíhá |
| Dostupnost | Běžně dostupný | Omezená |

## Bezpečnost a rizika

Jako u každého nového kanabinoidu platí, že **dlouhodobé studie bezpečnosti THC-X jsou stále omezené**. Odborníci doporučují:

1. Začínat s velmi malými dávkami
2. Nekombinovat s alkoholem ani jinými látkami
3. Neřidit vozidlo po užití
4. Konzultovat s lékařem při užívání léků

## Závěr

THC-X představuje fascinující oblast výzkumu kanabinoidů. Pro spotřebitele je klíčové nakupovat od ověřených dodavatelů, kteří poskytují certifikáty o složení a čistotě produktů.

Na **Weedej** nabízíme pouze produkty s jasnou dokumentací a laboratorními testy.`,
    published: true,
  },
  {
    id: 'blog-legalizace-002',
    title: 'Legalizace konopí v České republice: Kde jsme a kam směřujeme?',
    slug: 'legalizace-konopi-ceska-republika',
    excerpt: 'Česká republika patří k nejvstřícnějším zemím EU v otázce konopí. Jak vypadá aktuální právní rámec, co se mění a jaký je výhled do budoucna?',
    content: `# Legalizace konopí v České republice: Kde jsme a kam směřujeme?

## Historický kontext

Česká republika má dlouhou historii relativně tolerantního přístupu ke konopí. Již od roku **2010** dekriminalizovala držení malého množství konopí pro osobní potřebu, čímž se zařadila mezi nejliberálnější země Evropy.

## Aktuální právní stav (2024–2025)

### Co je legální

V současné době je v ČR legální:
- **CBD produkty** s obsahem THC do 1 % (od roku 2022 zvýšeno z 0,3 %)
- Pěstování průmyslového konopí s obsahem THC do 1 %
- Držení do 10 g konopí pro osobní potřebu (přestupek, nikoliv trestný čin)
- Lékařské konopí pro registrované pacienty (od roku 2013)

### Co zůstává trestné
- Prodej a distribuce konopí s THC nad 1 %
- Pěstování konopí pro rekreační účely bez licence
- Dovoz a vývoz konopí bez povolení

## Nový zákon o konopí 2025

Česká vláda schválila rámcový zákon o regulaci konopí, který by měl vstoupit v platnost v průběhu roku **2025–2026**. Zákon počítá s:

### Regulovaným trhem pro dospělé
- Prodej v licencovaných prodejnách osobám starším 18 let
- Státní regulace pěstování, zpracování a distribuce
- Daňové povinnosti pro prodejce
- Omezení reklamy a marketingu

### Systémem licencí
Zákon rozlišuje tři typy licencí:
1. **Pěstitelská licence** – pro farmáře a pěstitelské společnosti
2. **Zpracovatelská licence** – pro výrobu produktů
3. **Maloobchodní licence** – pro prodejny

## Srovnání s okolními zeměmi

| Země | Status | Detaily |
|------|--------|---------|
| ČR | Pokročilá dekriminalizace | Nový zákon připravován |
| Německo | Částečná legalizace | Osobní pěstování povoleno od 2024 |
| Slovensko | Dekriminalizace | Omezená tolerance |
| Rakousko | Dekriminalizace | CBD volně dostupný |
| Polsko | Přísná regulace | Pouze lékařské konopí |

## Ekonomický potenciál

Odborné studie odhadují, že regulovaný trh s konopím by mohl do české ekonomiky přinést:
- **Daňové příjmy:** 3–5 miliard Kč ročně
- **Nová pracovní místa:** 15 000–25 000 pozic
- **Snížení nákladů** na vymáhání prohibičních zákonů

## Co to znamená pro CBD trh?

Pro etablované prodejce CBD produktů jako **Weedej** přináší postupná legalizace:
- Větší jistotu pro investice a rozvoj
- Přísnější regulaci kvality – výhoda pro poctivé prodejce
- Rozšíření sortimentu v budoucnu
- Profesionalizaci celého odvětví

## Závěr

Česká republika je na prahu historické změny v přístupu ke konopí. Sledujte náš blog pro nejnovější informace o legislativních změnách, které ovlivňují trh s konopnými produkty.`,
    published: true,
  },
  {
    id: 'blog-limity-003',
    title: 'Aktuální legislativní limity THC v ČR: Kompletní průvodce',
    slug: 'legislativni-limity-thc-cr',
    excerpt: 'Jaké jsou platné limity obsahu THC v konopných produktech v České republice? Průvodce pro spotřebitele i podnikatele v CBD sektoru.',
    content: `# Aktuální legislativní limity THC v ČR: Kompletní průvodce

## Základní limit: 1 % THC

Od **1. února 2022** platí v České republice nová pravidla pro obsah THC v konopných produktech. Klíčová změna: zvýšení maximálního povoleného obsahu THC z původních **0,3 %** na **1,0 %** v sušině průmyslového konopí a výrobcích z něj.

## Přehled limitů podle typu produktu

### Rostlinný materiál (květy, listy)
- **Maximální obsah THC:** 1,0 % v sušině
- **Testování:** Povinné akreditovanou laboratoří
- **Certifikace:** COA (Certificate of Analysis) musí doprovázet každou šarži

### Extrakty a koncentráty
- **CBD oleje:** Do 1 % THC celkového obsahu
- **Vosky a roziny:** Do 1 % THC
- **Izolát CBD:** Prakticky 0 % THC (99%+ čistý CBD)

### Potraviny a doplňky stravy
- **CBD kapsle, gumičky:** THC nesmí přesahovat 1 mg na denní dávku
- **CBD čaje:** THC dle obecného limitu 1 %

## Jak se THC testuje?

### Metody analýzy
Akreditované laboratoře v ČR používají tyto metody:

1. **HPLC** – Vysokoúčinná kapalinová chromatografie, nejpřesnější metoda, standard v EU
2. **GC-MS** – Plynová chromatografie s hmotnostní spektrometrií
3. **HPTLC** – Rychlá screeningová metoda

### Celkový THC vs. delta-9 THC
- **Delta-9 THC** – přímý psychoaktivní kanabinoind
- **THCA** – kyselá forma, přeměňuje se na THC při zahřátí
- **Celkový THC** = delta-9 THC + (THCA × 0,877)

Zákon v ČR reguluje **celkový THC**, nikoliv pouze delta-9.

## Sankce při překročení limitů

### Pro prodejce
- Správní pokuta až **5 000 000 Kč** za uvádění nevyhovujících produktů
- Stažení produktů z prodeje
- Odebrání licence

### Pro spotřebitele

| Množství | Klasifikace | Sankce |
|----------|-------------|--------|
| Do 10 g | Přestupek | Pokuta do 15 000 Kč |
| 10–25 g | Přestupek/trestný čin | Dle okolností |
| Nad 25 g | Trestný čin | Odnětí svobody |

## Jak poznáte legální CBD produkt?

### ✅ Povinné náležitosti
1. **COA certifikát** – laboratorní analýza od akreditované laboratoře
2. **Datum výroby a expirace** produktu
3. **Složení** – seznam všech kanabinoidů
4. **Výrobce nebo dovozce** – sídlo v EU
5. **Varování** pro těhotné, kojící a osoby pod 18 let

### ❌ Varovné signály
- Chybějící nebo zastaralý COA certifikát
- Nejasný původ produktu
- Extrémně nízká cena
- Zdravotní tvrzení bez vědeckého podkladu

## Nové trendy: Novel Food a EU regulace

EU stále pracuje na komplexní regulaci CBD jako tzv. **Novel Food**. To ovlivní:
- Registrační povinnosti pro výrobce
- Maximální denní dávky CBD v potravinách
- Způsob označování produktů

Předpokládaný termín plné implementace: **2025–2026**

## Závěr

Základní pravidlo je jasné: **limit 1 % THC** platí pro většinu produktů na českém trhu. Při nákupu vždy vyžadujte laboratorní certifikát.

Všechny produkty **Weedej** splňují aktuální české i evropské legislativní požadavky:
- ✅ Obsah THC pod 1 % u všech produktů
- ✅ Certifikáty COA dostupné na vyžádání
- ✅ Produkty od prověřených evropských výrobců

Máte otázky? Neváhejte nás kontaktovat přes [stránku kontaktů](/contact).`,
    published: true,
  },
]

for (const post of posts) {
  await pool.query(
    `INSERT INTO "BlogPost" (id, title, slug, excerpt, content, published, "publishedAt", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())
     ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, slug=EXCLUDED.slug, excerpt=EXCLUDED.excerpt, content=EXCLUDED.content, published=EXCLUDED.published, "updatedAt"=NOW()`,
    [post.id, post.title, post.slug, post.excerpt, post.content, post.published]
  )
  console.log('✓ Uloženo:', post.title)
}

await pool.end()
console.log('Hotovo!')
