import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { HTTPRequestFactory } from '../../shared/utils';
import { useToken } from '../utils';

export enum AuthStatus {
    LOADING = 'LOADING',
    AUTHENTICATED = 'AUTHENTICATED',
    GUEST = 'GUEST',
}

export interface UserState {
    token?: string;
    status: AuthStatus;
    remember: boolean;
    user_id: number;
    email: string;
    firstName: string;
    lastName: string;
    user_avatar: string;
}

const initialState: UserState = {
    token: useToken(),
    status: AuthStatus.LOADING,
    remember: Boolean(localStorage.getItem('token')),
    user_id: null,
    email: null,
    firstName: null,
    lastName: null,
    user_avatar: null,
};

export type UserResponse = { user_id: number, firstName: string, lastName: string, email: string, user_avatar: string };

export const loadUser = createAsyncThunk(
    'user/loadUser',
    async (token: string) => {
        if (!token) {
            return null;
        }
        const factory = new HTTPRequestFactory({ authorizationToken: token });

        const response = await factory.get<UserResponse>('/api/@me');
        return response.data;
    }
);

export const authenticate = createAsyncThunk(
    'user/authenticate',
    async (credentials: { email: string, password: string, remember: boolean}) => {
        const factory = new HTTPRequestFactory();

        try {
            const response = await factory.post<{ token: string, message: string, remember: boolean } & UserResponse>('/api/@me/login', credentials);
            switch (response.status) {
                case 200:
                    return response.data;
                default: return null;
            }
        } catch (error) {
            console.error(error);
        }
    }
);

// TODO: have the server return more data other than just the token
export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logoutUser: (state, action: PayloadAction) => ({ ...state, status: AuthStatus.GUEST }),
    },
    extraReducers: builder => {
        builder.addCase(authenticate.fulfilled, (state, action) => {
            if (action.payload) {
                if (action.payload.remember) {
                    localStorage.setItem('token', action.payload.token);
                } else {
                    sessionStorage.setItem('token', action.payload.token);
                }
                const { token, remember, email, firstName, lastName, user_id, user_avatar } = action.payload;

                state.status = AuthStatus.AUTHENTICATED;
                state.token = token;
                state.remember = remember;
                state.email = email;
                state.firstName = firstName;
                state.lastName = lastName;
                state.user_id = user_id;
                state.user_avatar = user_avatar;
            }
        });

        builder.addCase(loadUser.fulfilled, (state, action) => {
            if (action.payload) {
                const { email, firstName, lastName, user_id, user_avatar } = action.payload;
                
                state.email = email;
                state.firstName = firstName;
                state.lastName = lastName;
                state.user_id = user_id;
                state.user_avatar = user_avatar;
                state.status = AuthStatus.AUTHENTICATED;
            } else {
                state.status = AuthStatus.GUEST;
            }
        });
    }
});

export const { logoutUser } = userSlice.actions;
export const selectUser = (state: RootState) => state.user;

export default userSlice.reducer;
