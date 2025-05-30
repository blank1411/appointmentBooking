import {
  Card,
  Body1,
  Body2,
  Caption1,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  Location20Regular,
  Phone20Regular,
  Building20Regular,
  ChevronRight20Regular,
} from "@fluentui/react-icons";
import { Location, Business } from "../../../types/ServiceProvider";

const useStyles = makeStyles({
  card: {
    marginBottom: tokens.spacingVerticalM,
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      boxShadow: tokens.shadow8,
      transform: "translateY(-2px)",
    },
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: tokens.spacingVerticalS,
  },

  businessIcon: {
    color: tokens.colorBrandForeground1,
    marginRight: tokens.spacingHorizontalS,
  },

  businessName: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    flex: 1,
  },

  chevronIcon: {
    color: tokens.colorNeutralForeground3,
  },

  description: {
    color: tokens.colorNeutralForeground2,
    marginBottom: tokens.spacingVerticalS,
    lineHeight: "1.4",
  },

  infoRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: tokens.spacingVerticalXS,
  },

  infoIcon: {
    color: tokens.colorNeutralForeground3,
    marginRight: tokens.spacingHorizontalS,
    minWidth: "20px",
  },

  infoText: {
    color: tokens.colorNeutralForeground2,
    flex: 1,
  },

  noPhone: {
    color: tokens.colorNeutralForeground3,
    fontStyle: "italic",
  },
});

interface BusinessCardProps {
  business: Business;
  onClick: () => void;
}

const HomeSideBarItem = ({ business, onClick }: BusinessCardProps) => {
  const styles = useStyles();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const { name, description, phoneNumber, location } = business;

  const formatAddress = (location: Location) => {
    return `${location.address}, ${location.city} ${location.zipCode}`;
  };

  return (
    <Card className={styles.card} onClick={handleClick}>
      <div style={{ padding: tokens.spacingVerticalM }}>
        <div className={styles.cardHeader}>
          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <Building20Regular className={styles.businessIcon} />
            <Body1 className={styles.businessName}>{name}</Body1>
          </div>
          <ChevronRight20Regular className={styles.chevronIcon} />
        </div>

        {description && (
          <Body2 className={styles.description}>{description}</Body2>
        )}

        <div className={styles.infoRow}>
          <Location20Regular className={styles.infoIcon} />
          <Caption1 className={styles.infoText}>
            {formatAddress(location)}
          </Caption1>
        </div>

        <div className={styles.infoRow}>
          <Phone20Regular className={styles.infoIcon} />
          <Caption1
            className={
              phoneNumber
                ? styles.infoText
                : `${styles.infoText} ${styles.noPhone}`
            }
          >
            {phoneNumber || "No phone number"}
          </Caption1>
        </div>
      </div>
    </Card>
  );
};

export default HomeSideBarItem;
