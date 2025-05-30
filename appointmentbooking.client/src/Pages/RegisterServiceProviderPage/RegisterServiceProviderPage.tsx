import { useState } from "react";
import {
  makeStyles,
  Title1,
  Card,
  Button,
  Spinner,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from "@fluentui/react-components";
import { useAuth } from "../../Context/AuthContext";
import BasicInfoSection from "../../Components/CreateServiceProvider/BasicInfoSection";
import LocationSection from "../../Components/CreateServiceProvider/LocationSection";
import BusinessHoursSection from "../../Components/CreateServiceProvider/BusinessHoursSection";
import { useServiceProviderForm } from "../../hooks/useServiceProviderForm";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles({
  container: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "0 20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    padding: "12px",
  },
  formCard: {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    marginTop: "10px",
  },
  submitButton: {
    alignSelf: "flex-end",
    marginTop: "16px",
  },
});

export default function RegisterServiceProviderPage() {
  const classes = useStyles();
  const { token } = useAuth();
  let navigate = useNavigate();

  const {
    formData,
    errors,
    validateForm,
    handleInputChange,
    handleLocationChange,
    handleBusinessHoursChange,
    resetForm,
  } = useServiceProviderForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      if (!token) {
        setSubmitStatus({
          type: "error",
          message: "You must be logged in to register a service provider",
        });
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/serviceproviders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmitStatus({
          type: "success",
          message: "Service provider registered successfully!",
        });

        resetForm();

        // Redirect after a short delay
        setTimeout(() => {
          navigate(`/service-provider/${data.id}`);
        }, 2000);
      } else {
        const errorData = await response.json();

        if (response.status === 409) {
          setSubmitStatus({
            type: "error",
            message: "A service provider with this name already exists.",
          });
        } else if (response.status === 401) {
          setSubmitStatus({
            type: "error",
            message: "You are not authorized to perform this action.",
          });
        } else {
          setSubmitStatus({
            type: "error",
            message:
              errorData.message ||
              "Failed to register service provider. Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Error registering service provider:", error);
      setSubmitStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={classes.container}>
      <Title1 as="h1">Register Your Business</Title1>

      {submitStatus.type && (
        <MessageBar
          intent={submitStatus.type === "success" ? "success" : "error"}
        >
          <MessageBarBody>
            <MessageBarTitle>
              {submitStatus.type === "success" ? "Success!" : "Error"}
            </MessageBarTitle>
            {submitStatus.message}
          </MessageBarBody>
        </MessageBar>
      )}

      <Card className={classes.formCard}>
        <div className={classes.form}>
          <BasicInfoSection
            name={formData.name}
            description={formData.description}
            phoneNumber={formData.phoneNumber}
            errors={errors}
            onInputChange={handleInputChange}
          />

          <LocationSection
            location={formData.location}
            errors={errors.location}
            onLocationChange={handleLocationChange}
          />

          <BusinessHoursSection
            businessHours={formData.businessHours}
            errors={errors.businessHours}
            onBusinessHoursChange={handleBusinessHoursChange}
          />

          <Button
            type="button"
            appearance="primary"
            className={classes.submitButton}
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <Spinner size="tiny" />
            ) : (
              "Register Service Provider"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
