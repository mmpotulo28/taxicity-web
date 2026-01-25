"use client";
import React from "react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Accordion, AccordionItem } from "@heroui/react";

export default function FaqsPage() {
 return (
  <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-brand-yellow selection:text-black">
   <Navbar />

   <main className="pt-32 pb-20">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
     <div className="text-center mb-16">
      <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">Frequently Asked <span className="text-brand-yellow">Questions</span></h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
       Everything you need to know about using TaxiCiTi.
      </p>
     </div>

     <div className="space-y-12">
      <section>
       <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">General</h2>
       <Accordion selectionMode="multiple" variant="splitted">
        <AccordionItem key="1" aria-label="What is TaxiCiTi?" title="What is TaxiCiTi?">
         TaxiCiTi is a digital platform that connects commuters, taxi drivers, and fleet owners. We provide real-time tracking, cashless payments, and fleet management tools to modernize the minibus taxi industry.
        </AccordionItem>
        <AccordionItem key="2" aria-label="Is it free to use?" title="Is it free to use?">
         The app is free to download for passengers. You only pay for your taxi fare. Drivers and operators pay a small service fee for using the platform&apos;s management features.
        </AccordionItem>
        <AccordionItem key="3" aria-label="Where does TaxiCiTi operate?" title="Where does TaxiCiTi operate?">
         We are currently live in Gauteng, South Africa, with plans to expand to other provinces and African countries soon.
        </AccordionItem>
       </Accordion>
      </section>

      <section>
       <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">For Passengers</h2>
       <Accordion selectionMode="multiple" variant="splitted">
        <AccordionItem key="4" aria-label="How do I pay for my ride?" title="How do I pay for my ride?">
         You can pay using your digital wallet within the app. Top up your wallet via EFT, card, or voucher, and scan the QR code in the taxi to pay. We also support cash payments, but digital prevents change issues!
        </AccordionItem>
        <AccordionItem key="5" aria-label="Can I track my ride?" title="Can I track my ride?">
         Yes! Once you board a TaxiCiTi-enabled vehicle, you can share your live trip with friends and family for added safety.
        </AccordionItem>
       </Accordion>
      </section>

      <section>
       <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">For Drivers</h2>
       <Accordion selectionMode="multiple" variant="splitted">
        <AccordionItem key="6" aria-label="How do I join as a driver?" title="How do I join as a driver?">
         Download the TaxiCiTi Driver app and register. You will need to visit one of our verification centers with your valid PDP, ID, and vehicle documents to get activated.
        </AccordionItem>
        <AccordionItem key="7" aria-label="When do I get paid?" title="When do I get paid?">
         Earnings from digital payments are processed daily and settled into your bank account or TaxiCiTi wallet instantly.
        </AccordionItem>
       </Accordion>
      </section>
     </div>
    </div>
   </main>

   <Footer />
  </div>
 );
}
