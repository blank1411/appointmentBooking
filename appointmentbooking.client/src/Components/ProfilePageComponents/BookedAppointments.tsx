import {
  Card,
  Title3,
  Spinner,
  Text,
  Button,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { CalendarRegular, ClockRegular } from "@fluentui/react-icons";
import { useAuth } from "../../Context/AuthContext";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { deleteAppointment } from "../../api/AppointmentApi";
import { Appointment } from "../../types/Appointment";

const useStyles = makeStyles({
  appointmentsCard: {
    width: "100%",
    maxWidth: "600px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow16,
  },
  appointmentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  contentSection: {
    padding: "32px",
  },
  appointmentItem: {
    display: "flex",
    alignItems: "center",
    padding: "20px",
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    gap: "16px",
  },
  appointmentIcon: {
    color: tokens.colorBrandForeground1,
    fontSize: "24px",
    flexShrink: 0,
  },
  appointmentDetails: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: "4px",
  },
  appointmentService: {
    fontSize: "16px",
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  appointmentProvider: {
    fontSize: "14px",
    color: tokens.colorNeutralForeground2,
  },
  appointmentTime: {
    fontSize: "14px",
    color: tokens.colorNeutralForeground2,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  appointmentStatus: {
    alignSelf: "flex-start",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: tokens.colorNeutralForeground2,
  },
  errorState: {
    textAlign: "center",
    padding: "40px",
    color: tokens.colorPaletteRedForeground1,
  },
});

const BookedAppointments = () => {
  const { token } = useAuth();
  const styles = useStyles();

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: async () => {
      const response = await fetch("/api/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return new Error("Failed to fetch appointments.");
      }

      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (appointmentId: number) =>
      deleteAppointment(appointmentId, token),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const handleDeleteAppointment = (appointmentId: number) => {
    deleteMutation.mutate(appointmentId);
  };

  const appointments = data === undefined ? [] : data;

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <Card className={styles.appointmentsCard}>
      <div className={styles.contentSection}>
        <Title3
          style={{
            marginBottom: "24px",
            color: tokens.colorNeutralForeground1,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CalendarRegular />
          My Appointments
        </Title3>

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Spinner size="medium" />
          </div>
        ) : isError ? (
          <div className={styles.errorState}>
            <Text>{error.message}</Text>
          </div>
        ) : appointments.length === 0 ? (
          <div className={styles.emptyState}>
            <CalendarRegular
              style={{ fontSize: "48px", marginBottom: "16px" }}
            />
            <Text>No appointments found.</Text>
            <Text style={{ marginTop: "8px" }}>
              Book your first appointment to see it here.
            </Text>
          </div>
        ) : (
          <div className={styles.appointmentsList}>
            {appointments.map((appointment) => {
              const startTime = formatDateTime(appointment.startTime);
              const endTime = formatDateTime(appointment.endTime);

              return (
                <div key={appointment.id} className={styles.appointmentItem}>
                  <CalendarRegular className={styles.appointmentIcon} />
                  <div className={styles.appointmentDetails}>
                    <Text className={styles.appointmentService}>
                      {appointment.serviceName}
                    </Text>
                    <Text className={styles.appointmentProvider}>
                      with {appointment.serviceProviderName}
                    </Text>
                    <div className={styles.appointmentTime}>
                      <ClockRegular style={{ fontSize: "14px" }} />
                      <Text>
                        {startTime.date} • {startTime.time} - {endTime.time}
                      </Text>
                    </div>
                    {appointment.notes && (
                      <Text
                        style={{
                          fontSize: "14px",
                          color: tokens.colorNeutralForeground3,
                          marginTop: "4px",
                        }}
                      >
                        Note: {appointment.notes}
                      </Text>
                    )}

                    <Button
                      appearance="outline"
                      size="small"
                      style={{
                        marginTop: "8px",
                        backgroundColor: "red",
                        color: "white",
                      }}
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending
                        ? "Cancelling..."
                        : "Cancel appointment"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

export default BookedAppointments;
