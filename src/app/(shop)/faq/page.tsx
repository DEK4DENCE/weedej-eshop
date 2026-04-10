'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Jsou vaše produkty legální v České republice?',
    a: 'Ano. Všechny naše produkty splňují požadavky českého a evropského práva. Obsah THC v produktech nepřesahuje zákonem stanovenou hranici. Prodáváme výhradně legální konopné produkty.',
  },
  {
    q: 'Musím být plnoletý, abych mohl nakupovat?',
    a: 'Ano. Naše produkty jsou určeny výhradně pro osoby starší 18 let. Odesláním objednávky potvrzujete, že jste dosáhli věku 18 let. Vyhrazujeme si právo požadovat ověření věku.',
  },
  {
    q: 'Jak dlouho trvá doručení?',
    a: 'Objednávky expedujeme do 1–2 pracovních dnů od přijetí platby. Standardní dodací lhůta je 2–3 pracovní dny po expedici. Zásilky jsou baleny diskrétně bez označení obsahu.',
  },
  {
    q: 'Jaké jsou možnosti platby?',
    a: 'Přijímáme platební a kreditní karty (Visa, Mastercard), Apple Pay a Google Pay. Platby jsou zpracovávány bezpečně přes Stripe — vaše platební údaje nikdy neprochází naším serverem.',
  },
  {
    q: 'Mohu vrátit zboží?',
    a: 'Ano. Máte právo odstoupit od smlouvy bez udání důvodu do 14 dnů od převzetí zboží. Zboží musí být neotevřené a v původním obalu. Náklady na vrácení hradí zákazník. Peníze vám vrátíme do 14 dnů od doručení vráceného zboží.',
  },
  {
    q: 'Jak jsou produkty testovány?',
    a: 'Všechny naše produkty procházejí laboratorním testováním. Testuje se obsah kanabinoidů (CBD, THC), přítomnost pesticidů, těžkých kovů a mikrobiologická čistota. Certifikáty jsou k dispozici na vyžádání.',
  },
  {
    q: 'Jaký je rozdíl mezi CBD a THC produkty?',
    a: 'CBD (kanabidiol) je nepsychoaktivní kanabinoid, neovlivňuje vnímání. THC (tetrahydrokanabinol) je psychoaktivní složka konopí. Naše produkty s THC nepřekračují zákonnou hranici a jsou klasifikovány jako konopí s nízkým obsahem THC.',
  },
  {
    q: 'Co znamenají označení Sativa, Indica a Hybrid?',
    a: 'Sativa odrůdy jsou spojovány s povzbuzujícími efekty, Indica s relaxačními. Hybrid je křížení obou. CBD produkty jsou klasifikovány zvlášť bez ohledu na poměr Sativa/Indica. Tyto informace slouží jako orientační.',
  },
  {
    q: 'Jak mám produkty skladovat?',
    a: 'Doporučujeme skladovat v chladu, temnu a suchu, mimo dosah dětí. Ideální teplota je 15–21 °C při relativní vlhkosti 59–63 %. Vyhněte se přímému slunečnímu záření a nadměrné vlhkosti.',
  },
  {
    q: 'Jak mohu kontaktovat zákaznickou podporu?',
    a: 'Napište nám na info@weedej.cz nebo zavolejte na +420 792 342 324. Pracovní dny 9:00–17:00. Případně využijte kontaktní formulář na stránce Kontakt.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#DEE2E6] last:border-0">
      <button
        className="flex items-center justify-between w-full py-4 text-left gap-4"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-[#1d1d1f]">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-[#2E7D32]"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.2, ease: [0.55, 0, 1, 0.45] } }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-[#6e6e73] leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <p className="text-xs font-semibold uppercase tracking-widest text-[#2E7D32] mb-2">Pomoc</p>
      <h1 className="text-3xl font-bold font-playfair text-[#1d1d1f] mb-2">Časté dotazy</h1>
      <p className="text-[#6e6e73] mb-10">Nenašli jste odpověď? Napište nám na{' '}
        <a href="mailto:info@weedej.cz" className="text-[#2E7D32] hover:underline">info@weedej.cz</a>.
      </p>
      <div className="bg-white rounded-2xl border border-[#DEE2E6] px-6 shadow-sm">
        {faqs.map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  )
}
