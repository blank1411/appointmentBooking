import { useParams, useLocation, useNavigate } from "react-router-dom";
import AppointmentBookingPage from "./AppointmentBookingPage";

const BookingPageWrapper = () => {
  const { serviceProviderId, serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { service, serviceProviderName } = location.state || {};

  return (
    <AppointmentBookingPage
      serviceProviderId={parseInt(serviceProviderId!)}
      serviceId={parseInt(serviceId!)}
      serviceName={service?.name || "Service"}
      serviceProviderName={serviceProviderName || "Provider"}
      serviceDuration={service?.durationMinutes}
      servicePrice={service?.price}
      onBack={() => navigate(-1)}
      onSuccess={() => navigate("/")}
    />
  );
};

export default BookingPageWrapper;
