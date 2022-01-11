import * as React from 'react';
import { useToken } from '../utils';
import { HTTPRequestFactory } from '../../shared/utils';
import { CssBaseline } from '@mui/material';
import Posting from './Posting';
import IPosting from '../../shared/IPosting';

export const LoggedInView: React.FC = () => {
  const [postings, setPostings] = React.useState<IPosting[]>([]);

  const removePosting = (id: number) => setPostings(postings.filter(obj => obj.posting_id !== id));

  React.useEffect(() => {
    (async () => {
      const factory = new HTTPRequestFactory({ authorizationToken: useToken() });

      try {
        const postings = await factory.get<IPosting[]>('/api/@me/postings');
        console.log(postings.data);
        setPostings(postings.data);
      } catch (error) {
        console.error(error);
      }
    })()
  }, []);

  return (
    <>
      <CssBaseline />
      {postings.map(posting => (
        <Posting key={posting.posting_id} {...posting} removePosting={removePosting} />
      ))}
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
