import {
  makeStyles,
  Input,
  Textarea,
  tokens,
} from "@fluentui/react-components";
import { FormErrors } from "../../types/ServiceProvider";

const useStyles = makeStyles({
  formSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
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
});

interface BasicInfoSectionProps {
  name: string;
  description: string | undefined;
  phoneNumber: string | undefined;
  errors: Pick<FormErrors, "name" | "description" | "phoneNumber">;
  onInputChange: (field: string, value: string) => void;
}

function BasicInfoSection({
  name,
  description,
  phoneNumber,
  errors,
  onInputChange,
}: BasicInfoSectionProps) {
  const classes = useStyles();

  return (
    <>
      <div className={classes.formSection}>
        <div className={classes.formField}>
          <label className={classes.label} htmlFor="providerName">
            Business Name *
          </label>
          <Input
            id="providerName"
            value={name}
            onChange={(e) => onInputChange("name", e.target.value)}
            placeholder="Enter your business name"
            required
          />
          {errors.name && (
            <span className={classes.errorMessage}>{errors.name}</span>
          )}
        </div>
      </div>

      <div className={classes.formSection}>
        <div className={classes.formField}>
          <label className={classes.label} htmlFor="description">
            Description (optional)
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onInputChange("description", e.target.value)}
            placeholder="Describe your business and services"
            size="large"
          />
          {errors.description && (
            <span className={classes.errorMessage}>{errors.description}</span>
          )}
        </div>
      </div>

      <div className={classes.formSection}>
        <div className={classes.formField}>
          <label className={classes.label} htmlFor="phoneNumber">
            Phone Number (optional)
          </label>
          <Input
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => onInputChange("phoneNumber", e.target.value)}
            placeholder="Enter business phone number"
          />
          {errors.phoneNumber && (
            <span className={classes.errorMessage}>{errors.phoneNumber}</span>
          )}
        </div>
      </div>
    </>
  );
}

export default BasicInfoSection;
