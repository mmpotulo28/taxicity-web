import React from "react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, Shield, Smartphone, Zap, MapPin, Users, BarChart3 } from 'lucide-react';

export default function Home() {
 return (
  <div className="min-h-screen bg-white">
   <Navbar />

   {/* Hero Section */}
   <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
     <div className="text-center max-w-3xl mx-auto">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
       The Future of <br className="hidden md:block" />
       <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
        Shared Transit
       </span>
      </h1>
      <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto">
       TaxiCiTi digitizes the taxi industry, connecting commuters, drivers, and operators on a single, secure platform.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
       <Link
        href="#download"
        className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all bg-black rounded-full hover:bg-gray-800 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-1"
       >
        Get Started
        <ArrowRight className="ml-2 w-5 h-5" />
       </Link>
       <Link
        href="https://app.taxyciti.net"
        className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 transition-all bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300"
       >
        Web App
       </Link>
      </div>
     </div>
    </div>

    {/* Background blobs */}
    <div className="absolute top-0 transform -translate-x-1/2 left-1/2 w-full h-full max-w-7xl pointer-events-none opacity-40">
     <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
     <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
     <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
    </div>
   </section>

   {/* Stats/Social Proof */}
   <section className="py-12 border-y border-gray-100 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
     <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      <div>
       <div className="text-3xl font-bold text-gray-900 mb-1">10k+</div>
       <div className="text-sm text-gray-500">Daily Commuters</div>
      </div>
      <div>
       <div className="text-3xl font-bold text-gray-900 mb-1">500+</div>
       <div className="text-sm text-gray-500">Active Taxis</div>
      </div>
      <div>
       <div className="text-3xl font-bold text-gray-900 mb-1">99%</div>
       <div className="text-sm text-gray-500">Uptime</div>
      </div>
      <div>
       <div className="text-3xl font-bold text-gray-900 mb-1">24/7</div>
       <div className="text-sm text-gray-500">Support</div>
      </div>
     </div>
    </div>
   </section>

   {/* Features Grid */}
   <section id="features" className="py-24 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
     <div className="text-center mb-16">
      <h2 className="text-brand-primary text-sm font-semibold tracking-wide uppercase text-primary-600 mb-2">Features</h2>
      <h3 className="text-3xl font-bold text-gray-900 sm:text-4xl">Everything you need to ride smarter</h3>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <FeatureCard
       icon={<MapPin className="w-6 h-6 text-white" />}
       title="Live Tracking"
       description="Real-time location sharing for passengers and operators. Know exactly where your ride is."
       color="bg-blue-500"
      />
      <FeatureCard
       icon={<Shield className="w-6 h-6 text-white" />}
       title="Safety First"
       description="Verified drivers, emergency contacts, and safe trip monitoring features built-in."
       color="bg-indigo-500"
      />
      <FeatureCard
       icon={<Zap className="w-6 h-6 text-white" />}
       title="Cashless Payments"
       description="Pay with your phone using digital wallet. No more scrambling for change."
       color="bg-brand-yellow"
       textColor="text-black"
      />
     </div>
    </div>
   </section>

   {/* App Downloads Section */}
   <section id="download" className="py-24 bg-white overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
     <div className="bg-gradient-to-225 from-gray-900 to-gray-800 rounded-3xl p-8 md:p-16 text-center md:text-left relative overflow-hidden">

      <div className="relative z-10 max-w-2xl">
       <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
        Get the TaxiCiTi Apps
       </h2>
       <p className="text-gray-300 text-lg mb-8">
        Whether you&apos;re a passenger, driver, or fleet operator, we have the right tools for you.
       </p>

       <div className="space-y-6">
        {/* Commuter/User */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
         <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
           <div className="p-3 bg-primary-500 rounded-lg">
            <Smartphone className="w-6 h-6 text-white" />
           </div>
           <div className="text-left">
            <h4 className="text-white font-semibold text-lg">For Commuters</h4>
            <p className="text-gray-400 text-sm">Book rides, track taxis, pay digitally.</p>
           </div>
          </div>
          <div className="flex gap-2">
           <Link href="https://app.taxyciti.net" target="_blank" className="px-5 py-2.5 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
            Web App
           </Link>
           <Link href="#" className="px-5 py-2.5 bg-transparent border border-white/30 text-white rounded-lg font-medium text-sm hover:bg-white/10 transition-colors">
            App Store
           </Link>
          </div>
         </div>
        </div>

        {/* Driver */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
         <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
           <div className="p-3 bg-brand-yellow rounded-lg">
            <Users className="w-6 h-6 text-black" />
           </div>
           <div className="text-left">
            <h4 className="text-white font-semibold text-lg">For Drivers</h4>
            <p className="text-gray-400 text-sm">Manage trips, earnings, and navigation.</p>
           </div>
          </div>
          <div className="flex gap-2">
           <Link href="https://driver.taxyciti.net" target="_blank" className="px-5 py-2.5 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
            Driver Portal
           </Link>
           <Link href="#" className="px-5 py-2.5 bg-transparent border border-white/30 text-white rounded-lg font-medium text-sm hover:bg-white/10 transition-colors">
            Download
           </Link>
          </div>
         </div>
        </div>

        {/* Admin */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
         <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
           <div className="p-3 bg-indigo-500 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
           </div>
           <div className="text-left">
            <h4 className="text-white font-semibold text-lg">For Operators</h4>
            <p className="text-gray-400 text-sm">Fleet management, analytics, and revenue tracking.</p>
           </div>
          </div>
          <div>
           <Link href="https://admin.taxyciti.net" target="_blank" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20">
            Admin Dashboard
           </Link>
          </div>
         </div>
        </div>
       </div>
      </div>

      {/* Decorative circles */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-600 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-20"></div>

     </div>
    </div>
   </section>

   <Footer />
  </div>
 );
}

function FeatureCard({ icon, title, description, color, textColor = "text-white" }: Readonly<{ icon: React.ReactNode, title: string, description: string, color: string, textColor?: string }>) {
 return (
  <div className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
   <div className={`w-12 h-12 ${color} ${textColor} rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
    {icon}
   </div>
   <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
   <p className="text-gray-500 leading-relaxed">
    {description}
   </p>
  </div>
 )
}
