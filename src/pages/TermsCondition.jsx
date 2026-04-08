import React from 'react';
import Navbar from '../components/Navbar';
import FooterComponent from '../components/FooterComponent';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero Section / Spacing */}
      <div className="pt-24 pb-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">
            Terms & Conditions
          </h1>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Please read these terms carefully before using N-mart services. By using our platform, you agree to these rules.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-16 max-w-5xl">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-16 border border-gray-100">
          
          {/* Welcome Note */}
          <div className="mb-12 p-6 bg-blue-50 rounded-2xl border-l-4 border-blue-500">
            <p className="text-blue-900 leading-relaxed font-medium">
              Welcome to <strong>N-mart</strong>. We value your privacy and are committed to protecting your personal information. 
              This policy outlines how we collect, use, and safeguard your data when you visit our website.
            </p>
          </div>

          <div className="space-y-12">
            
            {/* 1. Acceptance of Terms */}
            <section>
              <div className="flex items-center mb-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 text-white font-bold mr-4">1</span>
                <h2 className="text-2xl font-bold text-gray-800">Acceptance of Terms</h2>
              </div>
              <div className="pl-14 text-gray-600 space-y-4">
                <p>
                  By accessing or using <strong>N-mart</strong>'s website, you agree to be bound by these Terms and Conditions. 
                  If you do not agree, please refrain from using our services.
                </p>
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="font-bold text-gray-800 mb-2 underline decoration-blue-500 underline-offset-4">User Conduct</h3>
                  <p>You agree not to engage in any activity that disrupts or interferes with the functioning of the website or its products. Unauthorized data mining or hacking is strictly prohibited.</p>
                </div>
              </div>
            </section>

            {/* 2. Intellectual Property */}
            <section>
              <div className="flex items-center mb-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 text-white font-bold mr-4">2</span>
                <h2 className="text-2xl font-bold text-gray-800">Intellectual Property</h2>
              </div>
              <div className="pl-14 text-gray-600">
                <p>
                  All content, logos, graphics, and materials available on this website are the exclusive property of N-mart 
                  and are protected by copyright and intellectual property laws.
                </p>
              </div>
            </section>

            {/* 3. Liability & Indemnification */}
            <section>
              <div className="flex items-center mb-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 text-white font-bold mr-4">3</span>
                <h2 className="text-2xl font-bold text-gray-800">Liability & Indemnification</h2>
              </div>
              <div className="pl-14 space-y-6 text-gray-600">
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Limitation of Liability</h3>
                  <p>N-mart shall not be liable for any indirect, incidental, or punitive damages arising out of your access to or use of the website.</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Indemnification</h3>
                  <p>You agree to indemnify and hold N-mart harmless from any claims, losses, or expenses arising from your misuse of this platform.</p>
                </div>
              </div>
            </section>

            {/* 4. Governing Law */}
            <section>
              <div className="flex items-center mb-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 text-white font-bold mr-4">4</span>
                <h2 className="text-2xl font-bold text-gray-800">Governing Law</h2>
              </div>
              <div className="pl-14 text-gray-600">
                <p>
                  These Terms and Conditions shall be governed by and construed in accordance with the laws of 
                  <strong> Rajasthan, India</strong>.
                </p>
              </div>
            </section>

          </div>
        </div>
      </main>

      <FooterComponent />
    </div>
  );
};

export default TermsConditions;