import {
  Card,
  CardHeader,
  Title3,
  Badge,
  Body1,
  Caption1,
  CardFooter,
  Button,
  Switch,
} from "@fluentui/react-components";
import {
  ClockRegular,
  MoneyRegular,
  CalendarMonthRegular,
  EditRegular,
} from "@fluentui/react-icons";
import { Service } from "../../types/Service";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

interface ServiceItemProps {
  service: Service;
  editable: boolean;
  serviceProviderId: number;
}

// ServiceItem component
const ServiceItem = ({
  service,
  editable,
  serviceProviderId,
}: ServiceItemProps) => {
  const { isLoggedIn, token } = useAuth();
  let navigate = useNavigate();

  const {
    id: serviceId,
    name,
    description,
    durationMinutes,
    price,
    isAvailable,
  } = service;

  const { mutate } = useMutation({
    mutationFn: async () =>
      fetch(
        `/api/serviceproviders/${serviceProviderId}/services/availability/${serviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
  });

  const [availability, setAvailability] = useState(isAvailable);

  const handleAvailabilityChange = (
    ev: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAvailability(ev.currentTarget.checked);
    mutate();
  };

  return (
    <Card>
      <CardHeader
        header={
          <div
            style={{ display: "flex", alignItems: "flex-start", width: "100%" }}
          >
            <Title3>{name}</Title3>
            <Badge
              color={availability ? "success" : "danger"}
              style={{ marginLeft: "auto" }}
            >
              {availability ? "Available" : "Unavailable"}
            </Badge>
          </div>
        }
        description={
          <Body1>
            <b>{description}</b>
          </Body1>
        }
      />

      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ClockRegular />
            <Caption1>{durationMinutes} mins</Caption1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MoneyRegular />
            <Caption1>${price.toFixed(2)}</Caption1>
          </div>
        </div>
      </div>

      <CardFooter>
        <Button
          appearance="primary"
          disabled={!availability}
          icon={<CalendarMonthRegular />}
          style={{ width: "100%" }}
          onClick={
            isLoggedIn
              ? () =>
                  navigate(
                    `/book-appointment/${serviceProviderId}/${serviceId}`,
                    {
                      state: {
                        from: window.location.pathname,
                        service,
                      },
                    }
                  )
              : () =>
                  navigate("/login", {
                    state: { from: window.location.pathname },
                  })
          }
        >
          {availability ? "Book Now" : "Currently Unavailable"}
        </Button>
        {editable && (
          <Button
            icon={<EditRegular />}
            onClick={() =>
              navigate(`/edit-service/${serviceProviderId}/${serviceId}`, {
                state: { service },
              })
            }
          >
            Edit
          </Button>
        )}
        {editable && (
          <Switch checked={availability} onChange={handleAvailabilityChange} />
        )}
      </CardFooter>
    </Card>
  );
};

export default ServiceItem;
