import React from "react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
 return (
  <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-brand-yellow selection:text-black">
   <Navbar />

   <main className="pt-32 pb-20">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
     <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8">Terms of Service</h1>
     <p className="text-gray-500 dark:text-gray-400 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

     <div className="prose prose-lg dark:prose-invert max-w-none">
      <p>
       Please read these Terms of Service (&quot;Terms&quot;, &quot;Terms of Service&quot;) carefully before using the TaxiCiTi website/apps (the &quot;Service&quot;) operated by TaxiCiTi (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).
      </p>

      <h3>1. Conditions of Use</h3>
      <p>
       By using this website, you certify that you have read and reviewed this Agreement and that you agree to comply with its terms. If you do not want to be bound by the terms of this Agreement, you are advised to stop using the website accordingly.
      </p>

      <h3>2. User Accounts</h3>
      <p>
       As a user of this website, you may be asked to register with us and provide private information. You are responsible for ensuring the accuracy of this information, and you are responsible for maintaining the safety and security of your identifying information.
      </p>

      <h3>3. Intellectual Property</h3>
      <p>
       You agree that all materials, products, and services provided on this website are the property of TaxiCiTi, its affiliates, directors, officers, employees, agents, suppliers, or licensors including all copyrights, trade secrets, trademarks, patents, and other intellectual property.
      </p>

      <h3>4. Applicable Law</h3>
      <p>
       By visiting this website, you agree that the laws of South Africa, without regard to principles of conflict laws, will govern these terms and conditions, or any dispute of any sort that might come between TaxiCiTi and you.
      </p>
     </div>
    </div>
   </main>

   <Footer />
  </div>
 );
}
