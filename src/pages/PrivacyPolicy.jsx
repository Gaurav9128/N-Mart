import React from 'react';
import FooterComponent from '../components/FooterComponent';
import Navbar from '../components/Navbar';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Main Content Container */}
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Policies & Terms
          </h1>
          <p className="text-gray-600">Last Updated: April 2024</p>
          <div className="h-1 w-20 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 md:p-12 space-y-12 text-gray-700 leading-relaxed">
          
          {/* Section: Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg mr-3 text-sm">01</span>
              Privacy Policy
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Information We Collect</h3>
                <p className="mb-2"><span className="font-medium">1.1 Personal Information:</span> When you register or place an order, we collect details like your name, email, phone number, and payment information.</p>
                <p><span className="font-medium">1.2 Non-Personal Information:</span> We track browser types and IP addresses to optimize our website performance.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2. How We Use Your Information</h3>
                <p>Your data helps us process orders, improve user experience, and send relevant updates regarding your purchases.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Data Protection</h3>
                <p>We implement industry-standard security measures to ensure your personal data remains confidential and secure.</p>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section: Pricing Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg mr-3 text-sm">02</span>
              Pricing & Currency
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-1">Currency</h3>
                <p className="text-sm text-gray-600">All prices are in INR (₹) and include applicable taxes unless stated otherwise.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-1">Price Changes</h3>
                <p className="text-sm text-gray-600">N-mart reserves the right to adjust pricing based on market trends without prior notice.</p>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section: Delivery & Returns */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg mr-3 text-sm">03</span>
              Shipping & Returns
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="h-2 w-2 bg-orange-400 rounded-full mt-2 mr-3 shrink-0"></div>
                <p><span className="font-bold text-red-600">No Return & No Exchange:</span> Please note that we do not offer returns or exchanges once the product is sold.</p>
              </div>
              <div className="flex items-start">
                <div className="h-2 w-2 bg-orange-400 rounded-full mt-2 mr-3 shrink-0"></div>
                <p>Standard delivery takes <span className="font-semibold">3-7 business days</span>. Tracking details will be sent via email.</p>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Contact Section */}
          <section className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Need Help? Contact Us</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-bold text-blue-800">Email</p>
                <p className="text-blue-700">bhagwanharplani@gmail.com</p>
              </div>
              <div>
                <p className="font-bold text-blue-800">Phone</p>
                <p className="text-blue-700">+91 9829179622</p>
              </div>
              <div>
                <p className="font-bold text-blue-800">Address</p>
                <p className="text-blue-700 text-xs">Neelkamal Hotel, Kesar Ganj, Ajmer.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <FooterComponent />
    </div>
  );
};

export default PrivacyPolicy;