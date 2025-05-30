export interface Service {
  id: number;
  name: string;
  durationMinutes: number;
  description: string;
  price: number;
  isAvailable: boolean;
  serviceProviderName: string;
  serviceProviderId: number;
}

export interface ServicesResponse {
  serviceProviderOwnerId: string;
  services: Service[];
}
