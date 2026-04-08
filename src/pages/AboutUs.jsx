import React, { useState } from 'react';
import FooterComponent from '../components/FooterComponent';
import Navbar from '../components/Navbar';
import { Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faStore, faGem, faRing } from '@fortawesome/free-solid-svg-icons';

const AboutUs = () => {
  const [modalData, setModalData] = useState({ show: false, title: '', url: '' });

  const branches = [
    {
      title: "NISHITA TRADING",
      subtitle: "WHOLESALERS OF COSMETICS",
      desc: "Specialists in professional parlor products and premium cosmetics wholesale.",
      icon: faStore,
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3571.9340166562!2d74.63045197571323!3d26.457855776921242!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396be716f2349cdf%3A0xe818727c88c019cc!2sNishita%20trading!5e0!3m2!1sen!2sin!4v1721273135010!5m2!1sen!2sin",
      color: "blue"
    },
    {
      title: "NEW FASHIONS",
      subtitle: "IMITATION JEWELLERY",
      desc: "Deals in Rajputi sets, Bridal sets, Bindi, and all types of hair accessories at wholesale rates.",
      icon: faGem,
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28569.558518735106!2d74.6121025021736!3d26.481671572001556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396be71c92afcf7b%3A0x6268d9cef1a705d7!2sNew%20Fashions!5e0!3m2!1sen!2sin!4v1726378991111!5m2!1sen!2sin",
      color: "purple"
    },
    {
      title: "NEW LAXMI SUHAG BHANDAR",
      subtitle: "BANGLES & EMBROIDERY",
      desc: "Wholesale deals in Glass, Metal, and Lakh bangles, plus Gota, Lace, and Saree falls.",
      icon: faRing,
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7143.858066034596!2d74.62685379416011!3d26.458016407684312!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396be71b88a63899%3A0x3dbd4725cf0df7d3!2sNew%20Laxmi%20Suhag%20Bhandar!5e0!3m2!1sen!2sin!4v1726380798041!5m2!1sen!2sin",
      color: "pink"
    },
    {
      title: "NISHITA BANGLES",
      subtitle: "MANUFACTURERS",
      desc: "Leading wholesalers and manufacturers of premium quality Bangles and Bindi.",
      icon: faStore,
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3571.9340166562!2d74.63045197571323!3d26.457855776921242!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396be716f2349cdf%3A0xe818727c88c019cc!2sNishita%20trading!5e0!3m2!1sen!2sin!4v1721273135010!5m2!1sen!2sin",
      color: "indigo"
    }
  ];

  const handleOpen = (branch) => {
    setModalData({ show: true, title: branch.title, url: branch.mapUrl });
  };

  const handleClose = () => setModalData({ ...modalData, show: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Header */}
      <div className="pt-32 pb-16 bg-white text-center border-b border-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            OUR <span className="text-blue-600">BRANCHES</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Serving excellence across multiple locations with a wide range of cosmetics, jewellery, and fashion accessories.
          </p>
        </div>
      </div>

      {/* Branches Grid */}
      <main className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {branches.map((branch, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`w-14 h-14 rounded-xl bg-${branch.color}-50 flex items-center justify-center mb-6`}>
                <FontAwesomeIcon icon={branch.icon} className={`text-2xl text-${branch.color}-500`} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{branch.title}</h3>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">
                {branch.subtitle}
              </p>
              <p className="text-gray-600 text-sm mb-8 flex-grow leading-relaxed">
                {branch.desc}
              </p>

              <button 
                onClick={() => handleOpen(branch)}
                className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                View Location
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Reusable Location Modal */}
      <Modal show={modalData.show} onHide={handleClose} size="lg" centered className="rounded-3xl">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="font-bold text-gray-900">{modalData.title} - Location</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
            <iframe
              src={modalData.url}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={handleClose} className="rounded-xl font-bold px-6">
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <FooterComponent />

      {/* Simple Tailwind-like spacing fix if not using Tailwind */}
      <style>{`
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        @media (min-width: 768px) { .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (min-width: 1024px) { .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        .gap-8 { gap: 2rem; }
        .transition-all { transition: all 0.3s ease; }
        .hover\\:-translate-y-2:hover { transform: translateY(-0.5rem); }
      `}</style>
    </div>
  );
};

export default AboutUs;