import React from 'react';
import Link from 'next/link';

export default function Navbar() {
 return (
  <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
     <div className="flex-shrink-0 flex items-center gap-2">
      {/* Logo placeholder - replace with actual Image component */}
      <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center">
       <span className="font-bold text-black text-xs">TC</span>
      </div>
      <span className="font-bold text-xl tracking-tight text-gray-900">TaxiCiTi</span>
     </div>

     <div className="hidden md:flex items-center space-x-8">
      <Link href="#features" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
       Features
      </Link>
      <Link href="#solutions" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
       Solutions
      </Link>
      <Link href="#download" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
       Download
      </Link>
     </div>

     <div className="flex items-center gap-4">
      <Link
       href="https://app.taxyciti.net"
       className="text-sm font-medium text-gray-700 hover:text-primary-600 hidden sm:block"
      >
       Sign In
      </Link>
      <Link
       href="#download"
       className="bg-black text-white px-5 py-2.5 rounded-full font-medium text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
      >
       Get Started
      </Link>
     </div>
    </div>
   </div>
  </nav>
 );
}
