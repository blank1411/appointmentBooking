import {
  Card,
  CardHeader,
  CardFooter,
  Text,
  Button,
  Avatar,
  Badge,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { Phone as PhoneIcon, MapPin as MapPinIcon } from "lucide-react";
import { HomePageServiceProvider, Location } from "../../types/ServiceProvider";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles({
  card: {
    width: "100%",
    height: "100%",
    boxShadow: tokens.shadow4,
    ":hover": {
      boxShadow: tokens.shadow8,
      transition: "box-shadow 0.3s ease",
    },
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  avatar: {
    flexShrink: 0,
  },
  headerText: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase500,
  },
  locationContainer: {
    display: "flex",
    alignItems: "center",
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  locationIcon: {
    marginRight: "4px",
  },
  contentContainer: {
    ...shorthands.padding("8px", "16px"),
  },
  description: {
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    fontSize: tokens.fontSizeBase200,
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
    "@media (min-width: 640px)": {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
  },
  phoneBadge: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  phoneText: {
    fontSize: tokens.fontSizeBase100,
  },
  buttonContainer: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
    "@media (min-width: 640px)": {
      marginTop: 0,
    },
  },
  noPhoneButtonContainer: {
    display: "flex",
    justifyContent: "end",
    alignContent: "center",
    width: "100%",
  },
  locationLink: {
    color: "black",
  },
});

const HomePageServiceProviderItem = ({
  id,
  name,
  description,
  phoneNumber,
  location,
}: HomePageServiceProvider) => {
  const styles = useStyles();
  let navigate = useNavigate();

  const formatAddress = (location: Location) => {
    return `${location.address}, ${location.city} ${location.zipCode}`;
  };

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const handlePhoneCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <Card className={styles.card}>
      <CardHeader
        image={
          <Avatar
            size={48}
            name={name}
            color="colorful"
            className={styles.avatar}
          >
            {initials}
          </Avatar>
        }
        header={<Text className={styles.headerText}>{name}</Text>}
        description={
          <div className={styles.locationContainer}>
            <MapPinIcon size={16} className={styles.locationIcon} />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(location))}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.locationLink} // Optional: for styling
            >
              <Text>{formatAddress(location)}</Text>
            </a>
          </div>
        }
      />

      <div className={styles.contentContainer}>
        {!description && <Text className={styles.description}> &nbsp;</Text>}
        <Text className={styles.description}>{description}</Text>
      </div>

      <CardFooter className={styles.footer}>
        {phoneNumber ? (
          <>
            <Badge
              appearance="filled"
              color="brand"
              className={styles.phoneBadge}
            >
              <PhoneIcon size={12} />
              <Text className={styles.phoneText}>{phoneNumber}</Text>
            </Badge>

            <div className={styles.buttonContainer}>
              <Button
                appearance="outline"
                size="small"
                onClick={handlePhoneCall}
              >
                Call
              </Button>
              <Button
                appearance="primary"
                size="small"
                onClick={() =>
                  (window.location.href = `/service-provider/${id}`)
                }
              >
                View Details
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.noPhoneButtonContainer}>
            <Button
              appearance="primary"
              size="small"
              onClick={() =>
                navigate(`/service-provider/${id}`, {
                  state: {
                    from: window.location.pathname,
                    name,
                  },
                })
              }
            >
              View Details
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default HomePageServiceProviderItem;
