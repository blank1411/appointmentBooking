import { makeStyles, Input, tokens } from "@fluentui/react-components";
import { Location, FormErrors } from "../../types/ServiceProvider";

const useStyles = makeStyles({
  formSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  formRow: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    "@media (min-width: 768px)": {
      flexDirection: "row",
    },
    marginTop: "4px",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  label: {
    fontWeight: "500",
    marginBottom: "4px",
  },
  errorMessage: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: "12px",
    marginTop: "4px",
  },
  locationSection: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: "8px",
    padding: "16px",
  },
  locationTitle: {
    marginBottom: "16px",
    fontWeight: "600",
  },
});

interface LocationSectionProps {
  location: Location;
  errors?: FormErrors["location"];
  onLocationChange: (field: string, value: string) => void;
}

function LocationSection({
  location,
  errors,
  onLocationChange,
}: LocationSectionProps) {
  const classes = useStyles();

  return (
    <div className={classes.formSection}>
      <h3 className={classes.locationTitle}>Location Information</h3>
      <div className={classes.locationSection}>
        <div className={classes.formField}>
          <label className={classes.label} htmlFor="address">
            Address *
          </label>
          <Input
            id="address"
            value={location.address}
            onChange={(e) => onLocationChange("address", e.target.value)}
            placeholder="Street address"
            required
          />
          {errors?.address && (
            <span className={classes.errorMessage}>{errors.address}</span>
          )}
        </div>

        <div className={classes.formRow}>
          <div className={classes.formField}>
            <label className={classes.label} htmlFor="city">
              City *
            </label>
            <Input
              id="city"
              value={location.city}
              onChange={(e) => onLocationChange("city", e.target.value)}
              placeholder="City"
              required
            />
            {errors?.city && (
              <span className={classes.errorMessage}>{errors.city}</span>
            )}
          </div>

          <div className={classes.formField}>
            <label className={classes.label} htmlFor="zipCode">
              ZIP Code *
            </label>
            <Input
              id="zipCode"
              value={location.zipCode}
              onChange={(e) => onLocationChange("zipCode", e.target.value)}
              placeholder="ZIP code"
              required
            />
            {errors?.zipCode && (
              <span className={classes.errorMessage}>{errors.zipCode}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationSection;
