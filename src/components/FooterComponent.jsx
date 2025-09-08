import React from "react";

const FooterComponent = () => {
  return (
    <footer className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-10 px-6 rounded-t-2xl">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        
        {/* Left Section - Mobile App */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Get the Mobile App</h2>
          <p className="mb-4">Download the app for a seamless shopping experience</p>
          <div className="flex gap-4">
            <img
              className="h-12 cursor-pointer"
              src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2Fappstore.svg?alt=media&token=847b3d40-1e77-4976-970e-f9c86e5883d5"
              alt="App Store"
            />
            <img
              className="h-12 cursor-pointer"
              src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2Fplaystore.svg?alt=media&token=5699433f-6e9d-4d34-9321-cf0cc87e4699"
              alt="Google Play"
            />
          </div>
        </div>

        {/* Right Section - Newsletter */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Newsletter</h2>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="email"
              placeholder="Enter your email address"
              className="p-3 rounded-lg w-full sm:w-2/3 text-black outline-none"
            />
            <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 w-full sm:w-auto">
              Sign Up
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default FooterComponent;
