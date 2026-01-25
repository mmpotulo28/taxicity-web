"use client"
import React from "react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, BarChart3, Download, QrCode } from 'lucide-react';
import { Button } from "@heroui/button";

export default function Home() {
 return (
  <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-primary selection:text-black">
   <Navbar />

   {/* Hero Section */}
   <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white dark:bg-black">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-100/40 via-transparent to-transparent dark:from-primary-900/20"></div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
     <div className="text-center max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 animate-fade-in-up">
       <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
       </span>
       <span className="text-sm font-medium text-black dark:text-primary tracking-wide">Live in South Africa</span>
      </div>

      <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-default-900 dark:text-white mb-8 leading-[0.9]">
       Ride Smart <br />
       <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary-500">
        Move Faster
       </span>
      </h1>

      <p className="text-xl md:text-2xl text-default-700 mb-12 leading-relaxed max-w-2xl mx-auto font-light">
       The all-in-one platform revolutionizing the minibus taxi industry.
       Seamless payments, real-time tracking, and verified safety.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
       <Button
        as={Link}
        href="#download"
        variant="solid"
        color="primary"
        size="lg"
       >
        Download App
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
       </Button>
       <Button
        as={Link}
        href="#download"
        variant="bordered"
        color="default"
        size="lg"
       >
        Web Access
       </Button>
      </div>
     </div>
    </div>

    {/* Abstract Background Elements */}
    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>
    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
   </section>

   {/* App Showcase Section (Download) */}
   <section id="download" className="py-24 bg-default-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
     <div className="text-center mb-20">
      <h2 className="text-sm font-bold tracking-widest uppercase text-primary mb-4">Ecosystem</h2>
      <h3 className="text-4xl md:text-5xl font-black text-default-900 dark:text-white mb-6">Built for Everyone</h3>
      <p className="text-default-700 max-w-2xl mx-auto text-lg">
       Three powerful apps working in perfect sync to keep the city moving.
      </p>
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* User App Card */}
      <AppCard
       title="TaxiCiTi User"
       role="Commuter"
       description="Book seats, pay with your wallet, and track your ride in real-time."
       features={["Live Tracking", "Cashless Pay", "Panic Button"]}
       color="bg-primary-600"
       link="https://app.taxyciti.net"
       mockupColor="bg-default-900"
      />

      {/* Driver App Card */}
      <AppCard
       title="TaxiCiTi Driver"
       role="Driver"
       description="Manage trips, accept digital payments, and optimize your routes."
       features={["Trip Management", "Earnings Dashboard", "Navigation"]}
       color="bg-primary"
       textColor="text-black"
       link="https://driver.taxyciti.net"
       mockupColor="bg-secondary"
       isDarkText
      />

      {/* Admin App Card */}
      <AppCard
       title="TaxiCiTi Admin"
       role="Operator"
       description="Monitor fleet performance, manage drivers, and track revenue."
       features={["Fleet Analytics", "Driver Management", "Revenue Reports"]}
       color="bg-indigo-600"
       link="https://admin.taxyciti.net"
       mockupColor="bg-success"
      />
     </div>
    </div>
   </section>

   {/* Features Grid - Bento Style */}
   <section id="features" className="py-32 bg-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Large Feature */}
      <div className="md:col-span-2 bg-default-300 rounded-[2.5rem] p-12 relative overflow-hidden group">
       <div className="relative z-10">
        <h3 className="text-3xl font-bold text mb-4">Real-Time Precision Tracking</h3>
        <p className="text-default-700  text-lg max-w-md">Never guess where your ride is again. Our advanced GPS system provides live updates for authorized vehicles.</p>
       </div>
       <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-default-200 dark:from-default-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {/* Tall Feature */}
      <div className="md:row-span-2 bg-black dark:bg-default-900 border border-default-100 dark:border-default-800 rounded-[2.5rem] p-12 relative overflow-hidden">
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
       <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
         <div className="w-16 h-16 bg-background/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-background/20">
          <Shield className="w-8 h-8 text-background" />
         </div>
         <h3 className="text-3xl font-bold text-background mb-4">Enterprise Grade Security</h3>
         <p className="text-default-400 text-lg">
          Every driver is verified. Every trip is monitored. Built with safety as the foundation.
         </p>
        </div>
        <div className="mt-8">
         <div className="flex items-center gap-3 text-background/80 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Police Verified Drivers</span>
         </div>
         <div className="flex items-center gap-3 text-background/80">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>24/7 Support Line</span>
         </div>
        </div>
       </div>
      </div>

      {/* Standard Feature */}
      <div className="bg-primary-50 border border-primary-100 rounded-[2.5rem] p-12">
       <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mb-8">
        <Zap className="w-8 h-8 text-white" />
       </div>
       <h3 className="text-2xl font-bold text-default-900 dark:text-white mb-4">Instant Payments</h3>
       <p className="text-default-700">Cashless convenience. Pay with your phone in seconds.</p>
      </div>

      {/* Standard Feature */}
      <div className="bg-secondary-50 border border-secondary-100 rounded-[2.5rem] p-12">
       <div className="w-16 h-16 bg-secondary-500 rounded-2xl flex items-center justify-center mb-8">
        <BarChart3 className="w-8 h-8 text-white" />
       </div>
       <h3 className="text-2xl font-bold text-default-900 mb-4">Smart Analytics</h3>
       <p className="text-default-700">Data-driven insights for fleet operators to maximize revenue.</p>
      </div>

     </div>
    </div>
   </section>

   <Footer />
  </div>
 );
}

