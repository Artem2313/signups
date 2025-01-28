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
    getValues,
  } = useForm<FormData>();

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
  const [isSuccess, setIsSuccess] = useState(false);

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
      setIsSuccess(false);
      const response = await mockBackend(data);
      setAlert({ type: "success", message: response.message });
      setIsSuccess(true);
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
                error={!!errors.email}
                helperText={errors.email?.message}
                onChange={(e) => {
                  field.onChange(e);
                  clearErrors("email");
                  if (typingTimer) clearTimeout(typingTimer);
                  setTypingTimer(
                    setTimeout(() => {
                      if (!validateEmail(e.target.value)) {
                        setError("email", { message: "Invalid email format" });
                      }
                    }, 2000)
                  );
                }}
                onBlur={() => {
                  if (!validateEmail(field.value)) {
                    setError("email", { message: "Invalid email format" });
                  }
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    borderRadius: "10px",
                    backgroundColor: errors.email
                      ? "#FDEFEE"
                      : isSuccess
                      ? "#E8F5E9"
                      : "#FFF",
                  },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#000",
                    },
                    "&.Mui-error .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#FF8080",
                    },
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: errors.email
                      ? "#FF8080"
                      : isSuccess
                      ? "#4CAF50"
                      : "transparent",
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "10px",
                    color: errors.email
                      ? "#FF8080"
                      : isSuccess
                      ? "#4CAF50"
                      : "#000",
                  },
                  "& .MuiInputLabel-root": {
                    color: errors.email
                      ? "#FF8080"
                      : isSuccess
                      ? "#4CAF50"
                      : "#A9A9A9",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: errors.email
                      ? "#FF8080"
                      : isSuccess
                      ? "#4CAF50"
                      : "#000",
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
                const criteria = validatePassword(getValues("password"));
                return Object.values(criteria).every(Boolean);
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
                    if (field.target.value === "") {
                      setShowPasswordCriteria(false);
                    }
                  }}
                  onChange={(e) => {
                    field.onChange(e);
                    const criteria = validatePassword(e.target.value);
                    setPasswordCriteria(criteria);
                    setShowPasswordCriteria(true);
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: "10px",
                      backgroundColor: errors.password
                        ? "#FDEFEE"
                        : isSuccess
                        ? "#E8F5E9"
                        : "#FFF",
                    },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#000",
                      },
                      "&.Mui-error .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#FF8080",
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: errors.password
                        ? "#FF8080"
                        : isSuccess
                        ? "#4CAF50"
                        : "transparent",
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: "10px",
                      color: errors.password
                        ? "#FF8080"
                        : isSuccess
                        ? "#4CAF50"
                        : "#000",
                    },
                    "& .MuiInputLabel-root": {
                      color: errors.password
                        ? "#FF8080"
                        : isSuccess
                        ? "#4CAF50"
                        : "#A9A9A9",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: errors.password
                        ? "#FF8080"
                        : isSuccess
                        ? "#4CAF50"
                        : "#000",
                    },
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
            textTransform: "none",
          }}
          disabled={!!errors.email && !errors.password}
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
