import Footer from '@/containers/Footer'
import NavBar from '@/containers/Navbar/navbar'
import { Container, Divider, Grid, Typography, Paper } from '@mui/material'
import React from 'react'
import Image from 'next/image'
import { Box } from '@mui/material'
import { NextSeo } from 'next-seo'

function PoolsPage(props: {}) {
  // Image arrays remain the same
  const aboveGroundProductImages = [
    { src: "/assets/images/product_images/above_ground/emerald_metric.jpg", alt: "Emerald Metric" },
    { src: "/assets/images/product_images/above_ground/freeform_metric.jpg", alt: "Freeform Metric" },
    { src: "/assets/images/product_images/above_ground/grecian_metric.jpg", alt: "Grecian Metric" },
    { src: "/assets/images/product_images/above_ground/oval_metric.jpg", alt: "Oval Metric" },
    { src: "/assets/images/product_images/above_ground/rectangle_metric.jpg", alt: "Rectangle Metric" },
    { src: "/assets/images/product_images/above_ground/round_metric.jpg", alt: "Round Metric" },
  ];

  const aboveGroundExampleImages = [
    { src: "/assets/images/product_images/above_ground/examples/1f3a9edfa6cab7ca7df0fbc33afe2614.jpg", alt: "Above Ground Pool Example 1" },
    { src: "/assets/images/product_images/above_ground/examples/34fa9a2461c4116a801ff96927618c6f.jpg", alt: "Above Ground Pool Example 2" },
    { src: "/assets/images/product_images/above_ground/examples/36285f3ccb1bdecb016bdfc3eb9a5946.jpg", alt: "Above Ground Pool Example 3" },
    { src: "/assets/images/product_images/above_ground/examples/36fa7ea712545b61310c0cac76266eb4.jpg", alt: "Above Ground Pool Example 4" },
    { src: "/assets/images/product_images/above_ground/examples/3d9e604e55017ff55b3c5314116d7c86.jpg", alt: "Above Ground Pool Example 5" },
    { src: "/assets/images/product_images/above_ground/examples/4c036078529cb8a8b56db0640ee29a6f.jpg", alt: "Above Ground Pool Example 6" },
  ];

  const ingroundProductImages = [
    { src: "/assets/images/product_images/inground/Inground1.png", alt: "Inground Pool Design 1" },
    { src: "/assets/images/product_images/inground/Inground2.png", alt: "Inground Pool Design 2" },
    { src: "/assets/images/product_images/inground/Inground3.png", alt: "Inground Pool Design 3" },
    { src: "/assets/images/product_images/inground/Inground4.png", alt: "Inground Pool Design 4" },
    { src: "/assets/images/product_images/inground/Inground5.png", alt: "Inground Pool Design 5" },
    { src: "/assets/images/product_images/inground/Inground6.png", alt: "Inground Pool Design 6" },
    { src: "/assets/images/product_images/inground/Inground7.png", alt: "Inground Pool Design 7" },
    { src: "/assets/images/product_images/inground/Inground8.png", alt: "Inground Pool Design 8" },
  ];

  const ingroundExampleImages = [
    { src: "/assets/images/product_images/inground/examples/inground-example1.jpg", alt: "Inground Pool Example 1" },
    { src: "/assets/images/product_images/inground/examples/inground-example2.jpg", alt: "Inground Pool Example 2" },
    { src: "/assets/images/product_images/inground/examples/inground-example3.jpg", alt: "Inground Pool Example 3" },
    { src: "/assets/images/product_images/inground/examples/inground-example4.jpg", alt: "Inground Pool Example 4" },
    { src: "/assets/images/product_images/inground/examples/inground-inground-stair.jpg", alt: "Inground Pool Stairs" },
    { src: "/assets/images/product_images/inground/examples/inground-walk-in-stpes.jpg", alt: "Inground Pool Walk-in Steps" },
  ];

  return (
    <>
      <NextSeo
        title="Above Ground & Inground Pools in Palm Bay, Melbourne FL"
        description="Expert installation of above ground and inground pools in Palm Bay, Melbourne FL & Indian River County. Premium fiberglass pools, professional installation, and superior craftsmanship. Serving Brevard County and surrounding areas."
        openGraph={{
          type: 'website',
          url: 'https://purelifepools.com',
          title: 'Above Ground & Inground Pool Installation | Palm Bay & Melbourne FL',
          description: 'Transforming backyards with premium above ground and inground pools in Palm Bay, Melbourne FL & Indian River County. Professional pool installation, competitive pricing, and lifetime support.',
          images: [
            {
              url: 'https://purelifepools.com/assets/images/logo96x96.png',
              width: 96,
              height: 96,
              alt: 'Pure Life Pools - Palm Bay & Melbourne FL Pool Installation',
            }
          ],
          siteName: "Pure Life Pools Palm Bay | Above Ground & Inground Pools | +1-321-831-3115",
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: 'above ground pools Palm Bay FL, inground pools Melbourne FL, pool installation Indian River County, fiberglass pools Brevard County, swimming pool contractor Palm Bay, pool builder Melbourne FL, above ground pool installation, inground pool construction, pool companies Palm Bay, swimming pools Melbourne FL'
          },
          {
            name: 'geo.region',
            content: 'US-FL'
          },
          {
            name: 'geo.placename',
            content: 'Palm Bay, Melbourne, Indian River County'
          }
        ]}
        twitter={{
          handle: '@purelifepools',
          site: '@purelifepools',
          cardType: 'summary_large_image',
        }}
      />
      
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
        <NavBar />
        
        {/* Hero Section */}
        <Box 
  sx={{ 
    position: 'relative', 
    height: { xs: '60vh', md: '80vh' }, 
    overflow: 'hidden',
    mt: { xs: '70px', md: 0 } // Add top margin on mobile to account for navbar
  }}
>
  <Image
    src="/assets/images/semi_ovalon_water.jpeg"
    alt="Semi Oval Pool"
    layout="fill"
    objectFit="cover"
    quality={100}
    priority
    sizes="100vw"
  />
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      bgcolor: 'rgba(19, 50, 64, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: { xs: '70px 16px 16px 16px', md: 4 }, // Increased top padding on mobile
    }}
  >
    <Typography 
      variant="h1" 
      align="center" 
      sx={{ 
        color: 'white',
        fontSize: { xs: '2.5rem', md: '4rem' },
        fontWeight: 'bold',
        mb: 2,
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }}
    >
      Metric Pools Solutions
    </Typography>
    <Typography 
      variant="h4" 
      align="center" 
      sx={{ 
        color: 'white',
        maxWidth: '800px',
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
        fontSize: { xs: '1.5rem', md: '2.125rem' } // Reduced font size on mobile
      }}
    >
      Crafting your perfect outdoor oasis in Palm Bay and beyond
    </Typography>
  </Box>
