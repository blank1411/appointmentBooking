import {
  makeStyles,
  Text,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import { CalendarClock, DollarSign, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Service } from "../../types/Service";

const useStyles = makeStyles({
  itemContainer: {
    display: "flex",
    padding: "2px 12px",
    alignItems: "center",
    cursor: "pointer",
    borderRadius: "4px",
    margin: "0 4px",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  content: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    overflow: "hidden",
  },
  serviceName: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  providerName: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  metaContainer: {
    display: "flex",
    gap: "12px",
    marginTop: "4px",
    alignItems: "center",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
  icon: {
    flexShrink: 0,
  },
  arrowIcon: {
    marginLeft: "auto",
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
  },
  unavailable: {
    opacity: 0.6,
  },
  badge: {
    fontSize: tokens.fontSizeBase100,
    padding: "2px 6px",
    borderRadius: "4px",
    backgroundColor: tokens.colorStatusSuccessBackground1,
    color: tokens.colorStatusSuccessForeground1,
  },
  unavailableBadge: {
    backgroundColor: tokens.colorStatusWarningBackground1,
    color: tokens.colorStatusWarningForeground1,
  },
});

interface SearchServiceItemProps {
  service: Service;
  className?: string;
}

const SearchServiceItem = ({ service, className }: SearchServiceItemProps) => {
  const styles = useStyles();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/book-appointment/${service.serviceProviderId}/${service.id}`);
  };

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(service.price);

  return (
    <div
      className={mergeClasses(
        styles.itemContainer,
        !service.isAvailable && styles.unavailable,
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      <div className={styles.content}>
        <Text className={styles.serviceName}>{service.name}</Text>
        <Text className={styles.providerName}>
          by {service.serviceProviderName}
        </Text>

        <div className={styles.metaContainer}>
          <span className={styles.metaItem}>
            <CalendarClock size={14} className={styles.icon} />
            {service.durationMinutes} min
          </span>

          <span className={styles.metaItem}>
            <DollarSign size={14} className={styles.icon} />
            {formattedPrice}
          </span>

          <span
            className={mergeClasses(
              styles.badge,
              !service.isAvailable && styles.unavailableBadge
            )}
          >
            {service.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>
      </div>

      <ArrowUpRight size={16} className={styles.arrowIcon} />
    </div>
  );
};

export default SearchServiceItem;
