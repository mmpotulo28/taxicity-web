import React from "react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
 return (
  <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-brand-yellow selection:text-black">
   <Navbar />

   <main className="pt-32 pb-20">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
     <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
     <p className="text-gray-500 dark:text-gray-400 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

     <div className="prose prose-lg dark:prose-invert max-w-none">
      <p>
       At TaxiCiTi (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website or use our mobile applications.
      </p>

      <h3>1. Information We Collect</h3>
      <p>
       We collect data to provide better services to all our users. This includes:
      </p>
      <ul>
       <li><strong>Personal Identification Data:</strong> Name, email address, phone number.</li>
       <li><strong>Location Data:</strong> Real-time geographic location for ride tracking.</li>
       <li><strong>Usage Data:</strong> Information about how you use our website and apps.</li>
      </ul>

      <h3>2. How We Use Your Information</h3>
      <p>
       We use your personal data to:
      </p>
      <ul>
       <li>Provide and maintain our Service.</li>
       <li>Notify you about changes to our Service.</li>
       <li>Allow you to participate in interactive features when you choose to do so.</li>
       <li>Provide customer support.</li>
       <li>Gather analysis or valuable information so that we can improve the Service.</li>
      </ul>

      <h3>3. Data Security</h3>
      <p>
       We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.
      </p>

      <h3>4. Your Legal Rights</h3>
      <p>
       Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to access, correct, erasure, restriction, transfer, to object to processing, to portability of data, and (where the lawful ground of processing is consent) to withdraw consent.
      </p>

      <h3>5. Contact Us</h3>
      <p>
       If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@taxyciti.net.
      </p>
     </div>
    </div>
   </main>

   <Footer />
  </div>
 );
}
