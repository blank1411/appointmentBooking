import { useQuery } from "@tanstack/react-query";
import {
  Title2,
  Spinner,
  Text,
  Button,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import HomePageServiceProviderItem from "./HomePageServiceProviderItem";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import HomeSideBar from "./Sidebar/HomeSideBar";
import { HomePageServiceProvider } from "../../types/ServiceProvider";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    padding: "12px",
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    ...shorthands.padding("16px"),
  },
  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "24px",
  },
  errorText: {
    marginTop: "16px",
    color: tokens.colorPaletteRedForeground1,
  },
  noProvidersText: {
    marginTop: "16px",
    color: tokens.colorNeutralForeground2,
  },
  title: {
    marginBottom: "16px",
    marginLeft: "40px",
  },
  providersGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "1fr 1fr",
    },
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "1fr 1fr 1fr",
    },
  },
  businessesHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginRight: "10px",
    alignItems: "center",
  },
  businessesHeaderNoBus: {
    display: "flex",
    justifyContent: "space-between",
    marginRight: "10px",
    alignItems: "center",
    width: "100%",
  },
  topLeftGroup: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "start",
  },
});

const ServiceProvidersInYourCity = () => {
  const styles = useStyles();
  const { token, isLoggedIn } = useAuth();
  let navigate = useNavigate();

  // Choose the appropriate API endpoint based on authentication status
  const apiEndpoint = isLoggedIn
    ? "/api/serviceproviders/user/city"
    : "/api/serivceproviders";

  // Prepare headers based on authentication status
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add Authorization header only when user is logged in
  if (isLoggedIn && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Use React Query with the dynamic endpoint
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: [isLoggedIn ? "serviceProvidersInCity" : "allServiceProviders"],
    queryFn: () =>
      fetch(apiEndpoint, { headers }).then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      }),
    enabled: true, // The query will run regardless of auth status
  });

  if (isLoading || isFetching) {
    return (
      <div className={styles.centered}>
        <Title2>
          {isLoggedIn ? "Businesses in your city" : "Businesses providers"}
        </Title2>
        <div className={styles.loaderContainer}>
          <Spinner size="large" label="Loading businesses..." />
        </div>
      </div>
    );
  }

  if (!isLoggedIn && error) {
    return (
      <div className={styles.centered}>
        <Title2>
          {isLoggedIn ? "Businesses in your city" : "All businesses"}
        </Title2>
        <Text className={styles.errorText}>
          Could not load businesses. Please try again later.
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centered}>
        <div className={styles.businessesHeaderNoBus}>
          {isLoggedIn && <HomeSideBar />}
          <Title2>
            {isLoggedIn ? "Businesses in your city" : "All businesses"}
          </Title2>
          <Button
            onClick={() => navigate("/register-service-provider")}
            size="small"
            appearance="primary"
            style={{ padding: "4px 8px", height: "28px", fontSize: "12px" }}
          >
            Register your business
          </Button>
        </div>
        <Text className={styles.noProvidersText}>
          {isLoggedIn ? (
            <div>
              <Text>No businesses available in your city at the moment.</Text>
            </div>
          ) : (
            "No businesses available at the moment."
          )}
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.businessesHeader}>
        <div className={styles.topLeftGroup}>
          {isLoggedIn && <HomeSideBar />}
          <Title2 className={styles.title}>
            {isLoggedIn ? "Businesses in your city" : "All businesses"}
          </Title2>
        </div>
        {isLoggedIn && (
          <Button
            onClick={() => navigate("/register-service-provider")}
            size="small"
            appearance="primary"
            style={{ padding: "4px 8px", height: "28px", fontSize: "12px" }}
          >
            Register your business
          </Button>
        )}
      </div>
      <div className={styles.providersGrid}>
        {data.map((provider: HomePageServiceProvider) => (
          <HomePageServiceProviderItem key={provider.id} {...provider} />
        ))}
      </div>
    </div>
  );
};

export default ServiceProvidersInYourCity;
