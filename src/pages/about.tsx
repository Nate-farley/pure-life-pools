//@ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import NavBar from '@/containers/Navbar/navbar';
import { Fade, Paper, Typography, Box, Chip, Card } from '@mui/material';
import Footer from '@/containers/Footer';

const perspectiveImages = [
  '/downloaded_images/1732569924035_39_FG-THUMBS_0010_Nirvana-5-OceanBlueG3-perspective.jpg',
  '/downloaded_images/1732569924135_41_FG-THUMBS_0009_Nirvana-6-OceanBlueG3-perspective.jpg',
  '/downloaded_images/1732569924319_43_FG-THUMBS_0008_Nirvana-7-OceanBlueG3-perspective.jpg',
  '/downloaded_images/1732569927872_82_FG-THUMBS_0004_Symphony-6-OceanBlueG3-perspective.jpg',
  '/downloaded_images/1732569927980_84_FG-THUMBS_0003_Symphony-7-OceanBlueG3-perspective.jpg',
  '/downloaded_images/1732569928086_86_FG-THUMBS_0002_Symphony-8-OceanBlueG3-perspective.jpg',
  '/downloaded_images/1732569928219_88_FG-THUMBS_0001_Symphony-9-OceanBlueG3-perspective.jpg',
  '/downloaded_images/1732569928326_90_FG-THUMBS_0000_Symphony-12-OceanBlueG3-perspective.jpg',
];

const ImageCarousel = () => {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);

  const getPoolName = (path: string) => {
    const match = path.match(/THUMBS_\d+_([\w-]+)-OceanBlue/);
    if (match) {
      return match[1].replace('-', ' ');
    }
    return '';
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % perspectiveImages.length);
        setShow(true);
      }, 800);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-3xl">
      <Fade in={show} timeout={800}>
        <img
          src={perspectiveImages[index]}
          alt={`Pool perspective ${index + 1}`}
          className="w-full h-full object-cover"
        />
      </Fade>
      <div className="absolute top-4 left-4 z-10">
        <Chip
          sx={{
            backgroundColor: '#dbdbdb',
            backdropFilter: 'blur(8px)',
            color: '#133240',
            fontWeight: 500,
            fontSize: '0.875rem',
            height: '32px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 4px 6px rgba(0,0,0,0.08)',
              transform: 'translateY(-1px)',
            },
          }}
          label={getPoolName(perspectiveImages[index])}
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  number: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ number, label }) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: 3,
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
    }}
    className="p-8 rounded-2xl"
  >
    <div style={{ color: '#133240' }} className="text-4xl font-bold mb-2">
      {number}
    </div>
    <div className="text-gray-600">{label}</div>
  </Card>
);

const AboutPage: React.FC = () => {
  return (
    <section className="relative">
      {/* Fixed Background with Glass Effect */}
      {/* <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-95 to-white" />
        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-[2%] w-[40rem] h-[40rem] rounded-full bg-blue-200/50 blur-3xl" />
          <div className="absolute bottom-[20%] right-[1%] w-[45rem] h-[45rem] rounded-full bg-teal-200/25 blur-3xl" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[40%] right-[30%] w-[35rem] h-[35rem] rounded-full bg-purple-200/50 blur-3xl " style={{ animationDelay: '4s' }} />
        </div>
      </div> */}

      <NavBar />
      
      <div className="relative pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Column */}
            <div className="space-y-6">
              <Paper
                variant="outlined"
                sx={{
                  height: '100%',
                  borderRadius: '24px',
            

                  backgroundColor: 'white',
                  backdropFilter: 'blur(8px)',
                  border: '3px solid rgba(255, 255, 255, 1)',
                  boxShadow: 'none',
          
                  '&:hover': {
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
           
                <div className="max-w-4xl mx-auto px-4 py-12">
              
      <h1 className="text-4xl font-bold text-plp-blue mb-8">Welcome to Pure Life Pools</h1>
      
      <div className="space-y-8">
        <p className="text-gray-600 leading-relaxed">
          At Pure Life Pools, we're Brevard County's premier fiberglass pool installation experts, serving Palm Bay, Melbourne, Titusville, and surrounding areas since our founding. Our commitment to excellence has made us the trusted choice for homeowners looking to transform their backyards into personal paradise retreats.
        </p>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Expertise</h2>
          <p className="text-gray-600 leading-relaxed">
            We specialize in custom fiberglass pool designs and professional installations that perfectly match Florida's unique landscape and lifestyle. Our team brings decades of combined experience in pool construction, ensuring every project meets the highest standards of quality and durability.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Local Focus, Superior Service</h2>
          <p className="text-gray-600 leading-relaxed">
            Based in Palm Bay, Florida, we're deeply rooted in the Brevard County community. Our local expertise means we understand the specific requirements and challenges of pool installation in Florida's climate and soil conditions. We serve customers within a 50-mile radius, covering all major areas of Brevard County.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Approach</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We believe in creating more than just pools – we're crafting lifestyle experiences for families. Every project begins with a thorough consultation to understand your vision, space, and budget.
          </p>
          <p className="text-gray-600 leading-relaxed">Our process includes:</p>
          <ul className="list-disc list-inside text-gray-600 mt-2 space-y-2 pl-4">
            <li>Custom design planning tailored to your property</li>
            <li>Professional installation by certified experts</li>
            <li>Comprehensive project management from start to finish</li>
            <li>Flexible financing options to make your dream pool affordable</li>
          </ul>
        </div>
      </div>
    </div>
              </Paper>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: '24px',
                  p: 4,
                  background: 'transparent',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: 'none',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <ImageCarousel />
              </Paper>
              <div className="grid grid-cols-2 gap-6">
                <StatCard number="3.5" label="Years Experience" />
                <StatCard number="23" label="Project Challenge" />
                <StatCard number="830+" label="Positive Reviews" />
                <StatCard number="100K" label="Trusted Students" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 mb-20 w-full flex items-center justify-center">
          <div className="text-center space-y-3 bg-white/70 backdrop-blur-sm p-6 rounded-xl">
            <p className="font-extralight text-gray-400">105 Ring Avenue NE</p>
            <p className="font-light text-gray-500">Palm Bay, FL 32789</p>
            <p className="font-medium text-gray-700">United States</p>
            <p className="font-bold text-gray-900">+1 321 831 3115</p>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default AboutPage;