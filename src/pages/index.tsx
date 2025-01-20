// @ts-nocheck
'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import {
  Box,
  Container,
  TextField,
  Typography,
  Link,
  Grid,
  Paper,
  MobileStepper,
  IconButton,
  Divider,
  Stack,
  Button,
  useMediaQuery,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import SwipeableViews from 'react-swipeable-views';
import PoolProductGrid from '@/containers/PoolProductGrid';
import TestimonialsSection from '@/containers/Testimonials';
import Footer from '@/containers/Footer';
import BlockSection from '@/containers/ExploreSection';
import NavBar from '@/containers/Navbar/navbar';
import PoolProductsSection from '@/containers/PoolProductGrid/PoolProductSection';
import FoundedSection from '@/containers/FoundedSection';
import { useRouter } from 'next/navigation';
import { NextSeo } from 'next-seo';

const handleVideoError = (e) => {
  console.error('Video loading error:', e.target.error);
  console.log('Failed video source:', e.target.currentSrc);
};

const VideoPlayer = ({ src, isActive, onEnded, index }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const playVideo = async () => {
      try {
        video.currentTime = 0;
        await video.load();
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (err) {
        console.error('Playback error:', err);
        setError(err.message);
      }
    };

    if (isActive) {
      playVideo();
    } else {
      video.pause();
      video.currentTime = 0;
    }

    return () => {
      if (video) {
        video.pause();
        video.removeEventListener('ended', onEnded);
      }
    };
  }, [isActive, src]);

  return (
    <>
      <StyledVideo
        ref={videoRef}
        playsInline
        muted
        autoPlay={isActive}
        loop
        preload="auto"
        onError={handleVideoError}
        onEnded={onEnded}
      >
        <source src={src} type="video/mp4" />
      </StyledVideo>
      {error && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            textAlign: 'center',
            bgcolor: 'rgba(0,0,0,0.5)',
            color: 'white',
            p: 2,
          }}
        >
          Error loading video: {error}
        </Box>
      )}
    </>
  );
};

// Marketing videos
const videos = [
  '/assets/videos/latham/latham-marketing-video-3.mp4',
  '/assets/videos/latham/latham-marketing-video-1.mp4',
  '/assets/videos/latham/latham-marketing-video-4.mp4',
  '/assets/videos/latham/latham-marketing-video-3.mp4',
];

const services = [
  {
    title: 'Pools',
    description: 'Custom-built pools to transform your space.',
    image: '/assets/images/fiber-glass-pool-service.jpg',
  },
  {
    title: 'Hardscaping',
    description: 'Elegant designs with stone and pavers.',
    image: '/assets/images/hardscape-service.jpeg',
  },
  {
    title: 'Pavers',
    description: 'Durable and stylish paving solutions.',
    image: '/assets/images/pavers.png',
  },
  {
    title: 'Ponds',
    description:
      'Create a peaceful oasis with our custom water features and koi ponds. Transform your garden into a tranquil retreat with expert design and installation.',
    image: '/assets/images/koi-pond-service.jpg',
  },
];

const TextContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background:
    'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
  color: 'white',
  padding: theme.spacing(4, 6),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const AnimatedTypography = styled(Typography)(({ theme }) => ({
  opacity: 0,
  transform: 'translateY(20px)',
  animation: 'fadeInUp 0.8s forwards',
  '@keyframes fadeInUp': {
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

const PaginationContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '20px',
  right: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  zIndex: 3,
}));

// Styled component for the pagination line
const PaginationLine = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})(({ theme, isActive }) => ({
  height: '2px',
  width: isActive ? '24px' : '12px',
  backgroundColor: 'white',
  transition: 'all 0.3s ease',
  opacity: isActive ? 1 : 0.5,
}));

const StyledVideo = styled('video')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}));

const ImageWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  aspectRatio: '1/1',
  height: 300,
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  '&:hover .overlay': {
    transform: 'translateY(0)',
  },
  '&:hover img': {
    transform: 'scale(1.05)',
  },
  cursor: 'pointer',
}));

const StyledImage = styled(Image)(({ theme }) => ({
  transition: 'transform 0.3s ease-in-out',
}));

const ImageOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
}));

const HoverOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
  padding: theme.spacing(2),
  transform: 'translateY(100%)',
  transition: 'transform 0.3s ease-in-out',
  zIndex: 2,
}));

