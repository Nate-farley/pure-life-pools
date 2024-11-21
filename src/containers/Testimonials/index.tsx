import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, useTheme, useMediaQuery, Container } from '@mui/material';
import Image from 'next/image';

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const testimonials = [
    {
      name: 'Sarah Johnson',
      rating: 5,
      review: 'Exceptional service! They transformed our backyard into a stunning oasis. The attention to detail was remarkable.',
    },
    {
      name: 'Mike Thompson',
      rating: 5,
      review: 'Professional team that delivered beyond our expectations. The pool installation was seamless.',
    },
    {
      name: 'Emily Davis',
      rating: 5,
      review: 'Outstanding work on our patio and landscaping. They truly understood our vision and brought it to life.',
    },
    {
      name: 'John Smith',
      rating: 5,
      review: 'Incredible work ethic and attention to detail. Our new pool is exactly what we wanted.',
    },
    {
      name: 'Lisa Wilson',
      rating: 5,
      review: 'The team was professional, punctual, and delivered amazing results. Highly recommend!',
    }
  ];

  useEffect(() => {
    fetch('https://randomuser.me/api/?results=' + testimonials.length)
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.results);
      })
      .catch(() => {
        // Fallback if API fails
        console.log('Failed to fetch user avatars');
      });
  }, []);

  const getVisibleCount = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3;
  };

  const visibleCount = getVisibleCount();
  const maxIndex = testimonials.length - visibleCount;

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const reviewsToShow = testimonials.slice(currentIndex, currentIndex + visibleCount).map((review, index) => ({
    ...review,
    // @ts-ignore
    avatar: users[currentIndex + index]?.picture?.large ?? '/api/placeholder/56/56'
  }));

  return (
    <Box
      sx={{
        width: '100%',
        position: 'relative',
        minHeight: { xs: 'auto', md: '600px' },
        mb: { xs: 4, md: 0 },
        backgroundImage: 'url(/assets/images/CustomerFeedbackBackground.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            py: { xs: 6, sm: 8, md: 12 },
            color: 'white',
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'center', sm: 'center' },
              textAlign: { xs: 'center', sm: 'left' },
              gap: { xs: 2, sm: 0 },
              mb: { xs: 4, md: 6 },
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: '#133240',
                  fontWeight: 600,
                  mb: 1,
                  fontSize: { xs: '1.5rem', md: '2.125rem' }
                }}
              >
                Our Customer Feedback
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#133240',
                  opacity: 0.8,
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}
              >
                Don't take our word for it. Trust our customers.
              </Typography>
            </Box>

            {/* {!isMobile && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
        
                  variant="outlined"
                  disabled={currentIndex === 0}
                  size="small"
                  sx={{
                    textTransform: 'none',
                    borderColor: '#133240 !important',
                    color: '#133240',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Previous
                </Button>
                <Button
                  
                  variant="outlined"
                //  disabled={currentIndex >= maxIndex}
                  size="small"
                  sx={{
                    textTransform: 'none',
                    backgroundColor: 'white',
                    color: '#133240',
                    borderColor: '#133240 !important',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                    },
                  }}
                >
                  Next
                </Button>
              </Box>
            )} */}
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: isTablet ? 'column' : 'row' },
              gap: 3,
              overflow: 'hidden',
            }}
          >
            {reviewsToShow.map((review, index) => (
              <Paper
                key={currentIndex + index}
                elevation={0}
                sx={{
                  flex: 1,
                  p: 3,
                  border: '1px solid #eee',
                  backgroundColor: 'rgba(255,255,255,0.70)',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {/* <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <Image
                        src={review.avatar}
                        alt={review.name}
                        fill
                        sizes="56px"
                        style={{ objectFit: 'cover' }}
                      />
                    </Box> */}
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#262626',
                        fontWeight: 600,
                        fontSize: { xs: '1rem', md: '1.25rem' }
                      }}
                    >
                      {review.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[...Array(review.rating)].map((_, i) => (
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
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}
                >
                  {review.review}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;