</Box>
        
        {/* Above Ground Pools Section */}
        <Box sx={{ bgcolor: 'white', py: 12 }}>
          <Container maxWidth="lg">
            <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 8, textAlign: 'center' }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  color: '#133240',
                  fontWeight: 'bold',
                  mb: 3,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80px',
                    height: '4px',
                    bgcolor: '#133240',
                    borderRadius: '2px'
                  }
                }}
              >
                Above Ground Pools
              </Typography>
              <Typography variant="h5" sx={{ color: '#666', mt: 4 }}>
                Experience the ultimate in backyard relaxation with our stunning collection
              </Typography>
            </Box>
            
            <Grid container spacing={4}>
              {aboveGroundProductImages.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)'
                      }
                    }}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={500}
                      height={500}
                      quality={100}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 12, mb: 6, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ color: '#133240', mb: 3 }}>
                Customer Installations
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', maxWidth: '700px', mx: 'auto', mb: 6 }}>
                See how our above ground pools have transformed backyards across Palm Bay
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {aboveGroundExampleImages.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)'
                      }
                    }}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={600}
                      height={400}
                      quality={100}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Inground Pools Section */}
        <Box sx={{ bgcolor: '#133240', color: 'white', py: 12 }}>
          <Container maxWidth="lg">
            <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 8, textAlign: 'center' }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 3,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80px',
                    height: '4px',
                    bgcolor: 'white',
                    borderRadius: '2px'
                  }
                }}
              >
                Luxury Inground Pools
              </Typography>
              <Typography variant="h5" sx={{ color: '#fff', mt: 4, opacity: 0.9 }}>
                Transform your backyard into a private paradise
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {ingroundProductImages.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)'
                      }
                    }}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={500}
                      height={500}
                      quality={100}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 12, mb: 6, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ color: 'white', mb: 3 }}>
                Premium Installations
              </Typography>
              <Typography variant="body1" sx={{ color: '#fff', opacity: 0.9, maxWidth: '700px', mx: 'auto', mb: 6 }}>
                Discover how our inground pools create stunning backyard retreats
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {ingroundExampleImages.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)'
                      }
                    }}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={600}
                      height={400}
                      quality={100}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Footer />
      </Box>
    </>
  )
}

export default PoolsPage