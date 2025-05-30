import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  InputOnChangeData,
  SearchBox,
  SearchBoxChangeEvent,
  Spinner,
  Text,
  Divider,
  makeStyles,
} from "@fluentui/react-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import debounce from "lodash.debounce";
import SearchServiceItem from "../SearchItems/SearchServiceItem";
import { Service } from "../../types/Service";

const useStyles = makeStyles({
  container: {
    position: "relative",
    width: "100%",
    maxWidth: "350px",
    marginTop: "0.4rem",
    marginRight: "100px",
  },
  suggestionsList: {
    position: "absolute",
    top: "40px",
    left: "0",
    width: "100%",
    backgroundColor: "white",
    borderTop: "none",
    zIndex: 10,
    maxHeight: "200px",
    overflowY: "auto",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    padding: "8px 0",
  },
  suggestionItem: {
    width: "100%",
  },
  searchBar: {
    width: "100%",
    marginBottom: "0.2rem",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "8px 0",
  },
  noResults: {
    padding: "8px 16px",
    textAlign: "center",
  },
});

interface SearchBarProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
}

const SearchBar = ({ initialQuery = "", onSearch }: SearchBarProps) => {
  // Get URL search params
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  // Use URL query param if available, otherwise use initialQuery from props
  const [query, setQuery] = useState<string>(urlQuery || initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(
    urlQuery || initialQuery
  );
  let navigate = useNavigate();
  const classes = useStyles();

  // Update query when URL changes
  useEffect(() => {
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
      setDebouncedQuery(urlQuery);
    }
  }, [urlQuery]);

  // Update query when initialQuery prop changes
  useEffect(() => {
    if (initialQuery && initialQuery !== query && !urlQuery) {
      setQuery(initialQuery);
      setDebouncedQuery(initialQuery);
    }
  }, [initialQuery]);

  // only get suggestions every 300 ms
  const debounceQuery = useCallback(
    debounce((value: string) => {
      setDebouncedQuery(value);
    }, 300),
    []
  );

  // search query
  const { data, isLoading, isFetching } = useQuery<Service[]>({
    queryKey: ["topSearchResults", debouncedQuery],
    queryFn: async () => {
      try {
        // Make sure we have a valid query
        if (!debouncedQuery || debouncedQuery.trim().length <= 1) {
          return [];
        }
        // Encode the query parameter properly
        const encodedQuery = encodeURIComponent(debouncedQuery.trim());
        const url = `/api/services/topsearch/${encodedQuery}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (err) {
        throw err;
      }
    },
    enabled: debouncedQuery.trim().length > 1,
    retry: 1,
    staleTime: 30000,
  });

  const suggestions = data || [];
  const loading = isFetching || isLoading;
  const showSuggestions = query.trim().length > 1;

  const handleSearchChange = (
    _event: SearchBoxChangeEvent,
    data: InputOnChangeData
  ) => {
    setQuery(data.value);
    debounceQuery(data.value);
  };

  const handleFullSearch = () => {
    // Only navigate if we're not already on the search results page
    // or if the query has changed
    if (
      window.location.pathname !== "/search-results" ||
      searchParams.get("q") !== query
    ) {
      // Pass the query to search results page via URL parameter
      navigate(`/search-results?q=${encodeURIComponent(query)}`);
    }

    // If onSearch prop is provided, call it with the current query
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className={classes.container}>
      <SearchBox
        placeholder="Search services..."
        value={query}
        onChange={handleSearchChange}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleFullSearch();
          }
        }}
        className={classes.searchBar}
      />
      {showSuggestions && (
        <div className={classes.suggestionsList}>
          {loading ? (
            <div className={classes.loadingContainer}>
              <Spinner size="tiny" />
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((service) => (
              <div key={`${service.id}-${service.serviceProviderName}`}>
                <SearchServiceItem service={service} />
                <Divider appearance="subtle" />
              </div>
            ))
          ) : (
            <div className={classes.noResults}>
              <Text>No results found</Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
