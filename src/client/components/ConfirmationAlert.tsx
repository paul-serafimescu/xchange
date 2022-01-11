import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export interface IProps {
    open: boolean;
    onNegative: React.MouseEventHandler<HTMLButtonElement>;
    onPositive: React.MouseEventHandler<HTMLButtonElement>;
    title: string | JSX.Element;
    body: string | JSX.Element;
}

const ConfirmationAlert: React.FC<IProps> = ({ open, onNegative, onPositive, title, body }) => {
    return (
        <div>
        <Dialog
            open={open}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                {body}
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={onNegative}>Back</Button>
            <Button onClick={onPositive} autoFocus>
                Confirm
            </Button>
            </DialogActions>
        </Dialog>
        </div>
    );
}

export default ConfirmationAlert;
