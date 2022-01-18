import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ConfirmationAlert from './ConfirmationAlert';
import IPosting from '../../shared/IPosting';
import { HTTPRequestFactory } from '../../shared/utils';
import { useToken } from '../utils';

import './css/Posting.scss';

export interface IProps extends IPosting {
    removePosting: (id: number) => void;
}

const Posting: React.FC<IProps> = ({ posting_id, posting_date, title, description, image, removePosting }) => {
    const token = useToken();
    const [openDialog, setOpen] = React.useState(false);

    const openConfirmDialog: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();

        setOpen(true);
    }

    const deletePosting = async () => {
        const factory = new HTTPRequestFactory({ authorizationToken: token });

        try {
            const response = await factory.delete<void>(`/api/postings/${posting_id}`);
            removePosting(posting_id);
        } catch (error) {
            console.error(error);
        }
    };

    const onNegative: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        setOpen(false);
    };

    const onPositive: React.MouseEventHandler<HTMLButtonElement> = async (event) => {
        event.preventDefault();
        setOpen(false);
        await deletePosting();
    };

    const alertTitle = "Confirm";
    const alertBody = <React.Fragment>
        Are you sure you want to <strong>permanently</strong> delete this post?
    </React.Fragment>;

    return (
        <Card className="posting-card" variant='outlined'>
            <ConfirmationAlert open={openDialog} onNegative={onNegative} onPositive={onPositive} title={alertTitle} body={alertBody} />
            <CardMedia component="img" image={`/assets/uploads/${image}`} style={{ maxWidth: 200 }} />
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {title}
                    <Typography variant="caption" marginLeft={3}>
                        {new Date(posting_date).toLocaleDateString()}
                    </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small">Share</Button>
                <Button size="small">Edit</Button>
                <Button size="small" onClick={openConfirmDialog}>Delete</Button>
            </CardActions>
        </Card>
    );
}

export default Posting;