interface AppCardProps {
 title: string;
 role: string;
 description: string;
 features: string[];
 color: string;
 textColor?: string;
 link: string;
 mockupColor: string;
 isDarkText?: boolean;
}

function AppCard({ title, role, description, features, color, link, mockupColor }: Readonly<AppCardProps>) {
 return (
  <div className="flex flex-col h-full bg-white dark:bg-black rounded-3xl overflow-hidden border border-default-200 hover:border-primary/50 transition-colors shadow-2xl hover:shadow-primary/10 duration-500 group">
   {/* Mockup Header Area */}
   <div className={`h-64 ${mockupColor} relative flex items-center justify-center overflow-hidden`}>
    <div className="absolute inset-0 bg-black/10"></div>
    {/* Abstract Phone Shape */}
    <div className="w-40 h-full bg-black rounded-t-3xl border-8 border-default-800 translate-y-12 shadow-2xl transform group-hover:translate-y-8 transition-transform duration-500">
     <div className="w-full h-full bg-white dark:bg-black rounded-t-2xl overflow-hidden relative">
      {/* Screen placeholder content */}
      <div className="p-4 space-y-3">
       <div className="w-full h-8 bg-default-100 dark:bg-default-800 rounded-lg animate-pulse"></div>
       <div className="w-2/3 h-4 bg-default-100 dark:bg-default-800 rounded-lg animate-pulse"></div>
       <div className="w-full h-32 bg-default-100 dark:bg-default-800 rounded-lg mt-4 opacity-50"></div>
      </div>
     </div>
    </div>

    {/* Floating QR Placeholder */}
    <div className="absolute top-6 right-6 p-2 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
     <QrCode className="w-12 h-12 text-black" />
    </div>
   </div>

   <div className="p-8 flex-1 flex flex-col">
    <div className="mb-6">
     <span className={`inline-block py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-1 text-primary`}>
      {role}
     </span>
     <h3 className="text-3xl font-bold text-default-900 dark:text-white mb-2">{title}</h3>
     <p className="text-default-700 leading-relaxed">{description}</p>
    </div>

    <ul className="space-y-3 mb-8 flex-1">
     {features.map((feature: string) => (
      <li key={feature} className="flex items-center text-default-700">
       <div className={`w-1.5 h-1.5 rounded-full ${color} mr-3`}></div>
       {feature}
      </li>
     ))}
    </ul>

    <div className="space-y-4">
     <Button href={link} target="_blank" rel="noopener noreferrer" fullWidth color="secondary" variant="bordered">
      Launch Web App
     </Button>
     <div className="flex gap-3">
      <Button fullWidth color="primary">
       <Download className="w-4 h-4" /> App Store
      </Button>
      <Button fullWidth >
       <Download className="w-4 h-4" /> Play Store
      </Button>
     </div>
    </div>
   </div>
  </div>
 )
}