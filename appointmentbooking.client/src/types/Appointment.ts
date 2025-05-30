export interface AvailableTimeDto {
  startTime: string;
  endTime: string;
  displayTime: string;
}

export interface CreateAppointmentDto {
  startTime: string;
  serviceProviderId: number;
  serviceId: number;
  notes: string;
}

export interface AppointmentBookingProps {
  serviceProviderId: number;
  serviceId: number;
  serviceName: string;
  serviceDuration?: number;
  servicePrice?: number;
  onBack?: () => void;
  onSuccess?: () => void;
}

export interface Appointment {
  id: number;
  startTime: string;
  endTime: string;
  userId: string;
  serviceProviderId: string;
  serviceId: string;
  status: string;
  notes: string;
  serviceName: string;
  serviceProviderName: string;
}
