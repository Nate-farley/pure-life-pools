import React, { useState, useEffect, useMemo } from 'react';
import SwipeableViews from 'react-swipeable-views';
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Search } from 'lucide-react';
import NavBar from '@/containers/Navbar/navbar';

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
  cursor: 'pointer',
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

const ProductsPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [poolImages, setPoolImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  useEffect(() => {
    const fetchPoolImages = async () => {
      try {
        const response = await fetch('/api/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: 'https://www.lathampool.com/fiberglass-pool-shapes/',
            className: 'product-card__image__inner',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pool images');
        }

        const data = await response.json();
        console.log(data)
        const angleOnlyImages = data.results.filter((img) =>
          img.filename.includes('angle'),
        );
        setPoolImages(angleOnlyImages);
      } catch (error) {
        console.error('Error fetching pool images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoolImages();
  }, []);

  const images = [
    '/assets/images/products-page/product-page-image-one.jpg',
    '/assets/images/products-page/product-page-image-two.jpg',
    '/assets/images/products-page/product-page-image-three.jpg',
    '/assets/images/products-page/product-page-image-four.jpg',
    '/assets/images/products-page/product-page-image-five.jpg',
    '/assets/images/products-page/product-page-image-six.jpg',
    '/assets/images/products-page/product-page-image-seven.jpg',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prevStep) => (prevStep + 1) % images.length);
    }, 2500);

    return () => clearInterval(timer);
  }, [images.length]);

  const getNextImageIndex = () => {
    return (activeStep + 1) % images.length;
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const extractPoolName = (filename) => {
    const match = filename.match(/._([^_]+)-angle/);
    return match ? match[1] : '';
  };

  const filteredPools = useMemo(() => {
    return poolImages.filter((img) => {
      const name = extractPoolName(img.filename);
      if (!name) return false;
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [poolImages, searchTerm]);

  return (
    <Box sx={{ flex: 1 }}>
      <NavBar />
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
          <SwipeableViews
            axis="x"
            index={activeStep}
            onChangeIndex={handleStepChange}
            enableMouseEvents
          >
            {images.map((image, index) => (
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
                <Box
                  sx={{
                    position: 'absolute',
                    top: 100,
                    left: 100,
                    zIndex: 2,
                    width: 600,
                  }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '3rem',
                      mb: 2,
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
                    }}
                  >
                    Transform your pool with our premium selection of custom-fit
                    covers and designer liners, backed by industry-leading
                    warranties
                  </Typography>
                </Box>
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
                  <PaginationContainer>
                    {images.map((_, i) => (
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
          <PreviewBox elevation={6}>
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${images[getNextImageIndex()]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.7)',
              }}
            />
          </PreviewBox>
        </Paper>
      </Box>

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

        <Grid container spacing={2}>
          {filteredPools.map((pool, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '100%',
                  borderRadius: 1,
                  border: '1px solid #eee',
                  overflow: 'hidden',
                }}
              >
                <Box
                  component="img"
                  src={pool.url}
                  alt="Pool shape"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '12px 16px',
                    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: '#2F2F2F',
                      fontWeight: 500,
                      fontSize: '1rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {extractPoolName(pool.filename)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default ProductsPage;
