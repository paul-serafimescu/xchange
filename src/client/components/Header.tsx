import { AppBar, Toolbar, Typography, Switch } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ShoppingIcon from '@mui/icons-material/ShoppingCart';
import * as React from 'react';

export interface HeaderProps {
  currentTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  generateTheme: (dark: boolean) => Theme;
};

export const Header: React.FC<HeaderProps> = ({currentTheme, setTheme, generateTheme}: HeaderProps) => {

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = event => {
    event.preventDefault();
    setTheme(generateTheme(currentTheme === 'light'));
  };

  return (
    <AppBar enableColorOnDark position='fixed' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <MenuIcon sx={{ mr: 2 }} />
        <Typography
          variant='h5'
          noWrap
          component='div'
          sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }}}
        >
          Luna
        </Typography>
        {currentTheme === 'dark' ? <DarkModeIcon htmlColor='yellow' /> : <LightModeIcon htmlColor='yellow' />}
        <Switch color='info' checked={currentTheme === 'dark'} onClick={handleClick} />
        <Typography marginLeft={2}>
          <ShoppingIcon />
          Your Cart
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
