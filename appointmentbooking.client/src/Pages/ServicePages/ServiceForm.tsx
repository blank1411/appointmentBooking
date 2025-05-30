import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Input,
  Spinner,
  Textarea,
  Field,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Card,
  CardHeader,
  CardFooter,
  Title3,
  Divider,
  tokens,
  makeStyles,
} from "@fluentui/react-components";
import { fetchService } from "./ServiceApiFunctions/EditService";
import { deleteService } from "./ServiceApiFunctions/DeleteService";

// Type definitions
interface ServiceFormData {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}

interface FormErrors {
  name: string;
  durationMinutes: string;
  price: string;
}

export interface CreateServiceDto {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}

export interface CustomServiceDto {
  id: number;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  isAvailable: boolean;
}

interface AuthContextType {
  token: string;
  // other auth properties would go here
}

interface ServiceFormProps {
  defaultValues: ServiceFormData | undefined;
  mode: "edit" | "create";
}

// Styles
const useStyles = makeStyles({
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  fieldSet: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    border: "none",
    padding: "0",
    margin: "0",
  },
  formFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "24px",
    width: "100%",
  },
  errorMessage: {
    color: tokens.colorPaletteRedForeground1,
  },
  inputRow: {
    display: "flex",
    gap: "16px",
  },
  inputColumn: {
    flex: 1,
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
});

const ServiceForm = ({ defaultValues, mode = "create" }: ServiceFormProps) => {
  const styles = useStyles();
  const { serviceProviderId, serviceId } = useParams();
  const { token } = useAuth() as AuthContextType;
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    durationMinutes: 30,
    price: 0,
  });

  // Validation state
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: "",
    durationMinutes: "",
    price: "",
  });

  useEffect(() => {
    if (mode === "edit" && defaultValues) {
      setFormData(defaultValues);
    }
  }, [mode, defaultValues]);

  const addServiceMutation = useMutation<
    CustomServiceDto,
    Error,
    CreateServiceDto
  >({
    mutationFn: async (
      serviceData: CreateServiceDto
    ): Promise<CustomServiceDto> => {
      if (!serviceProviderId) {
        throw new Error("Service provider ID is missing");
      }
      // if mode is "edit" it sends the PUT request else it sends the POST request
      const response = await fetchService(
        mode,
        serviceProviderId,
        serviceData,
        token,
        serviceId
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add service");
      }

      try {
        const jsonResponse = await response.json();
        console.log("API Response:", jsonResponse);
        return jsonResponse;
      } catch (jsonError) {
        console.error("Error parsing response:", jsonError);
        const textResponse = await response.text();
        console.log("Text response:", textResponse);
        throw new Error("Failed to parse response from server");
      }
    },
    onSuccess: () => {
      // Navigate back to services list or provider details
      navigate(`/service-provider/${serviceProviderId}`);
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: () => deleteService(serviceProviderId!, serviceId!, token),
    onSuccess: () => navigate(`/service-provider/${serviceProviderId}`),
  });

  const validateForm = (): boolean => {
    const errors: FormErrors = {
      name: !formData.name.trim() ? "Service name is required" : "",
      durationMinutes:
        !formData.durationMinutes || formData.durationMinutes <= 0
          ? "Duration must be greater than 0"
          : "",
      price: formData.price < 0 ? "Price cannot be negative" : "",
    };

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNumberInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    const numericValue =
      name === "price" ? parseFloat(value) || 0 : parseInt(value) || 0;

    setFormData((prevData) => ({
      ...prevData,
      [name]: numericValue,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (validateForm()) {
      addServiceMutation.mutate({
        name: formData.name.trim(),
        description: formData.description.trim(),
        durationMinutes: formData.durationMinutes,
        price: formData.price,
      });
    }
  };

  const handleCancel = (): void => {
    navigate(`/service-provider/${serviceProviderId}`);
  };

  if (!serviceProviderId) {
    return (
      <div className={styles.container}>
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>Error</MessageBarTitle>
            Service provider ID is missing. Cannot add a service.
          </MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card>
        <CardHeader>
          <Title3>Add New Service</Title3>
        </CardHeader>

        {addServiceMutation.isError && (
          <MessageBar intent="error">
            <MessageBarBody>
              <MessageBarTitle>Error</MessageBarTitle>
              {addServiceMutation.error.message}
            </MessageBarBody>
          </MessageBar>
        )}

        {addServiceMutation.isPending ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spinner label="Adding service..." />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <fieldset className={styles.fieldSet}>
              <Field
                label="Service Name"
                required
                validationMessage={formErrors.name}
                validationState={formErrors.name ? "error" : "none"}
              >
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter service name"
                />
              </Field>

              <Field label="Description">
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter service description"
                  resize="vertical"
                  style={{ minHeight: "100px" }}
                />
              </Field>

              <div className={styles.inputRow}>
                <Field
                  label="Duration (minutes)"
                  required
                  className={styles.inputColumn}
                  validationMessage={formErrors.durationMinutes}
                  validationState={
                    formErrors.durationMinutes ? "error" : "none"
                  }
                >
                  <Input
                    name="durationMinutes"
                    type="number"
                    value={formData.durationMinutes.toString()}
                    onChange={handleNumberInputChange}
                    step="5"
                  />
                </Field>

                <Field
                  label="Price"
                  required
                  className={styles.inputColumn}
                  validationMessage={formErrors.price}
                  validationState={formErrors.price ? "error" : "none"}
                >
                  <Input
                    name="price"
                    type="number"
                    value={formData.price.toString()}
                    onChange={handleNumberInputChange}
                    step="1"
                  />
                </Field>
              </div>
            </fieldset>

            <Divider />

            <CardFooter>
              <div className={styles.formFooter}>
                <div>
                  <Button
                    appearance="secondary"
                    onClick={handleCancel}
                    style={{ marginRight: "1rem" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    appearance="primary"
                    type="submit"
                    disabled={addServiceMutation.isPending}
                  >
                    {addServiceMutation.isPending
                      ? "Adding..."
                      : mode === "edit"
                        ? "Save Changes"
                        : "Add Service"}
                  </Button>
                </div>
                {mode === "edit" && (
                  <Button
                    style={{ backgroundColor: "red", color: "white" }}
                    onClick={() => deleteServiceMutation.mutate()}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </CardFooter>
          </form>
        )}

        {addServiceMutation.isSuccess && (
          <MessageBar intent="success">
            <MessageBarBody>
              <MessageBarTitle>Success</MessageBarTitle>
              Service has been added successfully.
            </MessageBarBody>
          </MessageBar>
        )}
      </Card>
    </div>
  );
};

export default ServiceForm;
