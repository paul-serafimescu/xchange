import * as React from 'react';
import * as config from '../../shared/config';
import type { Theme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ShoppingIcon from '@mui/icons-material/ShoppingCart';

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
          {config.APP_NAME}
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
