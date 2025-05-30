import React, { useState } from "react";
import {
  Button,
  Spinner,
  Text,
  Field,
  Textarea,
  makeStyles,
  tokens,
  Card,
  CardHeader,
  Title1,
  Title2,
  Body1,
  Caption1,
} from "@fluentui/react-components";
import {
  Calendar20Regular,
  Clock20Regular,
  CheckmarkCircle20Regular,
  ArrowLeft20Regular,
  MoneyRegular,
} from "@fluentui/react-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AppointmentBookingProps,
  AvailableTimeDto,
  CreateAppointmentDto,
} from "../../types/Appointment";
import {
  fetchAvailableDates,
  fetchAvailableSlots,
  createAppointment,
} from "../../api/AppointmentApi";
import { useAuth } from "../../Context/AuthContext";

const useStyles = makeStyles({
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: tokens.spacingVerticalXXL,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXL,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL,
  },
  backButton: {
    minWidth: "auto",
  },
  serviceInfo: {
    padding: tokens.spacingVerticalL,
  },
  serviceDetails: {
    display: "flex",
    gap: tokens.spacingHorizontalL,
    marginTop: tokens.spacingVerticalM,
  },
  serviceDetail: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  bookingSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: tokens.spacingVerticalXXL,
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
  sectionCard: {
    padding: tokens.spacingVerticalXL,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL,
  },
  dateGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: tokens.spacingVerticalM,
  },
  dateCard: {
    cursor: "pointer",
    textAlign: "center",
    padding: tokens.spacingVerticalL,
    border: `2px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusLarge,
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      transform: "translateY(-2px)",
      boxShadow: tokens.shadow4,
    },
  },
  selectedDate: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    transform: "translateY(-2px)",
    boxShadow: tokens.shadow8,
  },
  disabledDate: {
    opacity: 0.5,
    cursor: "not-allowed",
    ":hover": {
      backgroundColor: "transparent",
      transform: "none",
      boxShadow: "none",
    },
  },
  timeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: tokens.spacingVerticalM,
  },
  timeSlot: {
    cursor: "pointer",
    padding: tokens.spacingVerticalL,
    border: `2px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusLarge,
    textAlign: "center",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      transform: "translateY(-2px)",
      boxShadow: tokens.shadow4,
    },
  },
  selectedTime: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    transform: "translateY(-2px)",
    boxShadow: tokens.shadow8,
  },
  disabledTime: {
    opacity: 0.5,
    cursor: "not-allowed",
    backgroundColor: tokens.colorNeutralBackground4,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground4,
      transform: "none",
      boxShadow: "none",
    },
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "300px",
  },
  successMessage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacingVerticalL,
    padding: tokens.spacingVerticalXXL,
    backgroundColor: tokens.colorPaletteGreenBackground1,
    borderRadius: tokens.borderRadiusLarge,
    color: tokens.colorPaletteGreenForeground1,
    textAlign: "center",
  },
  bookingActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: tokens.spacingVerticalXL,
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    position: "sticky",
    bottom: 0,
    marginTop: "auto",
  },
  bookingButton: {
    minWidth: "200px",
  },
  emptyState: {
    textAlign: "center",
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground2,
  },
});

