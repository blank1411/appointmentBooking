export interface BusinessHoursDto {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface Location {
  id: number;
  address: string;
  city: string;
  zipCode: string;
}

export interface CreateServiceProviderDto {
  name: string;
  description?: string;
  phoneNumber?: string;
  location: Location;
  businessHours: BusinessHoursDto[];
}

export interface FormErrors {
  name?: string;
  description?: string;
  phoneNumber?: string;
  location?: {
    address?: string;
    city?: string;
    zipCode?: string;
  };
  businessHours?: string;
  general?: string;
}

export interface HomePageServiceProvider {
  id: number;
  name: string;
  description: string;
  phoneNumber: string;
  location: Location;
}

export interface Business {
  id: number;
  name: string;
  description: string;
  phoneNumber: string;
  locationId: number;
  location: Location;
}

export const DAYS_OF_WEEK = [
  { name: "Sunday", value: 0 },
  { name: "Monday", value: 1 },
  { name: "Tuesday", value: 2 },
  { name: "Wednesday", value: 3 },
  { name: "Thursday", value: 4 },
  { name: "Friday", value: 5 },
  { name: "Saturday", value: 6 },
];
