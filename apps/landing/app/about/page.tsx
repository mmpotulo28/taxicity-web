import React from "react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Users, Target, Shield, Zap, MapPin, Smartphone, CreditCard, Car, LayoutDashboard, Route as RouteIcon } from 'lucide-react';

export default function AboutPage() {
 return (
  <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-brand-yellow selection:text-black">
   <Navbar />

   <main className="pt-32 pb-20">
    {/* Header */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
     <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
      Redefining <span className="text-brand-yellow">African Mobility</span>
     </h1>
     <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
      We are on a mission to digitize and modernize the minibus taxi industry, making daily commutes safer, reliable, and convenient for millions.
     </p>
    </div>

    {/* The TaxiCity Ecosystem */}
    <section className="py-16 bg-white dark:bg-black border-y border-gray-100 dark:border-zinc-800">
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
       <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">The TaxiCity Ecosystem</h2>
       <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
        We don&apos;t just build an app; we build a complete digital infrastructure that connects every stakeholder in the public transport value chain.
       </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
       {/* Commuters */}
       <div className="bg-gray-50 dark:bg-zinc-900/50 p-8 rounded-2xl border border-gray-100 dark:border-zinc-800">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6">
         <Users className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">For Commuters</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
         No more guessing when the next taxi will arrive. Commuters can book seats on specific routes, track their ride in real-time, and pay digitally.
        </p>
        <ul className="space-y-2">
         <li className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Shield className="w-4 h-4 text-green-500" /> Verified Drivers
         </li>
         <li className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <CreditCard className="w-4 h-4 text-green-500" /> Cashless Payments
         </li>
        </ul>
       </div>

       {/* Drivers */}
       <div className="bg-gray-50 dark:bg-zinc-900/50 p-8 rounded-2xl border border-gray-100 dark:border-zinc-800">
        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-xl flex items-center justify-center mb-6">
         <Car className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">For Drivers</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
         Empowering drivers with digital tools to manage their specific routes, fill seats efficiently, and remove the risks associated with handling cash.
        </p>
        <ul className="space-y-2">
         <li className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <RouteIcon className="w-4 h-4 text-brand-yellow" /> Route Optimization
         </li>
         <li className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Smartphone className="w-4 h-4 text-brand-yellow" /> Digital Trip Log
         </li>
        </ul>
       </div>

       {/* Owners & Associations */}
       <div className="bg-gray-50 dark:bg-zinc-900/50 p-8 rounded-2xl border border-gray-100 dark:border-zinc-800">
        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-6">
         <LayoutDashboard className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Owners & Associations</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
         Giving fleet owners visibility into vehicle performance, revenue tracking, and route efficiency through a powerful admin dashboard.
        </p>
        <ul className="space-y-2">
         <li className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Zap className="w-4 h-4 text-purple-500" /> Real-time Analytics
         </li>
         <li className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Target className="w-4 h-4 text-purple-500" /> Revenue Management
         </li>
        </ul>
       </div>
      </div>
     </div>
    </section>

    {/* How It Works - The Shared Model */}
    <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-zinc-900/30 relative overflow-hidden">
     {/* Background Pattern */}
     <div className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none">
      <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
       <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" className="text-brand-yellow" />
      </svg>
     </div>

     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center mb-16">
       <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
       <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
        Unlike traditional e-hailing, TaxiCity operates on a <strong>Shared Vehicle Model</strong>. This keeps costs low while maintaining efficiency.
       </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
       {/* Step 1 */}
       <div className="relative">
        <div className="flex items-center mb-4">
         <div className="w-10 h-10 rounded-full bg-brand-yellow text-black font-bold flex items-center justify-center text-lg z-10">1</div>
         <div className="h-0.5 bg-gray-200 dark:bg-zinc-700 flex-1 ml-4 hidden md:block"></div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Driver Starts a Run</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
         A driver initiates a trip on a designated route (e.g., &quot;Main Road to CBD&quot;). The vehicle becomes active and visible on the map.
        </p>
       </div>

       {/* Step 2 */}
       <div className="relative">
        <div className="flex items-center mb-4">
         <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 font-bold flex items-center justify-center text-lg z-10">2</div>
         <div className="h-0.5 bg-gray-200 dark:bg-zinc-700 flex-1 ml-4 hidden md:block"></div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Commuter Books Seat</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
         You search for a route and book a seat. You aren&apos;t hiring the whole car, just a spot on the &quot;bus.&quot;
        </p>
       </div>

       {/* Step 3 */}
       <div className="relative">
        <div className="flex items-center mb-4">
         <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 font-bold flex items-center justify-center text-lg z-10">3</div>
         <div className="h-0.5 bg-gray-200 dark:bg-zinc-700 flex-1 ml-4 hidden md:block"></div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Smart Boarding</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
         The driver gets notified. You meet at a designated stop or along the route. Board the taxi digitally—no haggling.
        </p>
       </div>

       {/* Step 4 */}
       <div className="relative">
        <div className="flex items-center mb-4">
         <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 font-bold flex items-center justify-center text-lg z-10">4</div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Seamless Arrival</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
         Alight at your drop-off point. The driver continues the route for other passengers. Payment is handled automatically.
        </p>
       </div>
      </div>
     </div>
    </section>

    {/* Story Section */}
    <section className="bg-white dark:bg-black py-20">
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
       <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
         <p>
          Born from the vibrant streets of South Africa, TaxiCiTi recognized a critical disconnect in the continent&apos;s most vital public transport network. For decades, the minibus taxi industry has moved millions of people daily, serving as the backbone of the economy, yet it remained largely disconnected from the benefits of the digital revolution.
         </p>
         <p>
          We started with a simple, personal question: <span className="text-gray-900 dark:text-white font-semibold">&quot;Why can&apos;t I track my daily taxi to work like I track an e-hail ride?&quot;</span>
         </p>
         <p>
          That question evolved into a comprehensive mission. We realized that to truly improve the system, we couldn&apos;t just build an app for passengers; we needed to empower the drivers and respect the associations that built the industry. Today, TaxiCity stands as a bridge between traditional transport wisdom and smart city technology.
         </p>
        </div>
       </div>
       <div className="relative h-80 md:h-[500px] w-full bg-gray-100 dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800 flex items-center justify-center">
        {/* Placeholder for About Image */}
        <MapPin className="text-gray-300 dark:text-zinc-700 w-32 h-32 opacity-50" />
        <span className="absolute bottom-8 text-gray-400 dark:text-zinc-600 font-medium">Connecting The City</span>
       </div>
      </div>
     </div>
    </section>

    {/* Mission & Values */}
    <section className="py-20 bg-gray-50 dark:bg-zinc-900/50">
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
       <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What Drives Us</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
       <ValueCard
        icon={<Target className="w-6 h-6" />}
        title="Mission"
        description="To create a seamless, cashless, and safe transport ecosystem for Africa."
       />
       <ValueCard
        icon={<Shield className="w-6 h-6" />}
        title="Safety"
        description="Prioritizing the security of every passenger and driver through verification and tracking."
       />
       <ValueCard
        icon={<Users className="w-6 h-6" />}
        title="Community"
        description="Empowering local taxi associations and drivers rather than displacing them."
       />
       <ValueCard
        icon={<Zap className="w-6 h-6" />}
        title="Innovation"
        description="Constantly improving our technology to solve real-world transport challenges."
       />
      </div>
     </div>
    </section>
   </main>

   <Footer />
  </div>
 );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
 return (
  <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:border-brand-yellow/50 transition-colors group">
   <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-6 text-brand-yellow group-hover:scale-110 transition-transform">
    {icon}
   </div>
   <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
   <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
    {description}
   </p>
  </div>
 )
}
