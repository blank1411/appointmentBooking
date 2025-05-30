import { useQuery } from "@tanstack/react-query";
import {
  tokens,
  makeStyles,
  shorthands,
  Title3,
  Body1,
  Button,
  Spinner,
} from "@fluentui/react-components";
import { useNavigate, useParams } from "react-router-dom";
import ServiceItem from "../../Components/Service/ServiceItem";
import { useAuth } from "../../Context/AuthContext";
import { ServicesResponse } from "../../types/Service";

// Custom styles using makeStyles
const useStyles = makeStyles({
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    ...shorthands.padding("20px"),
  },
  header: {
    marginBottom: "20px",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: tokens.colorNeutralStroke1,
    display: "flex",
    justifyContent: "space-between",
    ...shorthands.padding("0", "0", "16px", "0"),
  },
  searchContainer: {
    marginBottom: "24px",
    display: "flex",
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    color: tokens.colorNeutralForeground3,
  },
  searchInput: {
    ...shorthands.padding("12px"),
    width: "100%",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
    margin: "24px 0",
  },
  footer: {
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: tokens.colorNeutralStroke1,
    ...shorthands.padding("16px", "0"),
    marginTop: "32px",
    textAlign: "center",
  },
  emptyState: {
    textAlign: "center",
    ...shorthands.padding("40px", "0"),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  errorMessage: {
    backgroundColor: tokens.colorStatusDangerBackground1,
    color: tokens.colorStatusDangerForeground1,
    ...shorthands.padding("12px"),
    ...shorthands.borderRadius("4px"),
    marginBottom: "16px",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    ...shorthands.padding("40px", "0"),
  },
  statusBadge: {
    marginLeft: "auto",
  },
});

// Main component
export default function ServiceProviderPage() {
  const styles = useStyles();
  const { id } = useParams();
  const { user } = useAuth();
  let navigate = useNavigate();

  // Fetch services using React Query
  const {
    data: response = { serviceProviderOwnerId: "", services: [] },
    isLoading,
    isError,
    error,
  } = useQuery<ServicesResponse>({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await fetch(`/api/serviceproviders/${id}/services`);
      if (response.ok) {
        return response.json();
      }
      if (response.status === 404) {
        return [];
      }
    },
    staleTime: 0,
  });

  const serviceProviderId = Number.parseInt(id!);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title3>Our Services &nbsp;</Title3>
        {user?.id === response?.serviceProviderOwnerId && (
          <Button
            appearance="primary"
            onClick={() => navigate(`/add-service/${id}`)}
          >
            Add a new service
          </Button>
        )}
      </div>

      {isError && !Array.isArray(response.services) && (
        <div className={styles.errorMessage}>
          <Body1>
            {error?.message ||
              "An error occurred while fetching services. Please try again."}
          </Body1>
        </div>
      )}

      {isLoading && (
        <div className={styles.loadingContainer}>
          <Spinner label="Loading services..." />
        </div>
      )}

      {!isLoading && !isError && response.services.length === 0 && (
        <div className={styles.emptyState}>
          <Title3>No services found</Title3>
        </div>
      )}

      {!isLoading &&
        !isError &&
        Array.isArray(response.services) &&
        response.services?.length > 0 && (
          <div className={styles.cardsGrid}>
            {response.services.map((service) => (
              <ServiceItem
                key={service.id}
                service={service}
                editable={user?.id === response?.serviceProviderOwnerId}
                serviceProviderId={serviceProviderId}
              />
            ))}
          </div>
        )}
    </div>
  );
}
