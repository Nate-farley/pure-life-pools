// @ts-nocheck
'use client'
import Footer from '@/containers/Footer';
import NavBar from '@/containers/Navbar/navbar';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { NextSeo } from 'next-seo';
import Head from 'next/head';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import specs from '../../scrape/pool-spec.json';
// Carousel images constant
const CAROUSEL_IMAGES = [
  '/assets/images/products-page/product-page-image-two.jpg',
  '/assets/images/products-page/product-page-image-three.jpg',
  '/assets/images/products-page/product-page-image-four.jpg',
  '/assets/images/products-page/product-page-image-five.jpg',
  '/assets/images/products-page/product-page-image-six.jpg',
  '/assets/images/products-page/product-page-image-seven.jpg',
];

// Styled components
const TextContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
  color: 'white',
  padding: theme.spacing(4, 6),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const PaginationContainer = styled(Box)(() => ({
  position: 'absolute',
  bottom: '20px',
  right: '180px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  zIndex: 3,
}));

const PaginationLine = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})(({ isActive }) => ({
  height: '2px',
  width: isActive ? '70px' : '12px',
  backgroundColor: 'white',
  transition: 'all 0.3s ease',
  opacity: isActive ? 1 : 0.5,
}));

const PreviewBox = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  bottom: 80,
  right: 20,
  width: 400,
  height: 200,
  overflow: 'hidden',
  zIndex: 10,
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: 100,
  left: 100,
  color: 'white',
  width: 500,
  zIndex: 2,
  fontWeight: 700,
  fontSize: '3rem',
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  '.MuiOutlinedInput-root': {
    background: 'white',
    borderRadius: '12px',
    '& fieldset': {
      borderColor: 'rgba(0,0,0,0.1)',
    },
  },
  width: '300px',
}));

const ScrollTopButton = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  right: 20,
  zIndex: 9999,
  cursor: 'none',
  backgroundColor: '#133240',
  color: 'white',
  padding: '12px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: '#1a4459',
  },
}));

const PoolImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  paddingTop: '100%',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
}));

const ImageOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'opacity 0.3s ease-in-out',
}));

const SpecsOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.3s ease-in-out',
  '&:hover': {
    opacity: 1,
  },
}));

const TitleOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  padding: theme.spacing(1.5, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

// Optimized PoolCard component
const PoolCard = memo(({ pool }) => {
  //const [specs, setSpecs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
      setShowSpecs(false);
    }, 100); // Small delay to prevent flickering
  };

  const handleInfoMouseEnter = (e) => {
    e.stopPropagation();
    setShowSpecs(true);
  };

  const handleInfoMouseLeave = (e) => {
    e.stopPropagation();
    setShowSpecs(false);
  };

  const getSpecsKey = (poolName) => {
    console.log(poolName)
    console.log(poolName.toLowerCase()
      .replace(/\s+/g, '-')  // Replace spaces with hyphens
      .replace(/\./g, '-'))
    return poolName.toLowerCase()
      .replace(/\s+/g, '-')  // Replace spaces with hyphens
      .replace(/\./g, '-');
  };


  const poolSpecs = specs?.data?.[getSpecsKey(pool.name)];

  const [showSpecs, setShowSpecs] = useState(false);
  return (
    <Box>

      <PoolImageContainer>

        <ImageOverlay
          component="img"
          src={pool.angleImage}
          alt={`${pool.name} angle view`}
          loading="lazy"
        />

        {!pool.name.toLowerCase().includes('corinthian') &&
          !pool.name.toLowerCase().includes('cove') && (
            <ImageOverlay
              component="img"
              src={pool.viewImage}
              alt={`${pool.name} view`}
              sx={{
                opacity: 0,
                zIndex: 2,
                ':hover': {  // Target the parent Box component
                  opacity: 1,
                },
              }}
              loading="lazy"
            />
          )}


        <TitleOverlay sx={{ zIndex: 999, }}>  {/* Ensure title bar stays on top */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            position: 'relative',  // Add this
          }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: '#2F2F2F',
                fontWeight: 700,
                fontSize: '1rem',
                lineHeight: 1.2
              }}
            >
              {pool.name}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                backgroundColor: '#f5f5f5',
                borderRadius: '6px',
                padding: '6px 12px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#eaeaea',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }
              }}
              onMouseEnter={handleInfoMouseEnter}
              onMouseLeave={handleInfoMouseLeave}
            >
              <InfoOutlinedIcon
                sx={{
                  color: '#133240',
                  fontSize: 16
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: '#133240',
                  fontWeight: 500,
                  letterSpacing: '0.02em'
                }}
              >
                View Specs
              </Typography>
            </Box>
          </Box>
        </TitleOverlay>

        {/* Specs Overlay */}
        <Box
          className="specs-overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: showSpecs ? 1 : 0,
            zIndex: showSpecs ? 4 : 1,
            transition: 'opacity 0.3s ease-in-out',
            p: 3,
            pointerEvents: showSpecs ? 'auto' : 'none'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: '#133240',
              mb: 2,
              fontWeight: 600
            }}
          >
            {pool.name}
          </Typography>

          {poolSpecs ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              width: '100%'
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(19, 50, 64, 0.1)',
                pb: 1
              }}>
                <Typography
                  variant="body2"
                  sx={{ color: '#666' }}
                >
                  Size
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#133240',
                    fontWeight: 500
                  }}
                >
                  {poolSpecs.size}
                </Typography>
              </Box>

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(19, 50, 64, 0.1)',
                pb: 1
              }}>
                <Typography
                  variant="body2"
                  sx={{ color: '#666' }}
                >
                  Depth
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#133240',
                    fontWeight: 500
                  }}
                >
                  {poolSpecs.depth}
                </Typography>
              </Box>

              {poolSpecs.gallons !== 'N/A' && (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  pb: 1
                }}>
                  <Typography
                    variant="body2"
                    sx={{ color: '#666' }}
                  >
                    Capacity
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#133240',
                      fontWeight: 500
                    }}
                  >
                    {poolSpecs.gallons}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Typography
              variant="body1"
              sx={{ color: '#666' }}
            >
              Specifications not available
            </Typography>
          )}
        </Box>
      </PoolImageContainer>
    </Box>
  );
});

