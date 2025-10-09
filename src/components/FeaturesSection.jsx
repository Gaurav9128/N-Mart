import React from "react";
import { Truck, RotateCcw, Headphones, CreditCard } from "lucide-react";

const features = [
  {
    icon: <Truck className="w-10 h-10 text-green-600" />,
    title: "Free Shipping",
    description: "Free shipping for orders over ₹5000",
  },
  {
    icon: <RotateCcw className="w-10 h-10 text-green-600" />,
    title: "Returns",
    description: "Within 7 days for an exchange",
  },
  {
    icon: <Headphones className="w-10 h-10 text-green-600" />,
    title: "Online Support",
    description: "24 hours a day, 7 days a week",
  },
  {
    icon: <CreditCard className="w-10 h-10 text-green-600" />,
    title: "Flexible Payment",
    description: "Pay with multiple credit cards",
  },
];

const FeaturesSection = () => {
  return (
    <section className="w-full bg-white py-10 px-5">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center space-y-3"
          >
            {feature.icon}
            <h3 className="text-lg font-semibold text-gray-800">{feature.title}</h3>
            <p className="text-sm text-gray-500">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
