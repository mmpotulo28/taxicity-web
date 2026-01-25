import React from 'react';
import Link from 'next/link';
import { Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
 return (
  <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-12">
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
     <div className="space-y-4">
      <div className="flex items-center gap-2">
       <div className="w-6 h-6 bg-brand-yellow rounded flex items-center justify-center">
        <span className="font-bold text-black text-[10px]">TC</span>
       </div>
       <span className="font-bold text-xl text-gray-900">TaxiCiTi</span>
      </div>
      <p className="text-gray-500 text-sm leading-relaxed">
       Transforming the shared taxi industry with digital innovation, safety, and efficiency.
      </p>
     </div>

     <div>
      <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
      <ul className="space-y-3 text-sm text-gray-500">
       <li><Link href="https://app.taxyciti.net" className="hover:text-primary-600">Passenger App</Link></li>
       <li><Link href="https://driver.taxyciti.net" className="hover:text-primary-600">Driver Portal</Link></li>
       <li><Link href="https://admin.taxyciti.net" className="hover:text-primary-600">Operator Dashboard</Link></li>
      </ul>
     </div>

     <div>
      <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
      <ul className="space-y-3 text-sm text-gray-500">
       <li><Link href="/about" className="hover:text-primary-600">About Us</Link></li>
       <li><Link href="/safety" className="hover:text-primary-600">Safety</Link></li>
       <li><Link href="/contact" className="hover:text-primary-600">Contact</Link></li>
       <li><Link href="/privacy" className="hover:text-primary-600">Privacy Policy</Link></li>
      </ul>
     </div>

     <div>
      <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>
      <div className="flex space-x-4">
       <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-600 transition-colors">
        <Twitter className="w-5 h-5" />
       </a>
       <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-600 transition-colors">
        <Instagram className="w-5 h-5" />
       </a>
       <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-600 transition-colors">
        <Linkedin className="w-5 h-5" />
       </a>
      </div>
     </div>
    </div>

    <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
     <p className="text-sm text-gray-400">
      © {new Date().getFullYear()} TaxiCiTi Technologies. All rights reserved.
     </p>
    </div>
   </div>
  </footer>
 );
}
