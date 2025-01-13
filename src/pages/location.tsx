import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
  Button,
  styled
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  Pool,
  AccessTime,
  Construction,
  WaterDrop,
  Security
} from '@mui/icons-material';

// Styled components using Material UI's styled API
const StyledHeroSection = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.light,
  padding: theme.spacing(8, 0),
  position: 'relative',
  overflow: 'hidden'
}));

const LocationPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const businessInfo = {
    name: "Azure Pools & Spa",
    address: "789 Oasis Boulevard",
    city: "Palm Springs, CA 92262",
    phone: "(760) 555-0123",
    email: "info@azurepools.com",
    hours: [
      "Monday - Friday: 8:00 AM - 7:00 PM",
      "Saturday: 9:00 AM - 5:00 PM",
      "Sunday: 10:00 AM - 4:00 PM"
    ]
  };

  return (
    <Box>
      {/* App Bar */}
      <AppBar position="sticky" color="primary" elevation={0}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 3 }}>
            <Pool sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {businessInfo.name}
            </Typography>
            <Button variant="contained" color="secondary">
              Book Consultation
            </Button>
          </Box>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <StyledHeroSection>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom>
              Visit Our Showroom
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Experience luxury pool designs and cutting-edge technology
            </Typography>
          </Box>
        </Container>
      </StyledHeroSection>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper sx={{ mb: 6 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            centered
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Location" />
            <Tab label="Showroom" />
            <Tab label="Services" />
          </Tabs>
        </Paper>

        {/* Location Tab Content */}
        <Box hidden={tabValue !== 0}>
          <Grid container spacing={4}>
            {/* Map Card */}
            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardContent sx={{ p: 0, height: 500 }}>
                  <iframe
                    src="https://www.openstreetmap.org/export/embed.html"
                    title="Location Map"
                    style={{ width: '100%', height: '100%', border: 0 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Info Card */}
            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={4}>
                    {/* Address Section */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <IconButton sx={{ bgcolor: 'primary.light', p: 2 }}>
                          <LocationOn color="primary" />
                        </IconButton>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Address
                          </Typography>
                          <Typography color="text.secondary">
                            {businessInfo.address}
                            <br />
                            {businessInfo.city}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Hours Section */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <IconButton sx={{ bgcolor: 'primary.light', p: 2 }}>
                          <AccessTime color="primary" />
                        </IconButton>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Hours
                          </Typography>
                          {businessInfo.hours.map((hours, index) => (
                            <Typography key={index} color="text.secondary">
                              {hours}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    </Grid>

                    {/* Contact Section */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <IconButton sx={{ bgcolor: 'primary.light', p: 2 }}>
                          <Phone color="primary" />
                        </IconButton>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Phone
                          </Typography>
                          <Typography color="text.secondary">
                            {businessInfo.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <IconButton sx={{ bgcolor: 'primary.light', p: 2 }}>
                          <Email color="primary" />
                        </IconButton>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Email
                          </Typography>
                          <Typography color="text.secondary">
                            {businessInfo.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* CTA Buttons */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="contained" fullWidth>
                          Get Directions
                        </Button>
                        <Button variant="outlined" fullWidth>
                          Schedule Visit
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Why Choose Us
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {[
              {
                icon: <Pool />,
                title: "Custom Design",
                description: "Tailored pool designs to match your vision"
              },
              {
                icon: <Construction />,
                title: "Expert Installation",
                description: "Professional installation by certified technicians"
              },
              {
                icon: <Security />,
                title: "Maintenance",
                description: "Comprehensive pool maintenance services"
              }
            ].map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card elevation={2}>
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <IconButton
                      sx={{
                        bgcolor: 'primary.light',
                        mb: 2,
                        p: 2,
                        '&:hover': { bgcolor: 'primary.light' }
                      }}
                    >
                      {feature.icon}
                    </IconButton>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default LocationPage;