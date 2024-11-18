import { Box, Grid, Typography, Stack } from '@mui/material';

const ExploreSection = () => {
  return (
    <Box sx={{ p: 10, px: 15 }}>
      <Grid container spacing={2} sx={{}}>
        {/* Left Block */}
        <Grid item xs={6}>
          <Box
            sx={{
              position: 'relative',
              height: '100%',
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

            {/* Rotated Text */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-90deg)',
                width: 'fit-content',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 600,
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
               Find Us
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Right Stack */}
        <Grid item xs={6}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            {/* Top Block */}
            <Box
              sx={{
                position: 'relative',
                height: '50%',
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
                  Pool Design
                </Typography>
              </Box>
            </Box>

            {/* Bottom Block */}
            <Box
              sx={{
                position: 'relative',
                height: '50%',
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
    </Box>
  );
};

export default ExploreSection;
