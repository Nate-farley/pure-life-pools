// pages/financing.tsx
import { Box, Container, Typography, Grid, Button, Card, CardContent, Stack, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import Head from 'next/head';
import NavBar from '@/containers/Navbar/navbar';
import Footer from '@/containers/Footer';
import Image from 'next/image';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
  },
  borderRadius: theme.shape.borderRadius * 2,
}));

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '40vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
}));

const Financing = () => {
  const financingOptions = [
    {
      name: "HFS Financial",
      description: "Swimming pool financing made easy. Get the funds you need quickly with competitive rates and flexible terms.",
      features: [
        "Quick approval process",
        "Competitive interest rates",
        "Loans up to $500,000",
        "Terms up to 20 years",
        "No dealer fees"
      ],
      link: "https://www.hfsfinancial.net/",
      imageUrl: "/assets/images/financing/financing-image-one.jpg"
    },
    {
      name: "Lyon Financial",
      description: "Specializing in swimming pool and home improvement financing with personalized service and great rates.",
      features: [
        "Simple application process",
        "Fixed rates available",
        "Flexible payment options",
        "No prepayment penalties",
        "Dedicated loan specialists"
      ],
      link: "https://www.lyonfinancial.net/",
      imageUrl: "/assets/images/financing/financing-image-two.jpg" 
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>Financing Options - Pure Life</title>
        <meta name="description" content="Flexible financing options for your pool project" />
      </Head>

      <NavBar />

      {/* Hero Section */}
      <HeroSection>
        <Box
          component="img"
          src="/assets/images/financing/financing-image-three.jpg" 
          alt="Financing Background"
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' },
              mb: 2
            }}
          >
            Financing Options
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 300,
              maxWidth: '800px',
              mx: 'auto',
              px: 2
            }}
          >
            Make your dream pool a reality with our flexible financing solutions
          </Typography>
        </Box>
      </HeroSection>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ my: 8 }}>
        {/* Introduction */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#133240',
              mb: 3,
              fontWeight: 600 
            }}
          >
            Choose Your Financing Partner
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              maxWidth: '800px', 
              mx: 'auto',
              color: '#585858' 
            }}
          >
            We've partnered with leading financial institutions to offer you flexible financing options 
            that fit your budget and help bring your pool project to life.
          </Typography>
        </Box>

        {/* Financing Options Grid */}
        <Grid container spacing={4}>
          {financingOptions.map((option, index) => (
            <Grid item xs={12} md={6} key={index}>
              <StyledCard>
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Stack spacing={3}>
                    {/* Logo/Image */}
                    <Box sx={{ height: 200, position: 'relative' }}>
                      <Image
                        src={option.imageUrl}
                        alt={`${option.name} logo`}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>

                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#133240' }}>
                      {option.name}
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary">
                      {option.description}
                    </Typography>

                    <Divider />

                    {/* Features List */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: '#5C83D6', fontWeight: 600 }}>
                        Key Features:
                      </Typography>
                      <Stack spacing={1}>
                        {option.features.map((feature, i) => (
                          <Typography 
                            key={i} 
                            variant="body2" 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              color: '#585858'
                            }}
                          >
                            • {feature}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>

                    <Button
                    disableElevation
                      variant="contained"
                      href={option.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        mt: 'auto',
                        backgroundColor: '#133240',
                        '&:hover': {
                          backgroundColor: '#4B6AAD'
                        }
                      }}
                    >
                      Learn More
                    </Button>
                  </Stack>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        {/* Additional Information */}
        {/* <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Need help choosing the right financing option? Contact our team for personalized assistance.
          </Typography>
          <Button
            variant="outlined"
            sx={{
              mt: 3,
              borderColor: '#133240',
              color: '#133240',
              '&:hover': {
                borderColor: '#133240',
                backgroundColor: 'rgba(19, 50, 64, 0.04)'
              }
            }}
            onClick={() => router.push('/contact')}
          >
            Contact Us
          </Button>
        </Box> */}
      </Container>

      <Footer />
    </Box>
  );
};

export default Financing;