import { useState } from "react";
import {
  CreateServiceProviderDto,
  DAYS_OF_WEEK,
  FormErrors,
  BusinessHoursDto,
} from "../types/ServiceProvider";

export function useServiceProviderForm() {
  const [formData, setFormData] = useState<CreateServiceProviderDto>({
    name: "",
    description: "",
    phoneNumber: "",
    location: {
      address: "",
      city: "",
      zipCode: "",
    },
    businessHours: DAYS_OF_WEEK.map((day) => ({
      dayOfWeek: day.value,
      openTime: "09:00:00",
      closeTime: "17:00:00",
      isOpen: day.value !== 0,
    })),
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Service provider name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    // Validate location
    const locationErrors: FormErrors["location"] = {};

    if (!formData.location.address.trim()) {
      locationErrors.address = "Address is required";
    }

    if (!formData.location.city.trim()) {
      locationErrors.city = "City is required";
    }

    if (!formData.location.zipCode.trim()) {
      locationErrors.zipCode = "ZIP code is required";
    } else if (!/^[0-9]{5}(-[0-9]{4})?$/.test(formData.location.zipCode)) {
      locationErrors.zipCode = "Please enter a valid ZIP code";
    }

    if (Object.keys(locationErrors).length > 0) {
      newErrors.location = locationErrors;
    }

    // Validate business hours
    const hasOpenDays = formData.businessHours.some((hours) => hours.isOpen);
    if (!hasOpenDays) {
      newErrors.businessHours = "At least one day must be open for business";
    }

    // Validate time ranges for open days
    const invalidTimeRanges = formData.businessHours.filter(
      (hours) => hours.isOpen && hours.openTime >= hours.closeTime
    );
    if (invalidTimeRanges.length > 0) {
      newErrors.businessHours =
        "Open time must be before close time for all open days";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  const handleBusinessHoursChange = (
    dayOfWeek: number,
    field: keyof BusinessHoursDto,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      businessHours: prev.businessHours.map((hours) =>
        hours.dayOfWeek === dayOfWeek ? { ...hours, [field]: value } : hours
      ),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      phoneNumber: "",
      location: {
        address: "",
        city: "",
        zipCode: "",
      },
      businessHours: DAYS_OF_WEEK.map((day) => ({
        dayOfWeek: day.value,
        openTime: "09:00:00",
        closeTime: "17:00:00",
        isOpen: day.value !== 0,
      })),
    });
    setErrors({});
  };

  return {
    formData,
    errors,
    validateForm,
    handleInputChange,
    handleLocationChange,
    handleBusinessHoursChange,
    resetForm,
  };
}
