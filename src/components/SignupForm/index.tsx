import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, Box, Alert, Typography } from "@mui/material";

interface FormData {
  email: string;
  password: string;
}

interface ErrorResponse {
  message: string;
  errors: {
    email?: string;
    password?: string;
  };
}

interface SuccessResponse {
  message: string;
}

type BEResponse = ErrorResponse | SuccessResponse;

const mockBackend = async (data: FormData): Promise<BEResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const fail = Math.random() < 0.1;
      if (fail) {
        reject({
          message: "Validation failed.",
          errors: {
            email: "Email is invalid.",
            password: "Password does not meet criteria.",
          },
        });
      } else {
        console.log("Data submitted:", data);
        resolve({ message: "Success!" });
      }
    }, 1000);
  });
};

const isErrorResponse = (error: unknown): error is ErrorResponse => {
  return (
    (error as ErrorResponse).message !== undefined &&
    (error as ErrorResponse).errors !== undefined
  );
};

const SignupForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<FormData>();

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercaseLowercase: false,
    digit: false,
  });
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return {
      length: password.length >= 8 && !password.includes(" "),
      uppercaseLowercase: /[a-z]/.test(password) && /[A-Z]/.test(password),
      digit: /\d/.test(password),
    };
  };

  const onSubmit = async (data: FormData) => {
    try {
      setAlert(null);
      const response = await mockBackend(data);
      setAlert({ type: "success", message: response.message });
    } catch (error) {
      if (isErrorResponse(error)) {
        setAlert({ type: "error", message: error.message });
        if (error.errors) {
          if (error.errors.email) {
            setError("email", { message: error.errors.email });
          }
          if (error.errors.password) {
            setError("password", { message: error.errors.password });
            setShowPasswordCriteria(true);
          }
        }
      } else {
        setAlert({ type: "error", message: "An unknown error occurred." });
      }
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: 400, margin: "0 auto", mt: 5 }}
    >
      {alert && <Alert severity={alert.type}>{alert.message}</Alert>}
      <Controller
        name="email"
        control={control}
        defaultValue=""
        rules={{
          required: "Email is required",
          validate: (value) => validateEmail(value) || "Invalid email format",
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email"
            fullWidth
            margin="normal"
            error={!!errors.email || !!emailError}
            helperText={errors.email?.message || emailError}
            onChange={(e) => {
              field.onChange(e);
              clearErrors("email");
              setEmailError(null);
              if (typingTimer) clearTimeout(typingTimer);
              setTypingTimer(
                setTimeout(() => {
                  if (!validateEmail(e.target.value)) {
                    setEmailError("Invalid email format");
                  }
                }, 2000)
              );
            }}
            onBlur={() => {
              if (!validateEmail(field.value)) {
                setEmailError("Invalid email format");
              }
            }}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        defaultValue=""
        rules={{
          required: "Password is required",
          validate: () => {
            return Object.values(passwordCriteria).every(Boolean);
          },
        }}
        render={({ field }) => (
          <Box>
            <TextField
              {...field}
              type="password"
              label="Password"
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={
                <>
                  {errors.password?.message && (
                    <Typography color={"red"}>
                      {errors.password.message}
                    </Typography>
                  )}
                  {showPasswordCriteria && (
                    <>
                      <Typography
                        color={
                          passwordCriteria.length
                            ? "green"
                            : errors.password && !passwordCriteria.length
                            ? "red"
                            : "black"
                        }
                      >
                        Must be at least 8 characters
                      </Typography>
                      <Typography
                        color={
                          passwordCriteria.uppercaseLowercase
                            ? "green"
                            : errors.password &&
                              !passwordCriteria.uppercaseLowercase
                            ? "red"
                            : "black"
                        }
                      >
                        Must contain uppercase and lowercase letters
                      </Typography>
                      <Typography
                        color={
                          passwordCriteria.digit
                            ? "green"
                            : errors.password && !passwordCriteria.digit
                            ? "red"
                            : "black"
                        }
                      >
                        Must contain at least 1 digit
                      </Typography>
                    </>
                  )}
                </>
              }
              onFocus={() => setShowPasswordCriteria(true)}
              onBlur={() => {
                setShowPasswordCriteria(false);
              }}
              onChange={(e) => {
                field.onChange(e);
                clearErrors("password");
                const criteria = validatePassword(e.target.value);
                setPasswordCriteria(criteria);
                setShowPasswordCriteria(true);
              }}
            />
          </Box>
        )}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3 }}
        disabled={!!emailError && !errors.password}
      >
        Sign Up
      </Button>
    </Box>
  );
};

export default SignupForm;
