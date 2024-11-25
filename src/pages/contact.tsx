import React from 'react';
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
} from '@mui/material';
import NavBar from '@/containers/Navbar/navbar';
import Footer from '@/containers/Footer';

// Define TypeScript interfaces
interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
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
    border: '0.5px solid #eee',
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
    residenceType: {
      personal: false,
      owned: false,
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(formData);
  };

  return (
    <Box style={{ flex: 1 }}>
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
                      fullWidth
                      label="First Name"
                      variant="outlined"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <ContactTextField
                      fullWidth
                      label="Last Name"
                      variant="outlined"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ContactTextField
                      fullWidth
                      label="Email"
                      variant="outlined"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ContactTextField
                      fullWidth
                      label="Phone Number"
                      variant="outlined"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
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
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      variant="body1"
                      sx={{ mb: 1, fontWeight: 'bold' }}
                    >
                      What type of residence do you live in?
                    </Typography>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.residenceType.personal}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                residenceType: {
                                  ...formData.residenceType,
                                  personal: e.target.checked,
                                },
                              })
                            }
                          />
                        }
                        label="Personal Residence"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.residenceType.owned}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                residenceType: {
                                  ...formData.residenceType,
                                  owned: e.target.checked,
                                },
                              })
                            }
                          />
                        }
                        label="Owned Residence"
                      />
                    </FormGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <SubmitButton
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disableElevation
                    >
                      Send Inquiry
                    </SubmitButton>
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
                  Available 24/7
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
                  support@company.com
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
                  +1 (555) 123-4567
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
                  123 Business Avenue, FL 32935
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
                Our Customer Feedback
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

      <Footer />
    </Box>
  );
};

export default ContactPage;
