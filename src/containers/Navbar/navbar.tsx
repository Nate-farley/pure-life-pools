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
} from '@mui/material';
import Image from 'next/image';
import { Menu as MenuIcon, X as CloseIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NavBar() {
  const theme = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // TODO: Add pages for reviews, contact
  const menuItems = ['Home', 'Pools', 'Financing', "Contact Us"/*, 'Review'*/];
  const router = useRouter()

  const onClickNavbarItem = (page: string) => {
    switch (String(page).toLowerCase()) {
      case 'home':
        router.push('/');
        break;
      case 'pools':
        router.push('/pools');
        break;
      case 'financing':
        router.push('/financing');
        break;
      case 'review':
        router.push('/review');
        break;
      case 'contact us':
        router.push('/contact');
        break;
      default:
        router.push('/');
    }
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
  //  width: '100%',
    minHeight: '70px',
    px: { xs: 2, sm: 3, md: 4 },
  }}
>
  <Image
    src="/assets/images/plpLogo.png"
    alt="Logo"
    width="80"
    height="50"
  />

  {/* Desktop Menu - Fixed Version */}
  <Box
    sx={{
      display: { xs: 'none', md: 'flex' },
      gap: 2,
   //   position: 'absolute', 
    //  left: '50%', 
   //   transform: 'translateX(-50%)', 
    }}
  >
    {menuItems.map((page) => (
      <Button
        onClick={() => onClickNavbarItem(page)}
        key={page}
        variant="text"
        sx={{
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
    ))}


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

 {!isMobile && <Box />}
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
            {menuItems.map((item) => (
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
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
