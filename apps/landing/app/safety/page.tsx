import React from "react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Shield, MapPin, BadgeCheck, Phone, Video, AlertTriangle } from 'lucide-react';

export default function SafetyPage() {
 return (
  <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-brand-yellow selection:text-black">
   <Navbar />

   <main className="pt-32 pb-20">
    {/* Hero */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
     <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full mb-6">
      <Shield className="w-8 h-8" />
     </div>
     <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
      Your Safety is Our <span className="text-brand-yellow">Priority</span>
     </h1>
     <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
      We&apos;ve built a comprehensive safety suite to ensure peace of mind for every trip you take with TaxiCiTi.
     </p>
    </div>

    {/* Features Grid */}
    <section className="bg-gray-50 dark:bg-zinc-900/50 py-20">
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
       <SafetyCard
        icon={<BadgeCheck className="w-6 h-6" />}
        title="Vetted Drivers"
        description="Every driver undergoes a strict background check, including criminal record checks and valid PDP license verification."
       />
       <SafetyCard
        icon={<MapPin className="w-6 h-6" />}
        title="Live Trip Sharing"
        description="Share your live location and trip details with trusted contacts so they know exactly where you are."
       />
       <SafetyCard
        icon={<AlertTriangle className="w-6 h-6" />}
        title="In-App SOS"
        description="One-tap emergency button connects you directly to private security response and police services."
       />
       <SafetyCard
        icon={<Video className="w-6 h-6" />}
        title="Fleet Monitoring"
        description="Operators monitor vehicle speed and route adherence in real-time to prevent reckless driving."
       />
       <SafetyCard
        icon={<Phone className="w-6 h-6" />}
        title="24/7 Support"
        description="Our safety response team is available around the clock to assist with any incidents."
       />
       <SafetyCard
        icon={<Shield className="w-6 h-6" />}
        title="Insurance Cover"
        description="All trips on the TaxiCiTi platform are covered by passenger liability insurance."
       />
      </div>
     </div>
    </section>

    {/* CTA */}
    <section className="py-20">
     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Report a Safety Concern</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
       If you experienced an incident or have a safety suggestion, please reach out to our dedicated safety team immediately.
      </p>
      <div className="flex gap-4 justify-center">
       <Link href="/contact" className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full hover:opacity-80 transition-opacity">
        Contact Support
       </Link>
       <a href="tel:10111" className="px-8 py-3 border border-red-500 text-red-500 font-bold rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
        Emergency Police
       </a>
      </div>
     </div>
    </section>
   </main>

   <Footer />
  </div>
 );
}

function SafetyCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
 return (
  <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
   <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mb-6">
    {icon}
   </div>
   <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
   <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
    {description}
   </p>
  </div>
 )
}
