"use client";

import { ShieldCheck, FileText, AlertCircle, RefreshCcw, Mail } from "lucide-react";
import { FaTelegram } from "react-icons/fa";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen text-gray-200 py-12 px-4 pb-28">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#12102A] rounded-full flex items-center justify-center mx-auto mb-5 border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <FileText size={36} className="text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-3">
            Terms and Conditions
          </h1>
          <p className="text-sm font-medium text-primary">Last Updated: October 27, 2024</p>
        </div>

        {/* Content Container */}
        <div className="bg-[#12102A] border border-purple-500/10 rounded-[24px] p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-[60px] -z-10"></div>
          
          <div className="space-y-8 text-sm leading-relaxed text-gray-300">
            
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <ShieldCheck size={20} className="text-primary" />
                Introduction
              </h2>
              <p className="pl-7">
                Welcome to <strong className="text-white">DELYKASTORE</strong> ("we", "us", "our"). These Terms and Conditions govern your use of our website. By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Site.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <AlertCircle size={20} className="text-amber-500" />
                Purchases & Orders
              </h2>
              <p className="pl-7 mb-3">
                You (hereafter referred to as "buyer" and "user") agree to all orders placed on our platform. 
              </p>
              <ul className="list-disc list-inside pl-7 space-y-2">
                <li>All purchases made through the Site are <strong className="text-white">final and non-refundable</strong>. This includes, but is not limited to, digital goods, game top-ups, subscriptions, and virtual currency.</li>
                <li>Prices for goods and services are subject to change without notice. We reserve the right to modify prices and charges for products or services at any time.</li>
                <li>Payment must be made through the available payment methods on the Site. By providing your payment information, you authorize us to charge your payment method for the amount specified at the time of purchase.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <ShieldCheck size={20} className="text-blue-500" />
                Use of the Site
              </h2>
              <ul className="list-disc list-inside pl-7 space-y-2">
                <li>You agree to use the Site in accordance with all applicable laws and regulations.</li>
                <li>You may not use the Site for any illegal or unauthorized purpose, including but not limited to, spreading malware, engaging in fraudulent activities, or infringing on any intellectual property rights.</li>
                <li>We reserve the right to terminate or suspend your access to the Site or your account at any time, with or without cause, and with or without notice.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <RefreshCcw size={20} className="text-emerald-500" />
                Changes to Terms
              </h2>
              <p className="pl-7">
                We may update these Terms from time to time. Any changes will be posted on this page with an updated effective date. Your continued use of the Site after any changes signifies your acceptance of the new Terms.
              </p>
            </section>
          </div>
        </div>

        {/* Contact Us Card */}
        <div className="bg-[#1A163B] border border-purple-500/20 rounded-[24px] p-6 text-center shadow-lg mt-8">
          <h3 className="text-lg font-bold text-white mb-2">Have Questions?</h3>
          <p className="text-sm text-gray-400 mb-6">If you have any questions or concerns about these Terms, please contact us.</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:tvhubcambodia@gmail.com" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium text-white">
              <Mail size={16} className="text-primary" />
              tvhubcambodia@gmail.com
            </a>
            <a href="https://t.me/Delyy_kaa" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium text-white">
              <FaTelegram size={16} className="text-blue-400" />
              @Delyy_kaa
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TermsAndConditions;
