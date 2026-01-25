import React from "react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
 return (
  <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-brand-yellow selection:text-black">
   <Navbar />

   <main className="pt-32 pb-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
     <div className="text-center mb-16">
      <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">get in <span className="text-brand-yellow">Touch</span></h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
       Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
      </p>
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      {/* Contact Info */}
      <div>
       <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Contact Information</h2>
       <div className="space-y-8">
        <ContactItem
         icon={<Mail className="w-6 h-6" />}
         title="Email Us"
         content="support@taxyciti.net"
         link="mailto:support@taxyciti.net"
        />
        <ContactItem
         icon={<Phone className="w-6 h-6" />}
         title="Call Us"
         content="+27 (0) 10 123 4567"
         link="tel:+27101234567"
        />
        <ContactItem
         icon={<MapPin className="w-6 h-6" />}
         title="Visit Us"
         content="123 Innovation Drive, Braamfontein, Johannesburg, 2001"
        />
       </div>

       <div className="mt-12 p-8 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">For Partners & Fleet Owners</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
         Interested in digitizing your taxi association or modernizing your fleet?
        </p>
        <a href="mailto:partners@taxyciti.net" className="text-brand-yellow font-bold hover:underline">
         Contact our partnership team &rarr;
        </a>
       </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white dark:bg-zinc-900 p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100 dark:border-zinc-800">
       <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
          <input id="firstName" type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 focus:border-brand-yellow focus:ring-0 outline-none transition-all text-gray-900 dark:text-white" placeholder="John" />
         </div>
         <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
          <input id="lastName" type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 focus:border-brand-yellow focus:ring-0 outline-none transition-all text-gray-900 dark:text-white" placeholder="Doe" />
         </div>
        </div>

        <div className="space-y-2">
         <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
         <input id="email" type="email" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 focus:border-brand-yellow focus:ring-0 outline-none transition-all text-gray-900 dark:text-white" placeholder="john@example.com" />
        </div>

        <div className="space-y-2">
         <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
         <textarea id="message" rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 focus:border-brand-yellow focus:ring-0 outline-none transition-all text-gray-900 dark:text-white resize-none" placeholder="How can we help you?"></textarea>
        </div>

        <button type="button" className="w-full py-4 bg-brand-yellow text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2">
         Send Message <Send className="w-4 h-4" />
        </button>
       </form>
      </div>
     </div>
    </div>
   </main>

   <Footer />
  </div>
 );
}

function ContactItem({ icon, title, content, link }: { icon: React.ReactNode, title: string, content: string, link?: string }) {
 const Wrapper = link ? 'a' : 'div';
 return (
  <Wrapper href={link} className="flex items-start gap-4">
   <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-gray-900 dark:text-white shrink-0">
    {icon}
   </div>
   <div>
    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{content}</p>
   </div>
  </Wrapper>
 )
}
