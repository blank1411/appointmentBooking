import { AvailableTimeDto, CreateAppointmentDto } from "../types/Appointment";

export const fetchAvailableDates = async (
  serviceProviderId: number,
  serviceId: number
): Promise<string[]> => {
  const startDate = new Date().toISOString().split("T")[0];
  const response = await fetch(
    `/api/service-providers/${serviceProviderId}/services/${serviceId}/available-dates?startDate=${startDate}&daysToShow=30`
  );
  if (!response.ok) throw new Error("Failed to fetch available dates");
  return response.json();
};

export const fetchAvailableSlots = async (
  serviceProviderId: number,
  serviceId: number,
  date: string
): Promise<AvailableTimeDto[]> => {
  const response = await fetch(
    `/api/service-providers/${serviceProviderId}/services/${serviceId}/available-slots?date=${date}`
  );
  if (!response.ok) throw new Error("Failed to fetch available slots");
  return response.json();
};

export const createAppointment = async (
  appointment: CreateAppointmentDto,
  token: String | null
) => {
  const response = await fetch("/api/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(appointment),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to create appointment");
  }

  return response.json();
};

export const deleteAppointment = async (
  appointmentId: number,
  token: string | null
) => {
  const response = await fetch(`/api/appointments/${appointmentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to delete appointment");
  }
};
