import * as React from 'react';
import Typography from '@mui/material/Typography';

export default function (message: string) {
    const Page: React.FC = () => (
        <Typography variant='h1'>
            {message}
        </Typography>
    );
    return Page;
};
