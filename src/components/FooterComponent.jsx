import React from 'react';
import { Footer } from 'flowbite-react';

const FooterComponent = () => {
  return (
    <Footer container className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-none">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid w-full justify-between sm:flex sm:justify-between md:flex md:grid-cols-1">
          
          {/* Brand & App Downloads */}
          <div className="mb-8 sm:mb-0">
            <Footer.Brand
              href="/"
              src="https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2FIMG-20240101-WA0016.jpg?alt=media&token=177a4e17-88de-4682-8e17-d0a002609ce0"
              alt="Mart Logo"
              className="mb-4 h-12"
            />
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-6 text-sm">
              Your one-stop destination for all your daily needs. Best quality, delivered at your doorstep.
            </p>
            <div className="flex flex-col space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Get the App</span>
              <div className="flex gap-3">
                <a href="#" className="transition-transform hover:scale-105">
                  <img className="w-32 h-auto rounded-lg shadow-sm" src="https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2Fdownload__1_-removebg-preview.png?alt=media&token=cad413ab-5f87-417b-806b-5c7735958657" alt="App Store" />
                </a>
                <a href="#" className="transition-transform hover:scale-105">
                  <img className="w-32 h-auto rounded-lg shadow-sm" src="https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2FGoogle%2BPlay.png?alt=media&token=ac450486-c384-4a6c-9610-74c53a6f6b7f" alt="Play Store" />
                </a>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="grid grid-cols-2 gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-12">
            <div>
              <Footer.Title title="Policies" className="text-gray-900 dark:text-white font-bold" />
              <Footer.LinkGroup col className="text-gray-600 dark:text-gray-400">
                <Footer.Link href="/privacy-policy" className="hover:text-blue-600">Privacy Policy</Footer.Link>
                <Footer.Link href="/terms-condition" className="hover:text-blue-600">Terms & Conditions</Footer.Link>
                <Footer.Link href="/return-policy" className="hover:text-blue-600">Return Policy</Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title="Support" className="text-gray-900 dark:text-white font-bold" />
              <Footer.LinkGroup col className="text-gray-600 dark:text-gray-400">
                <Footer.Link href="https://wa.me/919829179622" className="hover:text-green-500">Contact Us (WhatsApp)</Footer.Link>
                <Footer.Link href="/About-Us" className="hover:text-blue-600">About Our Story</Footer.Link>
                <Footer.Link href="#" className="hover:text-blue-600">Help Center</Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Footer.Title title="Social Connect" className="text-gray-900 dark:text-white font-bold" />
              <div className="flex gap-4 mt-2">
                <a href="#" className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors">
                  <img className="w-5 h-5" src="https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2Fround-blue-facebook-logo-with-white-thick-border-and-long-shadow-on-a-transparent-background-free-png-removebg-preview.png?alt=media&token=6903183a-3321-4e29-b464-fd2e298db777" alt="Facebook" />
                </a>
                <a href="#" className="p-2 bg-white rounded-full shadow-md hover:bg-pink-50 transition-colors">
                  <img className="w-5 h-5" src="https://firebasestorage.googleapis.com/v0/b/ajmerclient.appspot.com/o/product-images%2Fdownload__3_-removebg-preview.png?alt=media&token=00b4c63e-5288-4819-85eb-c7727854209a" alt="Instagram" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <Footer.Divider className="my-8" />

        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <Footer.Copyright 
            href="#" 
            by="GJ™" 
            year={new Date().getFullYear()} 
            className="text-gray-500 font-medium"
          />
          <div className="flex items-center space-x-1 grayscale opacity-70">
            <span className="text-xs text-gray-400 mr-2">Secure Payments:</span>
            {/* Aap yahan payment icons add kar sakte hain like Visa, Master-card etc */}
            <span className="text-[10px] font-mono border px-1 rounded">VISA</span>
            <span className="text-[10px] font-mono border px-1 rounded">UPI</span>
            <span className="text-[10px] font-mono border px-1 rounded">RUPAY</span>
          </div>
        </div>
      </div>
    </Footer>
  );
}

export default FooterComponent;