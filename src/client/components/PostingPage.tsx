import * as React from 'react';
import * as Router from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectCurrentPost, loadCurrentPostAPI } from '../reducers';

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

    const render = () => {
        switch (state) {
            case EControllerState.INVALID:
                return (
                    <>something went wrong</>
                );
            case EControllerState.VALID:
                return (
                    <>{currentPost.title}</>
                );
            case EControllerState.LOADING:
                return (
                    <>loading...</>
                );
        }
    }

    return render();
};

export default PostingPage;
