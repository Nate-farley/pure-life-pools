import { Box, Grid, Typography, Stack, Container } from '@mui/material';

const ExploreSection = () => {
  return (
    <Box 
      sx={{ 
        py: { xs: 4, sm: 6, md: 10 },
        px: { xs: 2, sm: 4, md: 6, lg: 15 }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {/* Left Block */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                height: { xs: 300, sm: 400, md: '100%' },
                minHeight: { md: 600 },
                borderRadius: 2,
                overflow: 'hidden',
                '&:hover': {
                  '& .overlay': {
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  },
                },
              }}
            >
              {/* Background Image */}
              <Box
                component="img"
                src="/assets/images/GoogleMap.png"
                alt="Left block"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {/* Dark Overlay */}
              <Box
                className="overlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  transition: 'background-color 0.3s ease',
                }}
              />

              {/* Rotated Text - Only rotated on larger screens */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: {
                    xs: 'translate(-50%, -50%)',
                    md: 'translate(-50%, -50%) rotate(-90deg)'
                  },
                  width: 'fit-content',
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -10,
                      left: 0,
                      width: '100%',
                      height: 2,
                      backgroundColor: 'white',
                      transform: 'scaleX(0)',
                      transition: 'transform 0.3s ease',
                    },
                    '&:hover:after': {
                      transform: 'scaleX(1)',
                    },
                  }}
                >
                  Location
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right Stack */}
          <Grid item xs={12} md={6}>
            <Stack spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ height: '100%' }}>
              {/* Top Block */}
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: 200, sm: 250, md: '50%' },
                  borderRadius: 2,
                  overflow: 'hidden',
                  '&:hover': {
                    '& .overlay': {
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    },
                  },
                }}
              >
                <Box
                  component="img"
                  src="/assets/images/PoolDesign.png"
                  alt="Top block"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <Box
                  className="overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    transition: 'background-color 0.3s ease',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                      position: 'relative',
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -10,
                        left: '50%',
                        transform: 'translateX(-50%) scaleX(0)',
                        width: '100%',
                        height: 2,
                        backgroundColor: 'white',
                        transition: 'transform 0.3s ease',
                      },
                      '&:hover:after': {
                        transform: 'translateX(-50%) scaleX(1)',
                      },
                    }}
                  >
                    Design
                  </Typography>
                </Box>
              </Box>

              {/* Bottom Block */}
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: 200, sm: 250, md: '50%' },
                  borderRadius: 2,
                  overflow: 'hidden',
                  '&:hover': {
                    '& .overlay': {
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    },
                  },
                }}
              >
                <Box
                  component="img"
                  src="/assets/images/Installation.png"
                  alt="Bottom block"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <Box
                  className="overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    transition: 'background-color 0.3s ease',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                      position: 'relative',
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -10,
                        left: '50%',
                        transform: 'translateX(-50%) scaleX(0)',
                        width: '100%',
                        height: 2,
                        backgroundColor: 'white',
                        transition: 'transform 0.3s ease',
                      },
                      '&:hover:after': {
                        transform: 'translateX(-50%) scaleX(1)',
                      },
                    }}
                  >
                    Installation
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ExploreSection;