import * as React from 'react';
import { useToken } from '../utils';
import { HTTPRequestFactory } from '../../shared/utils';
import { CssBaseline } from '@mui/material';

export const LoggedInView: React.FC = () => {
  React.useEffect(() => {
    (async () => {
      const factory = new HTTPRequestFactory({ authorizationToken: useToken() });

      try {
        const postings = await factory.get('/api/@me/postings');
        console.log(postings);
      } catch (error) {
        console.error(error);
      }
    })()
  }, []);

  return (
    <>
      <CssBaseline />
      hello
    </>
  );
};

export const LoggedOutView: React.FC = () => {
  return (
    <>
      <CssBaseline />
      hi
    </>
  );
};

const Home: React.FC = () => {
  
  const token = useToken();
  const authenticated = Boolean(token);

  return (
    authenticated ? <LoggedInView /> : <LoggedOutView />
  );
};

export default Home;
