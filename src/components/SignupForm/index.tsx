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
    maxLength: false,
    noSpaces: false,
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
      length: password.length >= 8,
      maxLength: password.length <= 64,
      noSpaces: !password.includes(" "),
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
    <>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          width: 315,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 5,
          alignItems: "center",
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: "28px",
            lineHeight: "28px",
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          Sign up
        </Typography>
        <Box sx={{ width: "100%" }}>
          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{
              required: "Email is required",
              validate: (value) =>
                validateEmail(value) || "Invalid email format",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder="Email"
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
                sx={{
                  "& .MuiInputBase-root": {
                    borderRadius: "10px",
                    backgroundColor: errors.email ? "#FDEFEE" : "#FFF",
                  },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: errors.email ? "#FDEFEE" : "#FFF",
                  },
                  "& .MuiOutlinedInput-input": {
                    borderRadius: "10px",
                    padding: "10px",
                    backgroundColor: errors.email ? "#FDEFEE" : "#FFF",
                    borderColor: errors.email ? "#FF8080" : "#FFF",
                    color: errors.email ? "#FF8080" : "#4A4E71",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: errors.email
                      ? "#FDEFEE"
                      : "rgba(0, 0, 0, 0.23)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: errors.email
                      ? "#d32f2f"
                      : "rgba(0, 0, 0, 0.87)",
                  },
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
                  placeholder="Password"
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
                              passwordCriteria.maxLength
                                ? "green"
                                : errors.password && !passwordCriteria.maxLength
                                ? "red"
                                : "black"
                            }
                          >
                            Must be no more than 64 characters
                          </Typography>
                          <Typography
                            color={
                              passwordCriteria.noSpaces
                                ? "green"
                                : errors.password && !passwordCriteria.noSpaces
                                ? "red"
                                : "black"
                            }
                          >
                            Must not contain spaces
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
                  onBlur={(field) => {
                    if (
                      field.target.value === "" ||
                      errors.password?.type === "validate"
                    ) {
                      setShowPasswordCriteria(true);
                    }
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
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            width: "240px",
            height: "48px",
            background:
              "linear-gradient(110.46deg, #70C3FF 12.27%, #4B65FF 93.92%)",
            padding: "15px 32px 15px 32px",
            borderRadius: "30px",
          }}
          disabled={!!emailError && !errors.password}
        >
          Sign Up
        </Button>
      </Box>
      {alert && (
        <Alert
          sx={{ position: "absolute", top: 0, right: 0 }}
          severity={alert.type}
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}
    </>
  );
};

export default SignupForm;
