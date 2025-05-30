import * as React from "react";
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Drawer,
  Button,
  Spinner,
  makeStyles,
  tokens,
  useRestoreFocusSource,
  useRestoreFocusTarget,
} from "@fluentui/react-components";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../Context/AuthContext";
import { Dismiss24Regular, Navigation20Filled } from "@fluentui/react-icons";
import { Business } from "../../../types/ServiceProvider";
import HomeSideBarItem from "./HomeSideBarItem";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles({
  root: {
    overflow: "hidden",
    display: "flex",
    position: "relative",
    height: "48px",
    backgroundColor: "transparent",
  },

  content: {
    flex: "1",
    display: "grid",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gridRowGap: tokens.spacingVerticalXXL,
    gridAutoRows: "max-content",
  },

  topLeftButton: {
    backgroundColor: "transparent !important",
    color: "#000", // Change to desired visible color
    border: "none !important",
    boxShadow: "none !important",
    minWidth: "auto !important",
    // Override hover, active, and focus states:
    "&:hover": {
      backgroundColor: "transparent !important",
      color: "#000",
    },
    "&:active": {
      backgroundColor: "transparent !important",
      color: "#000",
    },
    "&:focus": {
      backgroundColor: "transparent !important",
      color: "#000",
    },
    // If the icon is inside an SVG, force its fill to be the same color:
    "& svg": {
      fill: "#000",
    },
  },

  field: {
    display: "grid",
    gridRowGap: tokens.spacingVerticalS,
  },
});

const HomeSideBar = () => {
  const styles = useStyles();

  const [isOpen, setIsOpen] = React.useState(false);
  const { token } = useAuth();
  let navigate = useNavigate();

  // all Drawers need manual focus restoration attributes
  // unless (as in the case of some inline drawers, you do not want automatic focus restoration)
  const restoreFocusTargetAttributes = useRestoreFocusTarget();
  const restoreFocusSourceAttributes = useRestoreFocusSource();

  const { data, isLoading } = useQuery({
    queryKey: ["myBusinesses"],
    queryFn: async (): Promise<Business[]> => {
      const response = await fetch("/api/serviceproviders/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch your businesses.");
      }

      return response.json();
    },
  });

  return (
    <div className={styles.root}>
      <Drawer
        {...restoreFocusSourceAttributes}
        type="overlay"
        separator
        open={isOpen}
        onOpenChange={(_, { open }) => setIsOpen(open)}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close"
                icon={<Dismiss24Regular />}
                onClick={() => setIsOpen(false)}
              />
            }
          >
            Your Businesses
          </DrawerHeaderTitle>
        </DrawerHeader>

        <DrawerBody>
          {isLoading && <Spinner />}

          {data?.map((business) => (
            <HomeSideBarItem
              business={business}
              onClick={() => navigate(`/service-provider/${business.id}`)}
            />
          ))}
        </DrawerBody>
      </Drawer>

      <div className={styles.content}>
        <Button
          {...restoreFocusTargetAttributes}
          className={styles.topLeftButton}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Navigation20Filled />
        </Button>
      </div>
    </div>
  );
};

export default HomeSideBar;
