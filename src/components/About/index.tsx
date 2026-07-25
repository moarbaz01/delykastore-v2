"use client";

import { Mail, Phone, MapPin, Gamepad2 } from "lucide-react";
import { FaTelegram } from "react-icons/fa";

const AboutUs = () => {
  return (
    <div className="min-h-screen text-white py-12 px-4 pb-28">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#12102A] rounded-full flex items-center justify-center mx-auto mb-5 border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <Gamepad2 size={36} className="text-primary" />
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-3">
            About Us
          </h1>
          <p className="text-lg text-gray-400 max-w-lg mx-auto">
            Your premier destination for secure, fast, and reliable game top-ups in Cambodia.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Company Information */}
          <div className="bg-[#12102A] border border-purple-500/10 rounded-[24px] p-6 shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -z-10 group-hover:opacity-100 opacity-50 transition-opacity"></div>
            
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-6 bg-primary rounded-full"></div>
              Who We Are
            </h2>
            <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
              <p>
                Welcome to <strong className="text-white">DELYKASTORE</strong>! We are a dedicated team focused on bringing you the best quality digital products and game top-ups with a personalized, seamless shopping experience.
              </p>
              <p>
                Our mission is to empower gamers in Cambodia and beyond by providing instant, secure access to in-game currencies and premium accounts. We take pride in our lightning-fast automated delivery systems and exceptional 24/7 customer support.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-[#12102A] border border-purple-500/10 rounded-[24px] p-6 shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-colors">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] -z-10 group-hover:opacity-100 opacity-50 transition-opacity"></div>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
              Get in Touch
            </h2>
            
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1A163B] border border-purple-500/10 flex items-center justify-center shrink-0 text-primary">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email Support</p>
                  <a href="mailto:tvhubcambodia@gmail.com" className="text-sm font-medium text-white hover:text-primary transition-colors">
                    tvhubcambodia@gmail.com
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1A163B] border border-blue-500/10 flex items-center justify-center shrink-0 text-blue-400">
                  <FaTelegram size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Telegram Support</p>
                  <a href="https://t.me/Delyy_kaa" target="_blank" rel="noreferrer" className="text-sm font-medium text-white hover:text-blue-400 transition-colors">
                    @Delyy_kaa
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1A163B] border border-gray-600/30 flex items-center justify-center shrink-0 text-gray-300">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Location</p>
                  <p className="text-sm font-medium text-white">
                    Phnom Penh, Cambodia
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
