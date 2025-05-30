import {
  Card,
  Text,
  CardHeader,
  Divider,
  Badge,
  makeStyles,
} from "@fluentui/react-components";
import {
  CheckmarkCircle16Filled,
  DismissCircle16Filled,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { Service } from "../../types/Service";

const useStyles = makeStyles({
  resultCard: {
    width: "100%",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    ":hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
    },
  },
  cardContent: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  serviceInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceAndDuration: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  availability: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  availableText: {
    color: "#107C10",
  },
  unavailableText: {
    color: "#A80000",
  },
});

const SearchResultsItem = ({
  id,
  serviceProviderName,
  name,
  serviceProviderId,
  durationMinutes,
  price,
  isAvailable,
}: Service) => {
  const classes = useStyles();
  let navigate = useNavigate();

  const handleClick = () => {
    navigate(`/book-appointment/${serviceProviderId}/${id}`);
  };

  return (
    <Card
      key={`${id}-${serviceProviderName}`}
      className={classes.resultCard}
      onClick={handleClick}
    >
      <CardHeader
        header={
          <Text weight="semibold" size={600}>
            {name}
          </Text>
        }
      />
      <Divider />
      <div className={classes.cardContent}>
        <div className={classes.serviceInfo}>
          <Text size={300}>{serviceProviderName}</Text>
          <div className={classes.priceAndDuration}>
            <Badge appearance="filled">{durationMinutes} min</Badge>
            <Text weight="semibold">${price}</Text>
          </div>
        </div>
        <div className={classes.availability}>
          {isAvailable ? (
            <>
              <CheckmarkCircle16Filled primaryFill="#107C10" />
              <Text className={classes.availableText}>Available</Text>
            </>
          ) : (
            <>
              <DismissCircle16Filled primaryFill="#A80000" />
              <Text className={classes.unavailableText}>Not available</Text>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SearchResultsItem;
