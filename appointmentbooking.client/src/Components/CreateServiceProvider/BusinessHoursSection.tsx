import { makeStyles, Input, Switch, tokens } from "@fluentui/react-components";
import { BusinessHoursDto, DAYS_OF_WEEK } from "../../types/ServiceProvider";

const useStyles = makeStyles({
  businessHoursSection: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: "8px",
    padding: "16px",
  },
  sectionTitle: {
    marginBottom: "16px",
    fontWeight: "600",
  },
  dayRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "12px 0",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    "&:last-child": {
      borderBottom: "none",
    },
  },
  dayName: {
    minWidth: "100px",
    fontWeight: "500",
  },
  timeInputs: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
  },
  timeInput: {
    width: "120px",
  },
  closedLabel: {
    color: tokens.colorNeutralForeground3,
    fontStyle: "italic",
  },
  errorMessage: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: "12px",
    marginTop: "4px",
  },
});

interface BusinessHoursSectionProps {
  businessHours: BusinessHoursDto[];
  errors?: string;
  onBusinessHoursChange: (
    dayOfWeek: number,
    field: keyof BusinessHoursDto,
    value: string | boolean
  ) => void;
}

function BusinessHoursSection({
  businessHours,
  errors,
  onBusinessHoursChange,
}: BusinessHoursSectionProps) {
  const classes = useStyles();

  const formatTimeForInput = (time: string): string => {
    return time.substring(0, 5);
  };

  const formatTimeForSubmission = (time: string): string => {
    return time + ":00";
  };

  const handleTimeChange = (
    dayOfWeek: number,
    field: "openTime" | "closeTime",
    value: string
  ) => {
    const formattedTime = formatTimeForSubmission(value);
    onBusinessHoursChange(dayOfWeek, field, formattedTime);
  };

  return (
    <div>
      <h3 className={classes.sectionTitle}>Business Hours</h3>
      <div className={classes.businessHoursSection}>
        {DAYS_OF_WEEK.map((day) => {
          const dayHours = businessHours.find((h) => h.dayOfWeek === day.value);
          return (
            <div key={day.value} className={classes.dayRow}>
              <div className={classes.dayName}>{day.name}</div>
              <Switch
                checked={dayHours?.isOpen || false}
                onChange={(e) =>
                  onBusinessHoursChange(day.value, "isOpen", e.target.checked)
                }
              />
              {dayHours?.isOpen ? (
                <div className={classes.timeInputs}>
                  <Input
                    type="time"
                    className={classes.timeInput}
                    value={formatTimeForInput(dayHours.openTime)}
                    onChange={(e) =>
                      handleTimeChange(day.value, "openTime", e.target.value)
                    }
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    className={classes.timeInput}
                    value={formatTimeForInput(dayHours.closeTime)}
                    onChange={(e) =>
                      handleTimeChange(day.value, "closeTime", e.target.value)
                    }
                  />
                </div>
              ) : (
                <div className={classes.closedLabel}>Closed</div>
              )}
            </div>
          );
        })}
        {errors && <span className={classes.errorMessage}>{errors}</span>}
      </div>
    </div>
  );
}

export default BusinessHoursSection;
