import {
  Input,
  Label,
  Title1,
  Button,
  Text,
  Divider,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";
import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { User } from "../../Context/AuthContext";

interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  city: string;
}

interface RegistrationResponse {
  token: string;
  expiration: string;
  user: User;
}

const useStyles = makeStyles({
  pageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  authContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "450px",
    padding: "32px",
    paddingTop: "20px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    marginTop: "20px",
    transition: "transform 0.2s, box-shadow 0.2s",
    ":hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 20px rgba(0,0,0,0.15)",
    },
  },
  formContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputField: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "4px",
  },
  label: {
    marginLeft: "2px",
    fontWeight: "500",
  },
  errorInput: {
    ...shorthands.border("1px", "solid", "#cc0000"),
  },
  buttonContainer: {
    marginTop: "16px",
    width: "100%",
  },
  submitButton: {
    width: "100%",
    height: "40px",
    marginTop: "8px",
  },
  errorText: {
    color: "#cc0000",
    fontSize: "14px",
    marginTop: "4px",
  },
  errorContainer: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#fff0f0",
    borderRadius: "4px",
    borderLeft: "4px solid #cc0000",
    width: "100%",
  },
  nameRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    width: "100%",
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    margin: "16px 0",
    "::before, ::after": {
      content: '""',
      flex: "1",
      borderBottom: "1px solid #e0e0e0",
    },
    "> span": {
      padding: "0 10px",
      color: "#666",
      fontSize: "14px",
    },
  },
});

const RegisterPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    city: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Input change handler with validation
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;

      // Update specific form field
      if (id === "confirmPassword") {
        setConfirmPassword(value);

        // Validate password match
        if (value !== formData.password) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: "Passwords must match",
          }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.confirmPassword;
            return newErrors;
          });
        }
      } else {
        setFormData((prev) => ({ ...prev, [id]: value }));

        // Validate password match when password changes
        if (id === "password" && confirmPassword && value !== confirmPassword) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: "Passwords must match",
          }));
        } else if (
          id === "password" &&
          confirmPassword &&
          value === confirmPassword
        ) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.confirmPassword;
            return newErrors;
          });
        }

        // Email validation
        if (id === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value && !emailRegex.test(value)) {
            setErrors((prev) => ({
              ...prev,
              email: "Please enter a valid email address",
            }));
          } else {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.email;
              return newErrors;
            });
          }
        }

        // Required fields validation
        if (value === "") {
          setErrors((prev) => ({ ...prev, [id]: "This field is required" }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[id];
            return newErrors;
          });
        }
      }
    },
    [formData.password, confirmPassword]
  );

  // Form submission handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form before submission
      const validationErrors: Record<string, string> = {};

      if (!formData.firstName)
        validationErrors.firstName = "First name is required";
      if (!formData.lastName)
        validationErrors.lastName = "Last name is required";
      if (!formData.email) validationErrors.email = "Email is required";
      if (!formData.password)
        validationErrors.password = "Password is required";
      if (!confirmPassword)
        validationErrors.confirmPassword = "Please confirm your password";
      if (formData.password !== confirmPassword)
        validationErrors.confirmPassword = "Passwords must match";

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);
      setSubmitErrors([]);

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setSubmitErrors(
            Array.isArray(errorData) ? errorData : [errorData.toString()]
          );
          setIsSubmitting(false);
          return;
        }

        const data: RegistrationResponse = await response.json();
        login(data.token, data.user);
        navigate("/");
      } catch (error) {
        console.error("Registration failed:", error);
        setSubmitErrors(["Registration failed. Please try again later."]);
        setIsSubmitting(false);
      }
    },
    [formData, confirmPassword, login, navigate]
  );

  return (
    <div className={classes.pageContainer}>
      <div className={classes.authContainer}>
        <Title1 as="h1" align="center">
          Create an Account
        </Title1>

        {submitErrors.length > 0 && (
          <div className={classes.errorContainer}>
            {submitErrors.map((error, index) => (
              <Text key={index} className={classes.errorText}>
                {error}
              </Text>
            ))}
          </div>
        )}

        <form
          className={classes.formContainer}
          onSubmit={handleSubmit}
          noValidate
        >
          <div className={classes.nameRow}>
            <div className={classes.inputField}>
              <Label htmlFor="firstName" className={classes.label}>
                First Name
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.firstName ? classes.errorInput : ""}
                autoComplete="given-name"
                required
              />
              {errors.firstName && (
                <Text className={classes.errorText}>{errors.firstName}</Text>
              )}
            </div>

            <div className={classes.inputField}>
              <Label htmlFor="lastName" className={classes.label}>
                Last Name
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? classes.errorInput : ""}
                autoComplete="family-name"
                required
              />
              {errors.lastName && (
                <Text className={classes.errorText}>{errors.lastName}</Text>
              )}
            </div>
          </div>

          <div className={classes.inputField}>
            <Label htmlFor="email" className={classes.label}>
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? classes.errorInput : ""}
              autoComplete="email"
              required
            />
            {errors.email && (
              <Text className={classes.errorText}>{errors.email}</Text>
            )}
          </div>

          <div className={classes.inputField}>
            <Label htmlFor="password" className={classes.label}>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? classes.errorInput : ""}
              autoComplete="new-password"
              required
            />
            {errors.password && (
              <Text className={classes.errorText}>{errors.password}</Text>
            )}
          </div>

          <div className={classes.inputField}>
            <Label htmlFor="confirmPassword" className={classes.label}>
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleInputChange}
              className={errors.confirmPassword ? classes.errorInput : ""}
              autoComplete="new-password"
              required
            />
            {errors.confirmPassword && (
              <Text className={classes.errorText}>
                {errors.confirmPassword}
              </Text>
            )}
          </div>

          <div className={classes.inputField}>
            <Label htmlFor="city" className={classes.label}>
              City
            </Label>
            <Input
              id="city"
              value={formData.city}
              onChange={handleInputChange}
              className={errors.city ? classes.errorInput : ""}
              autoComplete="address-level2"
            />
            {errors.city && (
              <Text className={classes.errorText}>{errors.city}</Text>
            )}
          </div>

          <div className={classes.buttonContainer}>
            <Button
              type="submit"
              appearance="primary"
              className={classes.submitButton}
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </Button>
          </div>
        </form>
        <div className={classes.footer}>
          <div>
            <Divider>OR</Divider>
          </div>
          <Text
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            Already have an account? &nbsp; <Link to="/login">Sign in</Link>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
