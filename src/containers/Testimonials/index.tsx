import { Box, Typography, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import  Image  from 'next/image'

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
        avatar: users[0]?.picture?.large ?? "",
        rating: 5,
        review:
          "Exceptional service! They transformed our backyard into a stunning oasis. The attention to detail was remarkable.",
      },
      {
        name: "Mike Thompson",
        avatar: users[0]?.picture?.large ?? "",
        rating: 5,
        review:
          "Professional team that delivered beyond our expectations. The pool installation was seamless.",
      },
      {
        name: "Emily Davis",
        avatar: users[0]?.picture?.large ?? "",
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
                borderColor: "#133240 !important",
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
                borderColor: "#133240 !important",
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
                border: '1px solid #eee',
                backgroundColor: "rgba(255,255,255,0.70)",
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
                    sx={{ color: "#262626", fontWeight: 600 }}
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

  export default TestimonialsSection;