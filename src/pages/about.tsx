//@ts-nocheck
'use client'; // Add this line only if using App Router

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
      // Replace hyphen with space and format
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
      }, 400);
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
            backgroundColor: '#fafafa',
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
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    sx={{ borderRadius: 3, borderColor: '#eee' }}
    className="bg-white p-8 rounded-2xl"
  >
    <div style={{ color: '#133240' }} className="text-4xl font-bold mb-2">
      {number}
    </div>
    <div className="text-gray-600">{label}</div>
  </Card>
);

const AboutPage: React.FC = () => {
  return (
    <section>
      <NavBar />
      <div className="pt-20 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Column */}

            <div className="space-y-6">
              <Paper
                variant="outlined"
                sx={{
                  height: '100%',
                  borderRadius: '24px',
                  p: 4,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(209, 213, 219, 0.3)',
                  boxShadow:
                    '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow:
                      '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <div style={{ color: '#133240' }} className="pb-10 font-medium">
                  How It Started
                </div>
                <h1 className="text-5xl font-bold leading-tight">
                  Our Dream is to
                  <br />
                  Provide you with
                  <br />
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    sx={{ color: '#133240' }}
                  >
                    Your Dream Pool Experience
                  </Typography>
                </h1>
                <p className="pt-10 text-gray-600 leading-relaxed">
                  Kawruh was founded by Robert Anderson, a passionate lifelong
                  learner, and Maria Sanchez, a visionary educator. Their shared
                  dream was to create a digital haven of knowledge accessible to
                  all. United by their belief in the transformational power of
                  education, they embarked on a journey to build 'Kawruh.' With
                  relentless dedication, they gathered a team of experts and
                  launched this innovative platform, creating a global community
                  of eager learners, all connected by the desire to explore,
                  learn, and grow
                </p>
              </Paper>
            </div>

            {/* Right Column */}

            <div className="space-y-8">
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: '24px',
                  p: 4,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(209, 213, 219, 0.3)',
                  boxShadow:
                    '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow:
                      '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
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

        <div className="mt-20 w-full flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-3">
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
