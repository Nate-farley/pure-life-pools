'use client'
import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Typography,
  Menu,
  MenuItem,
  Fade,
} from '@mui/material';
import Image from 'next/image';
import { Menu as MenuIcon, X as CloseIcon, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NavBar() {
  const theme = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [poolsAnchorEl, setPoolsAnchorEl] = useState<null | HTMLElement>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const menuItems = ['Home', 'Pools', 'Financing', "Contact Us", "Our Company", "Gallery"];
  const poolsMenuItems = [
    { label: 'Inground Pools', path: '/pools/metric-pools#inground' },
    { label: 'Above Ground Pools', path: '/pools/metric-pools#above-ground' },
    { label: 'Fiberglass Pools', path: '/pools/fiberglass' },
  ];
  
  const router = useRouter();

  const handlePoolsClick = (event: React.MouseEvent<HTMLElement>) => {
    setPoolsAnchorEl(event.currentTarget);
  };

  const handlePoolsClose = () => {
    setPoolsAnchorEl(null);
  };

  const handlePoolsItemClick = (path: string) => {
    alert(path)
    router.push(path);
    handlePoolsClose();
    setMobileMenuOpen(false);
  };

  const onClickNavbarItem = (page: string) => {
    if (page.toLowerCase() === 'pools') {
      return; // Don't navigate, just show dropdown
    }
    
    switch (String(page).toLowerCase()) {
      case 'home':
        router.push('/');
        break;
      case 'financing':
        router.push('/financing');
        break;
      case 'contact us':
        router.push('/contact');
        break;
      case 'our company':
        router.push('/about');
        break;
      case 'gallery':
        router.push('/gallery');
        break;
      default:
        router.push('/');
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#133240',
          boxShadow: scrolled ? '0px 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
          transition: 'all 0.3s ease-in-out',
          width: '100%',
          zIndex: 9999,
          background: scrolled
            ? '#133240'
            : 'linear-gradient(180deg, rgba(19,50,64,0.6) 0%, rgba(19,50,64,0.2) 100%)',
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '70px',
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Image
            priority
            src="/assets/images/plpLogo.png"
            alt="Logo"
            width="80"
            height="50"
          />

          {/* Desktop Menu */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 2,
            }}
          >
            {menuItems.map((page) => {
              if (page === 'Pools') {
                return (
                  <Box key={page} sx={{ position: 'relative' }}>
                    <Button
                      onClick={handlePoolsClick}
                      variant="text"
                      disableElevation
                      disableFocusRipple
                      disableRipple
                      disableTouchRipple
                      sx={{
                        textTransform: 'none',
                        fontWeight: 'bold',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        '&:hover': {
                          backgroundColor: 'transparent',
                          color: '#5C83D6',
                        },
                        transition: 'color 0.3s ease-in-out',
                      }}
                    >
                      {page}
                      <ChevronDown size={16} />
                    </Button>
                    <Menu
                      anchorEl={poolsAnchorEl}
                      open={Boolean(poolsAnchorEl)}
                      onClose={handlePoolsClose}
                      TransitionComponent={Fade}
                      sx={{
                        '& .MuiPaper-root': {
                          backgroundColor: '#133240',
                          marginTop: '8px',
                          minWidth: '200px',
                          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
                        },
                      }}
                    >
                      {poolsMenuItems.map((item) => (
                        <MenuItem
                          key={item.label}
                          onClick={() => handlePoolsItemClick(item.path)}
                          sx={{
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(92, 131, 214, 0.1)',
                            },
                            padding: '12px 24px',
                          }}
                        >
                          {item.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                );
              }
              return (
                <Button
                  onClick={() => onClickNavbarItem(page)}
                  key={page}
                  variant="text"
                  disableElevation
                  disableFocusRipple
                  disableRipple
                  disableTouchRipple
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'bold',
                    color: 'white',
                    display: 'block',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#5C83D6',
                    },
                    transition: 'color 0.3s ease-in-out',
                  }}
                >
                  {page}
                </Button>
              );
            })}
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            sx={{
              display: { xs: 'flex', md: 'none' },
              color: 'white',
              '&:hover': { color: '#5C83D6' },
              zIndex: 10000,
            }}
            onClick={toggleMobileMenu}
            edge="end"
            aria-label="menu"
          >
            {mobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </IconButton>

          {!isMobile && (
            <Box>
              <Typography variant='body2' fontWeight={'700'} color="white">
                +1 (321) 831-3115
              </Typography>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 300,
            backgroundColor: '#133240',
            color: 'white',
          },
        }}
      >
        <Box sx={{ pt: 2, pb: 2 }}>
          <List sx={{ mt: 5 }}>
            {menuItems.map((item) => {
              if (item === 'Pools') {
                return (
                  <Box key={item}>
                    <ListItem disablePadding>
                      <ListItemButton
                        sx={{
                          py: 2,
                          '&:hover': {
                            backgroundColor: 'rgba(92, 131, 214, 0.1)',
                          },
                        }}
                      >
                        <ListItemText
                          primary={item}
                          primaryTypographyProps={{
                            sx: {
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                    <List sx={{ pl: 3 }}>
                      {poolsMenuItems.map((poolItem) => (
                        <ListItem key={poolItem.label} disablePadding>
                          <ListItemButton
                            onClick={() => handlePoolsItemClick(poolItem.path)}
                            sx={{
                              py: 1.5,
                              '&:hover': {
                                backgroundColor: 'rgba(92, 131, 214, 0.1)',
                              },
                            }}
                          >
                            <ListItemText
                              primary={poolItem.label}
                              primaryTypographyProps={{
                                sx: {
                                  fontSize: '1rem',
                                },
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                );
              }
              return (
                <ListItem key={item} disablePadding>
                  <ListItemButton
                    onClick={() => onClickNavbarItem(item)}
                    sx={{
                      py: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(92, 131, 214, 0.1)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </>
  );
}