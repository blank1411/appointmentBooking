import {
  Input,
  Label,
  Title1,
  Button,
  Text,
  makeStyles,
  shorthands,
  Divider,
} from "@fluentui/react-components";
import { useState, useCallback } from "react";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { User } from "../../Context/AuthContext";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
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
    width: "400px",
    padding: "32px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    marginTop: "30px",
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
  footer: {
    marginTop: "24px",
    textAlign: "center",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  forgotPassword: {
    fontSize: "14px",
    textAlign: "right",
    width: "100%",
    marginTop: "4px",
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

const LoginPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();
  const from = (location.state as any)?.from || "/";

  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Input change handler with validation
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;

      // Update form data
      setFormData((prev) => ({ ...prev, [id]: value }));

      // Clear auth error when user starts typing again
      if (authError) {
        setAuthError("");
      }

      // Validate email
      if (id === "email") {
        if (!value) {
          setErrors((prev) => ({ ...prev, email: "Email is required" }));
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
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
      }

      // Validate password
      if (id === "password") {
        if (!value) {
          setErrors((prev) => ({ ...prev, password: "Password is required" }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.password;
            return newErrors;
          });
        }
      }
    },
    [authError]
  );

  // Form submission handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form before submission
      const validationErrors: Record<string, string> = {};

      if (!formData.email) validationErrors.email = "Email is required";
      if (!formData.password)
        validationErrors.password = "Password is required";

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);
      setAuthError("");

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          // Handle authentication errors
          if (response.status === 401) {
            setAuthError("Invalid email or password. Please try again.");
          } else {
            const errorData = await response.json();
            setAuthError(
              Array.isArray(errorData)
                ? errorData[0]
                : errorData.toString() || "Login failed. Please try again."
            );
          }
          setIsSubmitting(false);
          return;
        }

        const data: LoginResponse = await response.json();
        login(data.token, data.user);
        navigate(from, { replace: true }); // Redirect to home page after successful login
      } catch (error) {
        console.error("Login failed:", error);
        setAuthError(
          "Login failed. Please check your connection and try again."
        );
        setIsSubmitting(false);
      }
    },
    [formData, login, navigate, from]
  );

  return (
    <div className={classes.pageContainer}>
      <div className={classes.authContainer}>
        <Title1 as="h1" align="center">
          Sign In
        </Title1>

        {authError && (
          <div className={classes.errorContainer}>
            <Text className={classes.errorText}>{authError}</Text>
          </div>
        )}

        <form
          className={classes.formContainer}
          onSubmit={handleSubmit}
          noValidate
        >
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
              autoComplete="current-password"
              required
            />
            {errors.password && (
              <Text className={classes.errorText}>{errors.password}</Text>
            )}
            <div className={classes.forgotPassword}>
              <RouterLink to="/forgot-password">Forgot password?</RouterLink>
            </div>
          </div>

          <div className={classes.buttonContainer}>
            <Button
              type="submit"
              appearance="primary"
              className={classes.submitButton}
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </div>
        </form>

        <div className={classes.footer}>
          <div className={classes.divider}>
            <Divider>OR</Divider>
          </div>
          <Text
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            Don't have an account? &nbsp;{" "}
            <RouterLink to="/signup">Sign up</RouterLink>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
