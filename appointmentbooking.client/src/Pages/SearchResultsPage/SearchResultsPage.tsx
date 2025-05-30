import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Spinner, Title1, Text, makeStyles } from "@fluentui/react-components";
import SearchResultsItem from "./SearchResultsItem";
import { Service } from "../../types/Service";
import { useSearchParams } from "react-router-dom";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    padding: "24px",
    maxWidth: "960px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "24px",
  },
  searchContainer: {
    marginBottom: "32px",
  },
  resultsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "48px 0",
  },
  noResults: {
    textAlign: "center",
    padding: "48px 0",
  },
});

export default function SearchResultsPage() {
  const classes = useStyles();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  // Fetch search results
  const {
    data: services,
    isLoading,
    error,
    refetch,
  } = useQuery<Service[]>({
    queryKey: ["searchResults", searchQuery],
    queryFn: async () => {
      try {
        if (!searchQuery || searchQuery.trim().length <= 1) {
          return [];
        }

        const encodedQuery = encodeURIComponent(searchQuery.trim());
        const url = `/api/services/search/${encodedQuery}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }

        return response.json();
      } catch (err) {
        throw err;
      }
    },
    enabled: searchQuery.trim().length > 1,
    staleTime: 30000,
  });
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      refetch();
    }
  }, [searchQuery, refetch]);

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Title1>Search Results</Title1>
        {searchQuery && <Text>&nbsp;Results for: "{searchQuery}"</Text>}
      </div>

      <div className={classes.resultsContainer}>
        {isLoading ? (
          <div className={classes.loadingContainer}>
            <Spinner label="Loading results..." />
          </div>
        ) : error ? (
          <div className={classes.noResults}>
            <Text>Error loading results. Please try again later.</Text>
          </div>
        ) : services && services.length > 0 ? (
          services.map((service) => <SearchResultsItem {...service} />)
        ) : (
          <div className={classes.noResults}>
            <Text>No results found. Try adjusting your search terms.</Text>
          </div>
        )}
      </div>
    </div>
  );
}
