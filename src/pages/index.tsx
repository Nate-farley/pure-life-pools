import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
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
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import SwipeableViews from "react-swipeable-views";

import { Instagram, Google } from "@mui/icons-material";

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch("https://randomuser.me/api/?results=10")
      .then((response) => response.json())
      .then((data) => setUsers(data.results));
  }, []);

  console.log(users);

  const reviews = [
    {
      name: "Sarah Johnson",
      avatar: users[0]?.picture?.large,
      rating: 5,
      review:
        "Exceptional service! They transformed our backyard into a stunning oasis. The attention to detail was remarkable.",
    },
    {
      name: "Mike Thompson",
      avatar: users[0]?.picture?.large,
      rating: 5,
      review:
        "Professional team that delivered beyond our expectations. The pool installation was seamless.",
    },
    {
      name: "Emily Davis",
      avatar: users[0]?.picture?.large,
      rating: 5,
      review:
        "Outstanding work on our patio and landscaping. They truly understood our vision and brought it to life.",
    },
  ];

  const handleNext = () => {
    //setCurrentIndex((prev) => (prev + 3 >= reviews.length ? 0 : prev + 3));
  };

  const handlePrev = () => {
    // setCurrentIndex((prev) =>
    //   prev - 3 < 0 ? Math.max(0, reviews.length - 3) : prev - 3
    // );
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        py: 20,
        px: 15,
        color: "white",
        //   background: "linear-gradient(rgba(255, 255, 255, 0.6), transparent)",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 6,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ color: "#133240", fontWeight: 600, mb: 1 }}
          >
            Our Customer Feedback
          </Typography>
          <Typography variant="h6" sx={{ color: "#133240", opacity: 0.8 }}>
            Don't take our word for it. Trust our customers.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={handlePrev}
            variant="outlined"
            size="small"
            sx={{
              textTransform: "none",
              borderColor: "#C2C2C2 !important",
              color: "#133240",
              "&:hover": {
                borderColor: "white",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Previous
          </Button>
          <Button
            size="small"
            disableElevation
            onClick={handleNext}
            variant="outlined"
            sx={{
              textTransform: "none",
              backgroundColor: "white",
              color: "#133240",
              borderColor: "#C2C2C2 !important",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.9)",
              },
            }}
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* Reviews Cards */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          overflow: "hidden",
        }}
      >
        {reviews.slice(currentIndex, currentIndex + 3).map((review, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              flex: 1,
              p: 3,
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ color: "#262626", fontWeight: 500 }}
                >
                  {review.name}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {[...Array(review.rating)].map((_, i) => (
                  <Box
                    key={i}
                    component="span"
                    sx={{
                      color: "#FFB400",
                      fontSize: 20,
                    }}
                  >
                    ★
                  </Box>
                ))}
              </Box>
            </Box>
            <Typography sx={{ color: "#666666", lineHeight: 1.6 }}>
              {review.review}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

const Footer = () => {
  const theme = useTheme();

  const menuItems = {
    Products: ["Liners", "Covers"],
    Support: ["FAQ", "Contact", "Location"],
    Company: ["About", "Reviews"],
  };

  return (
    <Box sx={{ bgcolor: "#262626", color: "white", py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={30}>
          {/* Contact Form Section */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
              We will reach out to you.
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="US+1 (555) 000-0000"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.23)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white",
                  },
                },
                "& .MuiFormHelperText-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              }}
              helperText="Leave a US based phone number and we will reach out to you."
            />
          </Grid>

          {/* Menu Sections */}
          {Object.entries(menuItems).map(([category, items]) => (
            <Grid item xs={12} sm={6} md={2} key={category}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                {category}
              </Typography>
              <Stack spacing={1}>
                {items.map((item) => (
                  <Link
                    key={item}
                    href="#"
                    underline="none"
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      "&:hover": {
                        color: "white",
                      },
                      transition: "color 0.2s",
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        {/* Divider and Social Icons */}
        <Divider
          sx={{ mt: 6, mb: 4, borderColor: "rgba(255, 255, 255, 0.12)" }}
        />

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          alignItems="center"
        >
          <IconButton
            aria-label="Instagram"
            sx={{
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            <Instagram />
          </IconButton>
          <IconButton
            aria-label="Google"
            sx={{
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            <Google />
          </IconButton>
        </Stack>
      </Container>
    </Box>
  );
};

const StyledVideo = styled("video")(({ theme }) => ({
  width: "100%",
  height: "100%",
  objectFit: "cover",
}));

const ImageWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  aspectRatio: "1/1",
  height: 300,
  overflow: "hidden",
  borderRadius: theme.shape.borderRadius,
  "&:hover .overlay": {
    transform: "translateY(0)",
  },
  "&:hover img": {
    transform: "scale(1.05)",
  },
}));

const StyledImage = styled(Image)(({ theme }) => ({
  transition: "transform 0.3s ease-in-out",
}));

const ImageOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)", // Dark overlay
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1,
}));

const HoverOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "rgba(255, 255, 255, 0.6)",
  padding: theme.spacing(2),
  transform: "translateY(100%)",
  transition: "transform 0.3s ease-in-out",
  zIndex: 2,
}));

const Home = () => {
  const [activeStep, setActiveStep] = useState(0);

  const videos = [
    "/assets/videos/placeholder/pool_woman.mp4",
    "/assets/videos/placeholder/pool_woman.mp4",
    "/assets/videos/placeholder/pool_woman.mp4",
    "/assets/videos/placeholder/pool_woman.mp4",
  ];

  const stockPhotos = [
    "https://picsum.photos/200/",
    "https://picsum.photos/200/",
    "https://picsum.photos/200/",
    "https://picsum.photos/200/",
  ];

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

  useEffect(() => {
    videos.forEach((_, index) => {
      const videoElement = videoRefs[index].current;
      if (videoElement) {
        if (index === activeStep) {
          videoElement.play();
        } else {
          videoElement.pause();
          videoElement.currentTime = 0;
        }
      }
    });
  }, [activeStep]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Video Carousel Section */}
      <Box sx={{ position: "relative", width: "100%", mb: 2 }}>
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            backgroundColor: "background.paper",
            overflow: "hidden",
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
                  position: "relative",
                  width: "100vw",
                  height: "100vh",
                  // 16:9 aspect ratio
                }}
              >
                <StyledVideo ref={videoRefs[index]} playsInline muted loop>
                  <source src={video} type="video/mp4" />
                  Your browser does not support the video tag.
                </StyledVideo>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: "rgba(0,0,0,0.5)",
                    color: "white",
                    padding: 2,
                  }}
                >
                  <Typography variant="h6">Welcome to Pure Life</Typography>
                </Box>
              </Box>
            ))}
          </SwipeableViews>

          {/* <MobileStepper
              steps={videos.length}
              position="static"
              activeStep={activeStep}
              sx={{
                bgcolor: "transparent",
                position: "absolute",
                bottom: 0,
                width: "100%",
              }}
              nextButton={
                <IconButton
                  onClick={handleNext}
                  disabled={activeStep === videos.length - 1}
                  sx={{ color: "white" }}
                >
                  <KeyboardArrowRight />
                </IconButton>
              }
              backButton={
                <IconButton
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  sx={{ color: "white" }}
                >
                  <KeyboardArrowLeft />
                </IconButton>
              }
            /> */}
        </Paper>
      </Box>

      {/* Photo Gallery Section */}
      <Grid container spacing={2} sx={{ px: 2 }}>
        {stockPhotos.map((photo, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <ImageWrapper>
              <StyledImage
                src={photo}
                alt={`Stock photo ${index + 1}`}
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 25vw"
                priority={index < 2}
                style={{ objectFit: "cover" }}
              />
              <ImageOverlay>
                <Typography
                  color="white"
                  variant="h6"
                  align="center"
                  sx={{
                    fontWeight: 600,
                    textDecoration: "underline",
                    textUnderlineOffset: 10,
                    px: 2,
                  }}
                >
                  Pools
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
                  Description Title
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Typography>
              </HoverOverlay>
            </ImageWrapper>
          </Grid>
        ))}
      </Grid>

      <Box p={15}>
        <Stack alignItems="center" direction="row" mb={3}>
          <Box
            sx={{
              backgroundColor: "black",
              width: 100,
              borderBottomColor: "black",
              height: 2,
              borderWidth: 2,
              mr: 2,
            }}
          />
          <Typography fontWeight="bold" variant="h6">
            OPERATING SINCE 1980
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="flex-end">
          <Typography
            fontWeight="bold"
            fontSize={65}
            sx={{ width: 2000, color: "#2F2F2F" }}
          >
            Specializing in pools, pavers, ponds and hardscaping.
          </Typography>
          <Typography color="textSecondary" fontWeight="500">
            We help you create your dream space at your home while ensuring high
            quality work.
          </Typography>
        </Stack>
        <Box
          mt={5}
          display="flex"
          alignItems="flex-end"
          justifyContent="flex-end"
          width="100%"
        >
          <Button
            variant="contained"
            disableElevation
            disableRipple
            sx={{
              borderRadius: 20,
              textTransform: "none",
              backgroundColor: "#2F2F2F",
            }}
          >
            Hire Us
          </Button>
        </Box>
      </Box>

      <Box display="flex" alignItems="center">
        <Box>{/* Map */}</Box>
        {/* Our Company  and Gallery Blocks*/}
        <Box>
          <Stack>
            <Box>{/* Our Company */}</Box>
            <Box>{/* Gallery */}</Box>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ p: 10, px: 15, backgroundColor: "#FAFAFA" }}>
        {/* Products Section */}
        <Box display="flex" alignItems="center">
          <Typography
            component="span"
            sx={{ pr: 1, fontWeight: "600", fontSize: 30, color: "#5C83D6" }}
          >
            Pools
          </Typography>
          <Typography
            component="span"
            sx={{ fontWeight: "600", fontSize: 30, color: "#000000" }}
          >
            from our suppliers
          </Typography>
        </Box>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="body2" sx={{ color: "#585858", width: 600 }}>
            Have questions about pricing, products or service? Fill out the form
            and our friendly team can bet back to you within 24 hours.
          </Typography>

          <Button
            variant="outlined"
            size="small"
            sx={{
              backgroundColor: "white",
              borderColor: "#C2C2C2",
              textTransform: "none",
              color: "black",
            }}
          >
            See More Fiber Pools
          </Button>
        </Stack>
      </Box>

      <Box sx={{ position: "relative", width: "100%" }}>
        {/* Customer Feedback Section */}
        <Image
          width={0}
          height={0}
          sizes="100vw"
          style={{
            width: "100%",
            height: "auto",
          }}
          alt="customer feedback background"
          src="/assets/images/CustomerFeedbackBackground.png"
        />
        <TestimonialsSection />
      </Box>

      <Footer />
      <Box>{/* Footer */}</Box>
    </Box>
  );
};

export default Home;