const AppointmentBookingPage: React.FC<AppointmentBookingProps> = ({
  serviceProviderId,
  serviceId,
  serviceName,
  serviceDuration,
  servicePrice,
  onBack,
  onSuccess,
}) => {
  const classes = useStyles();
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] =
    useState<AvailableTimeDto | null>(null);
  const [notes, setNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fetch available dates
  const {
    data: availableDates,
    isLoading: datesLoading,
    error: datesError,
  } = useQuery({
    queryKey: ["availableDates", serviceProviderId, serviceId],
    queryFn: () => fetchAvailableDates(serviceProviderId, serviceId),
  });

  // Fetch available time slots for selected date
  const {
    data: availableSlots,
    isLoading: slotsLoading,
    error: slotsError,
  } = useQuery({
    queryKey: ["availableSlots", serviceProviderId, serviceId, selectedDate],
    queryFn: () =>
      fetchAvailableSlots(serviceProviderId, serviceId, selectedDate),
    enabled: !!selectedDate,
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: (appointment: CreateAppointmentDto) =>
      createAppointment(appointment, token),
    onSuccess: () => {
      setBookingSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["availableDates"] });
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      onSuccess?.();
    },
  });

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (slot: AvailableTimeDto) => {
    setSelectedTimeSlot(slot);
  };

  const handleBookAppointment = () => {
    if (!selectedTimeSlot) return;

    createAppointmentMutation.mutate({
      startTime: selectedTimeSlot.startTime,
      serviceProviderId,
      serviceId,
      notes,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
      dayNumber: date.getDate(),
      monthName: date.toLocaleDateString("en-US", { month: "long" }),
      fullDate: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  };

  const isDateInPast = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  if (bookingSuccess) {
    return (
      <div className={classes.container}>
        <div className={classes.successMessage}>
          <CheckmarkCircle20Regular style={{ fontSize: "48px" }} />
          <Title1>Appointment Booked Successfully!</Title1>
          <Body1>
            Your appointment for <strong>{serviceName}</strong> has been
            requested and is pending confirmation.
          </Body1>
          {selectedTimeSlot && (
            <Card>
              <CardHeader
                header={<Text weight="semibold">Appointment Details</Text>}
                description={
                  <div>
                    <Text>
                      {selectedDate && formatDate(selectedDate).fullDate}
                    </Text>
                    <br />
                    <Text>{selectedTimeSlot.displayTime}</Text>
                  </div>
                }
              />
            </Card>
          )}
          <Button appearance="primary" onClick={onBack}>
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      {/* Header */}
      <div className={classes.header}>
        <Button
          appearance="subtle"
          icon={<ArrowLeft20Regular />}
          onClick={onBack}
          className={classes.backButton}
        >
          Back
        </Button>
        <Title1>Book Appointment</Title1>
      </div>

      {/* Service Information */}
      <Card className={classes.serviceInfo}>
        <CardHeader header={<Title2>{serviceName}</Title2>} />
        {(serviceDuration || servicePrice) && (
          <div className={classes.serviceDetails}>
            {serviceDuration && (
              <div className={classes.serviceDetail}>
                <Clock20Regular />
                <Caption1>{serviceDuration} minutes</Caption1>
              </div>
            )}
            {servicePrice && (
              <div className={classes.serviceDetail}>
                <MoneyRegular />
                <Caption1>${servicePrice.toFixed(2)}</Caption1>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Booking Section */}
      <div className={classes.bookingSection}>
        {/* Date Selection */}
        <Card className={classes.sectionCard}>
          <div className={classes.sectionHeader}>
            <Calendar20Regular />
            <Title2>Select a Date</Title2>
          </div>

          {datesLoading ? (
            <div className={classes.loadingContainer}>
              <Spinner label="Loading available dates..." />
            </div>
          ) : datesError ? (
            <div className={classes.emptyState}>
              <Text>Error loading available dates. Please try again.</Text>
            </div>
          ) : !availableDates?.length ? (
            <div className={classes.emptyState}>
              <Text>No available dates found.</Text>
            </div>
          ) : (
            <div className={classes.dateGrid}>
              {availableDates.map((date) => {
                const { dayName, dayNumber, monthName } = formatDate(date);
                const isPast = isDateInPast(date);
                const isSelected = selectedDate === date;

                return (
                  <div
                    key={date}
                    className={`${classes.dateCard} ${
                      isSelected ? classes.selectedDate : ""
                    } ${isPast ? classes.disabledDate : ""}`}
                    onClick={() => !isPast && handleDateSelect(date)}
                  >
                    <Text size={300} weight="medium">
                      {dayName}
                    </Text>
                    <br />
                    <Text size={600} weight="semibold">
                      {dayNumber}
                    </Text>
                    <br />
                    <Text size={300}>{monthName}</Text>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Time Selection */}
        <Card className={classes.sectionCard}>
          <div className={classes.sectionHeader}>
            <Clock20Regular />
            <Title2>Select a Time</Title2>
          </div>

          {!selectedDate ? (
            <div className={classes.emptyState}>
              <Text>Please select a date first</Text>
            </div>
          ) : slotsLoading ? (
            <div className={classes.loadingContainer}>
              <Spinner label="Loading available times..." />
            </div>
          ) : slotsError ? (
            <div className={classes.emptyState}>
              <Text>Error loading available times. Please try again.</Text>
            </div>
          ) : !availableSlots?.length ? (
            <div className={classes.emptyState}>
              <Text>No available times for selected date.</Text>
            </div>
          ) : (
            <div className={classes.timeGrid}>
              {availableSlots.map((slot) => {
                const isSelected =
                  selectedTimeSlot?.startTime === slot.startTime;

                return (
                  <div
                    key={slot.startTime}
                    className={`${classes.timeSlot} ${
                      isSelected ? classes.selectedTime : ""
                    }`}
                    onClick={() => handleTimeSlotSelect(slot)}
                  >
                    <Text size={400} weight="medium">
                      {slot.displayTime}
                    </Text>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Notes Section */}
      {selectedTimeSlot && (
        <Card className={classes.sectionCard}>
          <Field label="Additional Notes (Optional)">
            <Textarea
              value={notes}
              onChange={(_, data) => setNotes(data.value)}
              placeholder="Any special requirements, preferences, or additional information..."
              rows={4}
            />
          </Field>
        </Card>
      )}

      {/* Booking Actions */}
      <div className={classes.bookingActions}>
        <div>
          {selectedDate && selectedTimeSlot && (
            <Text>
              <strong>Selected:</strong> {formatDate(selectedDate).fullDate} at{" "}
              {selectedTimeSlot.displayTime}
            </Text>
          )}
        </div>
        <Button
          appearance="primary"
          size="large"
          disabled={!selectedTimeSlot || createAppointmentMutation.isPending}
          onClick={handleBookAppointment}
          className={classes.bookingButton}
        >
          {createAppointmentMutation.isPending ? (
            <>
              <Spinner size="tiny" />
              Booking...
            </>
          ) : (
            "Book Appointment"
          )}
        </Button>
      </div>
    </div>
  );
};

export default AppointmentBookingPage;
