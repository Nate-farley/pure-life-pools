// @ts-nocheck
'use client'
import React from 'react';
import emailjs from '@emailjs/browser';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Checkbox,
  Button,
  FormControlLabel,
  FormGroup,
  Divider,
  Grid,
  Stack,
  styled,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import NavBar from '@/containers/Navbar/navbar';
import Footer from '@/containers/Footer';
import { NextSeo } from 'next-seo'
import Head from 'next/head';

// Define TypeScript interfaces
interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  poolModel: string;
  residenceType: {
    personal: boolean;
    owned: boolean;
  };
}

interface Testimonial {
  name: string;
  rating: number;
  review: string;
  avatar?: string;
}

// Styled components using MUI's styled API
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#EEEEEE',
  border: '1px solid #C4C4C4',
  borderRadius: theme.shape.borderRadius,
}));

const ContactTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.common.white,
    transition: 'all 0.3s ease',
    borderRadius: '8px',
    border: 'none',
    
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
    },
    
    '&:hover fieldset': {
      borderColor: 'rgba(19, 50, 64, 0.2)',
    },
    
    '&.Mui-focused fieldset': {
      borderWidth: '1px',
      borderColor: '#133240',
      boxShadow: '0 0 0 4px rgba(19, 50, 64, 0.08)',
    },
  },

  '& .MuiOutlinedInput-input': {
    padding: '14px 16px',
    fontSize: '0.95rem',
    '&::placeholder': {
      color: 'rgba(0, 0, 0, 0.4)',
    },
  },

  '& .MuiInputLabel-root': {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: '0.95rem',
    
    '&.Mui-focused': {
      color: '#133240',
    },
  },

  '& .MuiOutlinedInput-root.Mui-disabled': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.08)',
    },
  },

  // For multiline (textarea) fields
  '& .MuiOutlinedInput-multiline': {
    padding: '0',
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  textTransform: 'none',
  backgroundColor: '#133240',
  fontWeight: 'bold',
}));

const InfoSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const TestimonialCard = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  border: '1px solid #eee',
  backgroundColor: 'rgba(255,255,255,0.70)',
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const PoolSelect = styled(Select)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  
  '& .MuiSelect-select': {
    padding: '14px 16px',
    fontSize: '0.95rem',
  },

  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
  },

  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(19, 50, 64, 0.2)',
  },

  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderWidth: '1px',
    borderColor: '#133240',
    boxShadow: '0 0 0 4px rgba(19, 50, 64, 0.08)',
  },

  // Dropdown icon styling
  '& .MuiSelect-icon': {
    color: '#133240',
    transition: 'transform 0.2s ease',
  },

  '&.Mui-focused .MuiSelect-icon': {
    transform: 'rotate(180deg)',
  },

  // Menu (dropdown) styling
  '& + .MuiMenu-paper': {
    marginTop: '4px',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    
    '& .MuiMenuItem-root': {
      fontSize: '0.95rem',
      padding: '12px 16px',
      transition: 'all 0.2s ease',
      
      '&:hover': {
        backgroundColor: 'rgba(19, 50, 64, 0.04)',
      },
      
      '&.Mui-selected': {
        backgroundColor: 'rgba(19, 50, 64, 0.08)',
        '&:hover': {
          backgroundColor: 'rgba(19, 50, 64, 0.12)',
        },
      },
    },
  },
}));

const ContactPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const testimonials: Testimonial[] = [
    {
      name: 'Sarah Johnson',
      rating: 5,
      review:
        'Exceptional service! They transformed our backyard into a stunning oasis. The attention to detail was remarkable.',
    },
    {
      name: 'Mike Thompson',
      rating: 5,
      review:
        'Professional team that delivered beyond our expectations. The pool installation was seamless.',
    },
    {
      name: 'Emily Davis',
      rating: 5,
      review:
        'Outstanding work on our patio and landscaping. They truly understood our vision and brought it to life.',
    },
  ];

  const [formData, setFormData] = React.useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    poolModel: 'Select a pool type',
    residenceType: {
      personal: false,
      owned: false,
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid email address',
        severity: 'error'
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
  console.log('eee')
    setIsSubmitting(true);
  
    try {
      const templateParams = {
        from_name: `${formData.firstName} ${formData.lastName}`, // Full name of the sender
        reply_to: formData.email,  // Reply-to email address
        message: formData.message, // The actual message
        pool_design: formData.poolModel
      };
  
      // Replace with your actual EmailJS credentials
      await emailjs.send(
        'service_7uzmfe6',  // Replace with your EmailJS service ID
        'template_vp06ecn', // Replace with your EmailJS template ID
        templateParams, {
          publicKey: 'npy9RQX87QKwnksYL'
        }
      ).then(val => console.log(val)).catch(err => console.log(err))
  
      setSnackbar({
        open: true,
        message: 'Thank you.',
        severity: 'success'
      });
  
      // Reset form after successful submission
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
        poolModel: 'Select a pool type',
      });
  
      console.log('finished')
    } catch (error) {
      console.error('Failed to send email:', error);
      setSnackbar({
        open: true,
        message: 'Failed to send message. Please try again later.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box style={{ flex: 1 }}>
      <NextSeo
      title="Contact Pure Life Pools | Fiberglass Pool Installation Palm Bay FL"
      description="Get expert fiberglass pool installation in Palm Bay, FL and Brevard County. Request a free consultation for custom pool designs, installation, and financing. Visit our showroom at 105 Ring Avenue NE or call (321) 831-3115."
      canonical="https://purelifepools.com/contact"
      openGraph={{
        title: 'Contact Pure Life Pools | Fiberglass Pool Installation Palm Bay FL',
        description: 'Get expert fiberglass pool installation in Palm Bay, FL and Brevard County. Request a free consultation for custom pool designs, installation, and financing.',
        type: 'website',
        locale: 'en_US',
        siteName: 'Pure Life Pools'
      }}
      additionalMetaTags={[
        {
          name: 'keywords',
          content: 'fiberglass pools Palm Bay, pool installation Florida, custom pool design, pool consultation, Pure Life Pools contact, swimming pool contractor Palm Bay, pool builders Brevard County'
        }
      ]}
    />
    <Head>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          description: 'Contact Pure Life Pools for expert fiberglass pool installation in Palm Bay, FL and Brevard County',
          provider: {
            '@type': 'LocalBusiness',
            name: 'Pure Life Pools',
            description: 'Premier fiberglass pool installer in Palm Bay, Florida and Brevard County',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '105 Ring Avenue NE',
              addressLocality: 'Palm Bay',
              addressRegion: 'FL',
              postalCode: '32907',
              addressCountry: 'US'
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: '28.0345',
              longitude: '-80.5887'
            },
            telephone: '(321) 831-3115',
            email: 'info@purelifepools.com',
            openingHoursSpecification: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              opens: '10:00',
              closes: '17:00'
            },
            sameAs: []
          },
          mainEntity: {
            '@type': 'WebForm',
            name: 'Pool Consultation Request Form',
            description: 'Request a consultation for fiberglass pool installation in Palm Bay'
          },
          review: testimonials.map(testimonial => ({
            '@type': 'Review',
            reviewRating: {
              '@type': 'Rating',
              ratingValue: testimonial.rating,
              bestRating: '5'
            },
            author: {
              '@type': 'Person',
              name: testimonial.name
            },
            reviewBody: testimonial.review
          }))
        })}
      </script>
    </Head>
      <NavBar />

      <Container maxWidth="lg" sx={{ py: 8, mt: 6 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{ mb: 2, color: '#133240', fontWeight: 'bold' }}
          >
            Contact Us
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Get in touch with our team. We're here to help and answer any
            questions you might have.
          </Typography>
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={6}>
          {/* Left Side - Contact Form */}
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={0}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <ContactTextField
                      required
                      fullWidth
                      label="First Name"
                      variant="outlined"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <ContactTextField
                  required
                  fullWidth
                  label="Last Name"
                  variant="outlined"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ContactTextField
                      required
                      fullWidth
                      label="Email"
                      variant="outlined"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ContactTextField
                      required
                      fullWidth
                      label="Phone Number"
                      variant="outlined"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ContactTextField
                      fullWidth
                      label="Message"
                      variant="outlined"
                      multiline
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={12}>
                  <PoolSelect
  fullWidth
  value={formData.poolModel}
  onChange={(e) => setFormData({ ...formData, poolModel: e.target.value })}
  variant="outlined"
  disabled={isSubmitting}
>
 
                      <MenuItem value="Select a pool type">
                        <em>Select a pool model</em>
                      </MenuItem>
                      <MenuItem value="Aruba">Aruba</MenuItem>
                      <MenuItem value="Astoria Collection">
                        Astoria Collection
                      </MenuItem>
                      <MenuItem value="Axiom 12">Axiom 12</MenuItem>
                      <MenuItem value="Axiom 12 Deluxe">
                        Axiom 12 Deluxe
                      </MenuItem>
                      <MenuItem value="Axiom 14">Axiom 14</MenuItem>
                      <MenuItem value="Axiom 16">Axiom 16</MenuItem>
                      <MenuItem value="Barcelona">Barcelona</MenuItem>
                      <MenuItem value="Bay Isle">Bay Isle</MenuItem>
                      <MenuItem value="Bermuda">Bermuda</MenuItem>
                      <MenuItem value="Cambridge">Cambridge</MenuItem>
                      <MenuItem value="Cancun">Cancun</MenuItem>
                      <MenuItem value="Cancun Deluxe">Cancun Deluxe</MenuItem>
                      <MenuItem value="Cape Cod">Cape Cod</MenuItem>
                      <MenuItem value="Caribbean">Caribbean</MenuItem>
                      <MenuItem value="Claremont">Claremont</MenuItem>
                      <MenuItem value="Corinthian 12">Corinthian 12</MenuItem>
                      <MenuItem value="Corinthian 14">Corinthian 14</MenuItem>
                      <MenuItem value="Corinthian 16">Corinthian 16</MenuItem>
                      <MenuItem value="Coronado">Coronado</MenuItem>
                      <MenuItem value="Delray">Delray</MenuItem>
                      <MenuItem value="Enchantment 9.17">
                        Enchantment 9.17
                      </MenuItem>
                      <MenuItem value="Enchantment 9.21">
                        Enchantment 9.21
                      </MenuItem>
                      <MenuItem value="Enchantment 9.24">
                        Enchantment 9.24
                      </MenuItem>
                      <MenuItem value="Fiji">Fiji</MenuItem>
                      <MenuItem value="Genesis">Genesis</MenuItem>
                      <MenuItem value="Jamaica">Jamaica</MenuItem>
                      <MenuItem value="Java">Java</MenuItem>
                      <MenuItem value="Key West">Key West</MenuItem>
                      <MenuItem value="Kingston">Kingston</MenuItem>
                      <MenuItem value="Laguna">Laguna</MenuItem>
                      <MenuItem value="Laguna Deluxe">Laguna Deluxe</MenuItem>
                      <MenuItem value="Lake Shore">Lake Shore</MenuItem>
                      <MenuItem value="Milan">Milan</MenuItem>
                      <MenuItem value="Monaco">Monaco</MenuItem>
                      <MenuItem value="Olympia 12">Olympia 12</MenuItem>
                      <MenuItem value="Olympia 14">Olympia 14</MenuItem>
                      <MenuItem value="Olympia 16">Olympia 16</MenuItem>
                      <MenuItem value="Pleasant Cove">Pleasant Cove</MenuItem>
                      <MenuItem value="Providence 14">Providence 14</MenuItem>
                      <MenuItem value="St Lucia">St Lucia</MenuItem>
                      <MenuItem value="St Thomas">St Thomas</MenuItem>
                      <MenuItem value="Synergy">Synergy</MenuItem>
                      <MenuItem value="Tuscan 11.20">Tuscan 11.20</MenuItem>
                      <MenuItem value="Tuscan 13.24">Tuscan 13.24</MenuItem>
                      <MenuItem value="Tuscan 14.27">Tuscan 14.27</MenuItem>
                      <MenuItem value="Tuscan 14.30">Tuscan 14.30</MenuItem>
                      <MenuItem value="Tuscan 14.40">Tuscan 14.40</MenuItem>
                      <MenuItem value="Valencia">Valencia</MenuItem>
                      <MenuItem value="Vista Isle">Vista Isle</MenuItem>
                    </PoolSelect>
                  </Grid>
                  <Grid item xs={12}>
                  <SubmitButton
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={isSubmitting}
                      disableElevation
                    >
                      {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                    </SubmitButton>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography color='text.secondary' variant='caption'>
                    We will never share your personal information without your permission outside of our trusted builder network.
                    </Typography>
                  </Grid>
                </Grid>
              </form>
            </StyledPaper>
          </Grid>

          {/* Right Side - Contact Information */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              <InfoSection>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Chat to Sales
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: 'text.secondary', mb: 1 }}
                >
                  Looking to discuss our services? Our sales team is here to
                  help.
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Available Monday - Friday (10AM - 5PM)
                </Typography>
                <Divider sx={{ mt: 2 }} />
              </InfoSection>

              <InfoSection>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Email Support
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: 'text.secondary', mb: 1 }}
                >
                  Send us an email and we'll get back to you within 24 hours.
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  info@purelifepools.com
                </Typography>
                <Divider sx={{ mt: 2 }} />
              </InfoSection>

              <InfoSection>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Call Us
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: 'text.secondary', mb: 1 }}
                >
                  Prefer to talk? Give us a call during business hours.
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  +1 (321) 831-3115
                </Typography>
                <Divider sx={{ mt: 2 }} />
              </InfoSection>

              <InfoSection>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Palm Bay, Florida
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: 'text.secondary', mb: 1 }}
                >
                  Visit our main office
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  105 Ring Avenue NE
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Palm Bay, FL 32907
                </Typography>
              </InfoSection>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        {/* Video Background */}
        <Box
          component="video"
          autoPlay
          muted
          loop
          playsInline
          src="/assets/videos/placeholder/pool_woman.mp4"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0,
          }}
        />

        {/* Dark Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1,
          }}
        />

        {/* Content Overlay */}
        <Container
          maxWidth="lg"
          sx={{
            position: 'relative',
            zIndex: 2,
            py: { xs: 6, sm: 8, md: 12 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'center', sm: 'flex-start' },
              mb: { xs: 4, md: 6 },
            }}
          >
            <Box
              sx={{
                textAlign: { xs: 'center', sm: 'left' },
                mb: { xs: 3, sm: 0 },
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  mb: 1,
                  fontSize: { xs: '1.5rem', md: '2.125rem' },
                }}
              >
                Hear from our clients
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  opacity: 0.8,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                Don't take our word for it. Trust our customers.
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <TestimonialCard
                  elevation={0}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#262626',
                        fontWeight: 600,
                        fontSize: { xs: '1rem', md: '1.25rem' },
                      }}
                    >
                      {testimonial.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Box
                          key={i}
                          component="span"
                          sx={{
                            color: '#FFB400',
                            fontSize: { xs: 16, md: 20 },
                          }}
                        >
                          ★
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      color: '#666666',
                      lineHeight: 1.6,
                      fontSize: { xs: '0.875rem', md: '1rem' },
                    }}
                  >
                    {testimonial.review}
                  </Typography>
                </TestimonialCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </Box>
  );
};

export default ContactPage;
