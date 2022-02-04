import * as React from 'react';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete from '@mui/material/Autocomplete';
import { useToken } from '../utils';
import { HTTPRequestFactory } from '../../shared/utils';
import { selectUser } from '../reducers/userSlice';
import { useAppSelector } from '../app/hooks';

import './css/Searchbar.scss';

export interface ISuggestion {
    posting_id: number,
    title: string,
}

const Searchbar: React.FC = () => {
    const user = useAppSelector(selectUser);
    const factory = new HTTPRequestFactory({ authorizationToken: useToken() });

    const [suggestions, setSuggestions] = React.useState<ISuggestion[]>([]);
    const [query, setQuery] = React.useState('');
    const [suggestionsCache, setSuggestionsCache] = React.useState<Record<string, ISuggestion[]>>({});

    const searchRef = React.useRef<HTMLInputElement>(null);

    if (searchRef.current === document.activeElement) {
        searchRef.current.onkeydown = event => {
            event.preventDefault();

            switch (event.key) {
                case 'Enter':
                    return // actually do the search
            }
        }
    }

    const handleQueryInput: React.ChangeEventHandler<HTMLInputElement> = async event => {
        event.preventDefault();

        setQuery(event.target.value);

        try {
            if (query.length > 2 && suggestions.length === 0) {
                return;
            } else if (query.length >= 0) {
                const cached = suggestionsCache;
                if (cached[query]) {
                    setSuggestions(cached[query]);
                } else {
                    const response = await factory.get<ISuggestion[]>(`/api/postings/search?search=${query}`);
                    setSuggestions(response.data);
                    cached[query] = response.data;
                    setSuggestionsCache(cached);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
        <Autocomplete
            options={suggestions}
            getOptionLabel={option => option.title}
            disableClearable
            onChange={(event, value) => {
                event.preventDefault();
                typeof value !== 'string' && setQuery(value.title);
            }}
            renderInput={params => (
                <TextField label="Search"
                    {...params}
                    fullWidth
                    className="search-bar"
                    value={query}
                    inputRef={searchRef}
                    onChange={handleQueryInput}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconButton>
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                        type: 'search',
                        endAdornment: params.InputProps.endAdornment,
                        className: params.InputProps.className,
                        ref: params.InputProps.ref,
                    }}
                />
            )}
        />
        <h1>{user.firstName}</h1>
        </>
    );
};

export default Searchbar;
