// @ts-nocheck

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavBar from '@/containers/Navbar/navbar';
import { Typography } from '@mui/material';

const SwipeGallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const images = [
    { 
      id: 1, 
      src: "/assets/images/gallery/IMG_0293.JPG",
      title: "Design Excellence",
      description: "Every pool begins with expert design, merging aesthetics with functionality."
    },
    { 
      id: 2, 
      src: "/assets/images/gallery/IMG_0295.JPG",
      title: "Custom Integration",
      description: "Seamlessly blending your pool into the existing landscape for a natural flow."
    },
    {
      id: 3,
      src: "/assets/images/gallery/IMG_8480.JPG", 
      title: "Precision Engineering",
      description: "Meticulous attention to detail ensures perfect execution of your vision."
    },
    {
      id: 4,
      src: "/assets/images/gallery/IMG_0447.JPG",
      title: "Quality Construction",
      description: "Superior materials and craftsmanship for lasting beauty and durability."
    },
    {
      id: 5,
      src: "/assets/images/gallery/IMG_0448.JPG",
      title: "Feature Integration",
      description: "Custom features that transform your pool into a personal oasis."
    },
    {
      id: 6,
      src: "/assets/images/gallery/IMG_8475.JPG",
      title: "Outdoor Living",
      description: "Creating spaces that extend your home's living area into the outdoors."
    },
    {
      id: 7,
      src: "/assets/images/gallery/IMG_7983.JPG",
      title: "Elegant Finishing",
      description: "Perfect finishing touches that elevate your pool's aesthetic appeal."
    },
    {
      id: 8,
      src: "/assets/images/gallery/IMG_7984.JPG",
      title: "Modern Design",
      description: "Contemporary pool designs that complement your home's architecture."
    },
    {
      id: 9,
      src: "/assets/images/gallery/IMG_3915.JPG",
      title: "Luxurious Details",
      description: "Premium features that add sophistication to your aquatic retreat."
    },
    {
      id: 10,
      src: "/assets/images/gallery/IMG_4020.JPG",
      title: "Sustainable Solutions",
      description: "Eco-friendly designs that minimize environmental impact while maximizing enjoyment."
    },
    {
      id: 11,
      src: "/assets/images/gallery/IMG_7406.JPG",
      title: "Family Focus",
      description: "Creating safe, enjoyable spaces for the whole family to make memories."
    },
    {
      id: 12,
      src: "/assets/images/gallery/IMG_4319.JPG",
      title: "Innovative Features",
      description: "Cutting-edge pool technology for enhanced comfort and convenience."
    },
    {
      id: 13,
      src: "/assets/images/gallery/IMG_4320.JPG",
      title: "Perfect Symmetry",
      description: "Balanced designs that create visual harmony in your backyard."
    },
    {
      id: 14,
      src: "/assets/images/gallery/IMG_4423.JPG",
      title: "Resort Style",
      description: "Bringing resort-quality luxury to your private space."
    },
    {
      id: 15,
      src: "/assets/images/gallery/IMG_4425.JPG",
      title: "Artistic Vision",
      description: "Creative designs that make your pool a true work of art."
    },
    {
      id: 16,
      src: "/assets/images/gallery/IMG_4762.JPG",
      title: "Natural Beauty",
      description: "Organic shapes and materials that complement the natural environment."
    },
    {
      id: 17,
      src: "/assets/images/gallery/IMG_4963.JPG",
      title: "Timeless Appeal",
      description: "Classic designs that maintain their beauty through the years."
    },
    {
      id: 18,
      src: "/assets/images/gallery/IMG_4965.JPG",
      title: "Custom Lighting",
      description: "Strategic lighting design for enhanced nighttime ambiance."
    },
    {
      id: 19,
      src: "/assets/images/gallery/IMG_4971.JPG",
      title: "Refined Elegance",
      description: "Sophisticated pool designs for discerning homeowners."
    },
    {
      id: 20,
      src: "/assets/images/gallery/IMG_5210.JPG",
      title: "Seamless Integration",
      description: "Perfect harmony between pool design and landscape architecture."
    },
    {
      id: 21,
      src: "/assets/images/gallery/IMG_5364.JPG",
      title: "Professional Excellence",
      description: "Expert craftsmanship in every aspect of pool construction."
    },
    {
      id: 22,
      src: "/assets/images/gallery/IMG_5365.JPG",
      title: "Smart Design",
      description: "Intelligent solutions for modern pool ownership."
    },
    {
      id: 23,
      src: "/assets/images/gallery/IMG_5366.JPG",
      title: "Premium Quality",
      description: "Superior materials and construction techniques for lasting beauty."
    },
    {
      id: 24,
      src: "/assets/images/gallery/IMG_8464.JPG",
      title: "Innovative Solutions",
      description: "Creative approaches to unique design challenges."
    },
    {
      id: 25,
      src: "/assets/images/gallery/IMG_5368.JPG",
      title: "Perfect Balance",
      description: "Harmonious integration of form and function."
    }
   ];

  const dragConstraints = { left: -100, right: 100 };

  const handleDragEnd = (e, { offset, velocity }) => {
    if (offset.x < -50 || velocity.x < -500) {
      setDirection(1);
      if (currentIndex < images.length - 1) setCurrentIndex(prev => prev + 1);
    } else if (offset.x > 50 || velocity.x > 500) {
      setDirection(-1);
      if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <>
        <NextSeo
            title="Pure Life Pools | Fiberglass pools in Indian River County"
            description="Pictures and Videos of design and past installs."
            canonical="https://purelifepools.com/gallery"
            openGraph={{
              title: "Pure Life Pools | Fiberglass pools in Indian River County",
              description: "Pictures and Videos of design and past installs.",
              images: [
                { url: 'https://purelifepools.com/assets/images/favicon-96x96.png' }
              ],
              type: 'website',
              locale: 'en_US',
              siteName: 'Pure Life Pools'
            }}
            additionalMetaTags={[
              {
                name: 'keywords',
                content: 'fiberglass pool financing Palm Bay, fiberglass pool installation Florida, swimming pool loans Florida, custom fiberglass pools Palm Bay, HFS Financial, Lyon Financial, LightStream, pool financing Brevard County'
              }
            ]}
          />    <NextSeo
                  title="Fiberglass Pool Financing Palm Bay FL | Low Interest Pool Loans | Pure Life Pools"
                  description="Expert fiberglass pool financing in Palm Bay, FL. Flexible payment plans from 4.99% APR through HFS Financial, Lyon Financial & LightStream. Finance your custom fiberglass pool installation with loans up to $500,000 and same-day approval."
                  canonical="https://purelifepools.com/financing"
                  openGraph={{
                    title: 'Fiberglass Pool Financing Palm Bay FL | Pure Life Pools',
                    description: 'Expert fiberglass pool financing in Palm Bay, FL. Flexible payment plans from 4.99% APR through HFS Financial, Lyon Financial & LightStream.',
                    images: [
                      { url: '/assets/images/financing/financing-image-three.jpg' }
                    ],
                    type: 'website',
                    locale: 'en_US',
                    siteName: 'Pure Life Pools'
                  }}
                  additionalMetaTags={[
                    {
                      name: 'keywords',
                      content: 'fiberglass pool financing Palm Bay, fiberglass pool installation Florida, swimming pool loans Florida, custom fiberglass pools Palm Bay, HFS Financial, Lyon Financial, LightStream, pool financing Brevard County'
                    }
                  ]}
                />
    
    <div className="min-h-screen bg-white-900 flex">
    <NavBar />
      {/* Left side - Text */}
      <div className="w-1/2 flex items-center justify-center p-12">
        <div className="max-w-xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            key={currentIndex}
            className="space-y-8"
          >
            {/* Image counter */}
            <motion.p 
              className="text-gray-500 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </motion.p>

            {/* Main title */}
            <motion.h2 
              className="text-7xl font-bold mb-4 text-plp-blue leading-tight"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {images[currentIndex].title}
            </motion.h2>

            {/* Divider line */}
            <motion.div 
              className="w-24 h-1 bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />

            {/* Description */}
            <motion.p 
              className="text-xl text-gray-600 leading-relaxed"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {images[currentIndex].description}
            </motion.p>

            {/* Additional context section */}
            <motion.div
              className="pt-8 border-t border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Features</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-600">Custom Design</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-gray-600">Premium Quality</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  <span className="text-gray-600">Expert Installation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <span className="text-gray-600">Lifetime Value</span>
                </div>
              </div>
            </motion.div>

            {/* Navigation dots */}
            <motion.div 
              className="flex gap-2 pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {images.map((_, index) => (
                <div 
                  key={index}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'w-12 bg-blue-500' : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </motion.div>

            {/* Navigation arrows */}
            <motion.div 
              className="flex justify-between items-center pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <button 
                onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
                className={`p-2 text-gray-600 hover:text-blue-500 transition-colors ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                ← Previous
              </button>
              <button 
                onClick={() => currentIndex < images.length - 1 && setCurrentIndex(prev => prev + 1)}
                className={`p-2 text-gray-600 hover:text-blue-500 transition-colors ${currentIndex === images.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next →
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>


      {/* Right side - Swipeable Cards */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="relative w-[800px] h-[800px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              drag="x"
              dragConstraints={dragConstraints}
              dragElastic={1}
              onDragEnd={handleDragEnd}
              className="absolute w-full h-full cursor-grab active:cursor-grabbing"
              initial={{ 
                x: direction > 0 ? 1000 : -1000,
                opacity: 0,
                scale: 0.8
              }}
              animate={{ 
                x: 0,
                opacity: 1,
                scale: 1,
                rotateY: 0
              }}
              exit={{ 
                x: direction < 0 ? 1000 : -1000,
                opacity: 0,
                scale: 0.8,
                rotateY: direction < 0 ? 45 : -45
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              <div className="w-full h-full rounded-md overflow-hidden  relative group">
                <img 
                  src={images[currentIndex].src} 
                  alt={images[currentIndex].title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
            
          </AnimatePresence>
          
        </div>
    
      </div>
      
    </div>
    </>
  );
};

export default SwipeGallery;