const Home = () => {
  // React hooks
  const router = useRouter();

  // State
  const [activeStep, setActiveStep] = useState(0);

  const videoRefs = Array(videos.length)
    .fill(null)
    .map(() => useRef(null));

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const handleVideoError = (e) => {
    console.error('Video loading error:', e);
  };

  const handleVideoEnd = () => {
    setActiveStep((prevStep) => {
      // If we're at the last video, go back to the first one
      if (prevStep === videos.length - 1) {
        return 0;
      }
      // Otherwise, go to next video
      return prevStep + 1;
    });
  };

  useEffect(() => {
    videos.forEach((_, index) => {
      const videoElement = videoRefs[index].current;
      if (videoElement) {
        // Add ended event listener to current video
        if (index === activeStep) {
          videoElement.play();
          videoElement.addEventListener('ended', handleVideoEnd);
        } else {
          videoElement.pause();
          videoElement.currentTime = 0;
          // Remove event listener from other videos
          videoElement.removeEventListener('ended', handleVideoEnd);
        }
      }
    });

    // Cleanup function to remove event listeners
    return () => {
      videos.forEach((_, index) => {
        const videoElement = videoRefs[index].current;
        if (videoElement) {
          videoElement.removeEventListener('ended', handleVideoEnd);
        }
      });
    };
  }, [activeStep]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOnClickService = (service) => {
    console.log(service);
    switch (service.title?.toLowerCase()) {
      case 'pools':
        router.push('/pools');
        break;
      default:
    }
  };

  return (
    <>
      <NextSeo
        title="Custom Fiberglass Pools in Palm Bay, Melbourne and Titusville Florida"
        description="Pure Life Pools specializes in transforming outdoor spaces in Palm Bay, Melbourne, and Titusville, Florida. Our services include custom fiberglass pool installation, pond creation, and hardscaping. Enhance your home's beauty and value with our expert craftsmanship and attention to detail."
      />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <NavBar />
        {/* Video Carousel Section */}
        <Box
          sx={{
            position: 'relative',
            width: isMobile ? 'auto' : '100%',
            height: isMobile ? 'auto' : '100vh',
            mb: 2,
            overflow: 'hidden',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: 0,
              position: 'relative',
              backgroundColor: 'background.paper',
              overflow: 'hidden',
              height: '100%',
            }}
          >
            <SwipeableViews
              axis="x"
              index={activeStep}
              onChangeIndex={handleStepChange}
              enableMouseEvents
            >
              {videos.map((video, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: isMobile ? 'auto' : '100vw',
                    height: isMobile ? 'auto' : '100vh',
                    overflow: 'hidden',
                  }}
                >
                  <VideoPlayer
                    src={video}
                    isActive={index === activeStep}
                    onEnded={handleVideoEnd}
                    index={index}
                  />

                  <TextContainer>
                    <Stack spacing={1} sx={{ maxWidth: '600px' }}>
                      {/* Headline */}
                      <AnimatedTypography
                        variant="h4"
                        sx={{
                          fontWeight: 600,
                          letterSpacing: '0.02em',
                          animationDelay: '0.2s',
                          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                          fontFamily: 'var(--font-primary)',
                        }}
                      >
                        Welcome to Pure Life
                      </AnimatedTypography>

                      {/* Divider line */}
                      <Box
                        sx={{
                          width: '60px',
                          height: '3px',
                          bgcolor: '#5C83D6', // TODO: Move brand color to mui_theme
                          mb: 2,
                          animation: 'expandWidth 0.8s forwards',
                          '@keyframes expandWidth': {
                            from: { width: '0px' },
                            to: { width: '60px' },
                          },
                        }}
                      />

                      {/* Subtext */}
                      {!isMobile && (
                        <AnimatedTypography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 300,
                            opacity: 0.9,
                            animationDelay: '0.4s',
                            lineHeight: 1.6,
                            fontSize: {
                              xs: '0.9rem',
                              sm: '1rem',
                              md: '1.1rem',
                            },
                          }}
                        >
                          Transform your outdoor space into a stunning oasis
                          with our custom pool designs and expert craftsmanship
                        </AnimatedTypography>
                      )}
                    </Stack>

                    {/* Pagination - positioned relative to the TextContainer */}
                    <PaginationContainer>
                      {videos.map((_, i) => (
                        <PaginationLine
                          key={i}
                          isActive={i === activeStep}
                          onClick={() => handleStepChange(i)}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.8,
                            },
                          }}
                        />
                      ))}
                    </PaginationContainer>
                  </TextContainer>
                </Box>
              ))}
            </SwipeableViews>
          </Paper>
        </Box>

        {/* Photo Gallery Section */}
        <Grid container spacing={2} sx={{ px: 2 }}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <ImageWrapper onClick={() => handleOnClickService(service)}>
                <StyledImage
                  src={service.image}
                  alt={`${service.title} Image`}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 25vw"
                  priority
                  fetchPriority="high"
                  style={{ objectFit: 'cover' }}
                />
                <ImageOverlay>
                  <Typography
                    color="white"
                    variant="h6"
                    align="center"
                    sx={{
                      fontWeight: 600,
                      textDecoration: 'underline',
                      textUnderlineOffset: 10,
                      px: 2,
                    }}
                  >
                    {service.title}
                  </Typography>
                </ImageOverlay>
                <HoverOverlay className="overlay">
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.description}
                  </Typography>
                </HoverOverlay>
              </ImageWrapper>
            </Grid>
          ))}
        </Grid>

        <FoundedSection />

        <BlockSection />

        <Box
          sx={{
            my: 4,
            mb: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              maxWidth: '800px',
              mx: 'auto',
              color: 'text.secondary',
              lineHeight: 1.8,
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            }}
          >
            As Central Florida's premier pool and outdoor living specialist
            since 2015, Pure Life Pools transforms ordinary backyards into
            extraordinary retreats. Our licensed professionals combine
            innovative design with meticulous craftsmanship to create stunning
            outdoor spaces that perfectly match your lifestyle and exceed your
            expectations.
          </Typography>
        </Box>

        <PoolProductsSection router={router} />

        <TestimonialsSection />

        <Footer />
      </Box>
    </>
  );
};

export default Home;