PoolCard.displayName = 'PoolCard';

const ProductsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeStep, setActiveStep] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Image preloading
  useEffect(() => {
    const preloadImages = () => {
      CAROUSEL_IMAGES.forEach((src) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          setLoadedImages((prev) => ({
            ...prev,
            [src]: true,
          }));
        };
      });
    };

    preloadImages();
  }, []);

  // Carousel autoplay
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prevStep) => (prevStep + 1) % CAROUSEL_IMAGES.length);
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  const getNextImageIndex = useCallback(() => {
    return (activeStep + 1) % CAROUSEL_IMAGES.length;
  }, [activeStep]);

  const handleStepChange = useCallback((step) => {
    if (loadedImages[CAROUSEL_IMAGES[step]]) {
      setActiveStep(step);
    }
  }, [loadedImages]);

  const poolImagePairs = useMemo(() => {
    const productImages = [
      'aruba',
      'astoria_collection',
      'axiom_12',
      'axiom_12_deluxe',
      'axiom_14',
      'axiom_16',
      'barcelona',
      'bay_isle',
      'bermuda',
      'cambridge',
      'cancun',
      'cancun_deluxe',
      'cape_cod',
      'caribbean',
      'claremont',
      'corinthian_12',
      'corinthian_14',
      'corinthian_16',
      'coronado',
      'delray',
      'enchantment_9.17',
      'enchantment_9.21',
      'enchantment_9.24',
      'fiji',
      'genesis',
      'jamaica',
      'java',
      'key_west',
      'kingston',
      'laguna',
      'laguna_deluxe',
      'lake_shore',
      'milan',
      'monaco',
      'olympia_12',
      'olympia_14',
      'olympia_16',
      'pleasant_cove',
      'providence_14',
      'st_lucia',
      'st_thomas',
      'synergy',
      'tuscan_11.20',
      'tuscan_13.24',
      'tuscan_14.27',
      'tuscan_14.30',
      'tuscan_14.40',
      'valencia',
      'vista_isle',
    ];

    return productImages.map((name) => ({
      name: name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      angleImage: `/assets/images/product_images/${name}_angle.jpg`,
      viewImage: `/assets/images/product_images/${name}_view.jpg`,
    }));
  }, []);

  return (
    <Box sx={{ flex: 1 }}>
      <NextSeo
        title="Premium fiberglass Pools in Melbourne, FL"
        description="Explore our collection of premium fiberglass pools, pool covers, and vinyl liners in Palm Bay, Florida, Melbourne and Titusville. Custom pool installations with industry-leading warranties for Brevard County."
        openGraph={{
          type: 'website',
          url: 'https://purelifepools.com',
          title: "Premium fiberglass Pools in Melbourne, FL",
          description: "Explore our collection of premium fiberglass pools, pool covers, and vinyl liners in Palm Bay, Florida, Melbourne and Titusville. Custom pool installations with industry-leading warranties for Brevard County.",
          images: [
            {
              url: 'https://purelifepools.com/assets/images/logo96x96.png',
              width: 96,
              height: 96,
              alt: 'Pure Life Pools Logo',
            }
          ],
          siteName: "Pure Life Pools | +1-321-831-3115",
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: 'fiberglass pools, Melbourne, Titusville, swimming pools, pool covers, vinyl liners, Palm Bay, Florida, Brevard County, pool installation, outdoor kitchens, patios, fire pits, pergolas, artificial turf, landscape'
          },
          {
            property: 'article:modified_time',
            content: '2024-05-06T21:53:36+00:00'
          }
        ]}
      />
      <Head>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: poolImagePairs.map((pool, index) => ({
              '@type': 'Product',
              position: index + 1,
              name: pool.name,
              image: pool.angleImage,
              description: `${pool.name} fiberglass pool in Palm Bay, FL`,
              offers: {
                '@type': 'Offer',
                availability: 'https://schema.org/InStock'
              },
              brand: {
                '@type': 'Brand',
                name: 'Pure Life Pools'
              }
            }))
          })}
        </script>

        {/* Local Business Schema Markup for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Pure Life Pools',
            telephone: '+1-321-831-3115',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Palm Bay',
              addressRegion: 'FL',
              addressCountry: 'US'
            },
            image: '/assets/images/products-page/product-page-image-one.jpg',
            priceRange: '$$',
            areaServed: 'Palm Bay, Florida'
          })}
        </script>
      </Head>

      <NavBar />

      {/* Scroll to top button - only shows when scrolled down */}
      {showScrollTop && (
        <ScrollTopButton onClick={scrollToTop}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </ScrollTopButton>
      )}

      {/* Hero section with carousel */}
      <Box sx={{ position: 'relative', width: '100%', height: '85vh' }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 0,
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
          }}
        >
          {/* Hero content overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: '50%', md: 100 },
              left: { xs: '50%', md: 100 },
              transform: { xs: 'translate(-50%, -50%)', md: 'none' },
              zIndex: 2,
              width: { xs: '90%', sm: '80%', md: 600 },
            }}
          >
            <Typography
              variant="h1"
              sx={{
                color: 'white',
                fontWeight: 700,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                mb: 2,
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              Affordable Pool Covers and Vinyl Liners
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                fontWeight: 300,
                opacity: 0.8,
                lineHeight: 1.4,
                fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              Transform your pool with our premium selection of custom-fit
              covers and designer liners, backed by industry-leading warranties
            </Typography>
          </Box>

          {/* Image carousel */}
          <SwipeableViews
            axis="x"
            index={activeStep}
            onChangeIndex={handleStepChange}
            enableMouseEvents
          >
            {CAROUSEL_IMAGES.map((image, index) => (
              <Box
                key={index}
                sx={{
                  height: '85vh',
                  width: '100%',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: loadedImages[image] ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                />

                <TextContainer>
                  <Stack spacing={1} sx={{ maxWidth: '600px' }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 300,
                        opacity: 0.9,
                        lineHeight: 1.6,
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                      }}
                    >
                      Discover our range of premium pool and outdoor living
                      solutions
                    </Typography>
                  </Stack>

                  {/* Carousel pagination dots */}
                  <PaginationContainer>
                    {CAROUSEL_IMAGES.map((_, i) => (
                      <PaginationLine
                        key={i}
                        isActive={i === activeStep}
                        onClick={() => handleStepChange(i)}
                        sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                      />
                    ))}
                  </PaginationContainer>
                </TextContainer>
              </Box>
            ))}
          </SwipeableViews>

          {/* Preview box for next slide (desktop only) */}
          {!isMobile && (
            <PreviewBox elevation={6}>
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${loadedImages[CAROUSEL_IMAGES[getNextImageIndex()]]
                    ? CAROUSEL_IMAGES[getNextImageIndex()]
                    : CAROUSEL_IMAGES[activeStep]
                    })`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(0.7)',
                  transition: 'background-image 0.3s ease',
                }}
              />
            </PreviewBox>
          )}
        </Paper>
      </Box>

      {/* Pool collection section */}
      <Box sx={{ px: 8, py: 6 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ color: '#133240', fontWeight: 600, mb: 1 }}
            >
              Our Pool Collection
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Browse through our extensive collection of premium pools
            </Typography>
          </Box>
        </Box>

        {/* Pool grid display */}
        <Grid container spacing={2}>
          {poolImagePairs.map((pool, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <PoolCard pool={pool} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Footer />
    </Box>
  );
};

export default ProductsPage;
