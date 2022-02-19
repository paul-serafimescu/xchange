import * as React from 'react';
import * as Router from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectCurrentPost, loadCurrentPostAPI } from '../reducers';
import ICurrency from '../../shared/ICurrency';

export enum EControllerState {
    LOADING, VALID, INVALID
}

export const PostingPage: React.FC = () => {
    const params = Router.useParams<Record<string, string>>();
    const currentPost = useAppSelector(selectCurrentPost);
    const dispatch = useAppDispatch();

    const [state, setState] = React.useState(EControllerState.LOADING);

    React.useEffect(() => {
        const postID = Number(params.postingID);

        if (isNaN(postID)) {
            return setState(EControllerState.INVALID);
        } else if (!currentPost || currentPost.posting_id !== postID) {
            dispatch(loadCurrentPostAPI(postID)).then(() => setState(EControllerState.VALID)).catch(err => console.error(err));
        } else {
            setState(EControllerState.VALID);
        }
    }, []);

    const SectionDivider: React.FC = () => (
        <hr
            style={{
                width: '5%',
            }}
        />
    );

    const displayCost = (price: number, currency: ICurrency) => {
        let priceStr = price.toFixed(2);
        switch (currency) {
            case 'USD':
            case 'MXN':
                return `$${priceStr}`;
            case 'ILS':
                return `₪${priceStr}`;
        }
    };

    const render = () => {
        switch (state) {
            case EControllerState.INVALID:
                return (
                   <Paper>
                       <Typography variant="h2">
                           Something went wrong, try again later.
                       </Typography>
                   </Paper>
                );
            case EControllerState.VALID:
                return (
                        <Paper
                            style={{
                                padding: '20px',
                            }}
                            variant='outlined'
                        >
                            <Typography variant="h2" gutterBottom>
                                {currentPost.title}
                            </Typography>
                            <Divider />
                            <Grid container>
                            <Grid item xs={6}>
                                <Box
                                    component="img"
                                    src={`/assets/uploads/${currentPost.image}`}
                                    alt="posting image"
                                    maxWidth="90%"
                                    borderRadius="10px"
                                    marginTop="20px"
                                    marginBottom="20px"
                                />
                                <Typography variant='h6' fontWeight='400'>
                                    {displayCost(currentPost.price, currentPost.currency)}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Paper
                                    style={{
                                        padding: '15px',
                                        textAlign: 'center',
                                        marginTop: '20px',
                                        minHeight: '70%',
                                        maxHeight: '90%',
                                        overflow: 'auto',
                                    }}
                                >
                                    <Typography variant='h5' fontWeight='450' gutterBottom>
                                        DESCRIPTION
                                    </Typography>
                                    <SectionDivider />
                                    <Typography gutterBottom variant='h6' fontWeight='400'>
                                        {currentPost.description}
                                    </Typography>
                                </Paper>
                            </Grid>
                            </Grid>
                        </Paper>
                );
            case EControllerState.LOADING:
                return (
                    <Typography variant="h2">
                        Loading...
                    </Typography>
                );
        }
    }

    return render();
};

export default PostingPage;
