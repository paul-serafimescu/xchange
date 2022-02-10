import * as React from 'react';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete from '@mui/material/Autocomplete';
import { IPostingSearch } from './types';
import { HTTPRequestFactory } from '../../shared/utils';
import { selectUser } from '../reducers/userSlice';
import { useAppSelector } from '../app/hooks';
import { v4 as uuid } from 'uuid';

import './css/Searchbar.scss';

export interface ISuggestion {
    posting_id: number,
    title: string,
}

export interface IProps {
    readonly onResults?: (results: IPostingSearch[]) => void | Promise<void>;
}

const Searchbar: React.FC<IProps> = ({ onResults }) => {
    const user = useAppSelector(selectUser);
    const factory = new HTTPRequestFactory({ authorizationToken: user.token });

    const [suggestions, setSuggestions] = React.useState<ISuggestion[]>([]);
    const [query, setQuery] = React.useState('');
    const [suggestionsCache, setSuggestionsCache] = React.useState<Record<string, ISuggestion[]>>({});
    const [uniqueID, setID] = React.useState(uuid());

    const searchRef = React.useRef<HTMLInputElement>(null);

    async function getResults(search: string) {
        try {
            const response = await factory.get<IPostingSearch[]>(`/api/postings/search?search=${search}`);
            setID(uuid());
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    React.useEffect(() => {
        searchRef.current.onkeydown = async event => {
            if (searchRef.current === document.activeElement) {
                switch (event.key) {
                    case 'Enter':
                        if (query.length > 0) {
                            try {
                                const results = await getResults(query);
                                onResults && onResults(results);
                            } catch (error) {
                                console.error(error);
                            }
                        }
                }
            }
        }
    }, [searchRef, query]);

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
        <Autocomplete
            key={uniqueID}
            options={suggestions}
            getOptionLabel={option => option.title}
            disableClearable
            disableCloseOnSelect
            clearIcon={<></>}
            inputValue={query}
            onChange={(event, value) => {
                event.preventDefault();

                if (typeof value === 'object') {
                    setQuery(value.title);
                }
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
                                <IconButton onClick={async event => {
                                    event.preventDefault();
                                    const results = await getResults(query);
                                    onResults && onResults(results);
                                }}>
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                        type: 'search',
                        endAdornment: null,
                        className: params.InputProps.className,
                        ref: params.InputProps.ref,
                        value: query
                    }}
                />
            )}
        />
    );
};

export default Searchbar;
