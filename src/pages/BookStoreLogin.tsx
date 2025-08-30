import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Book as BookIcon } from "@mui/icons-material";

import AuthAPI from "../axios/authAPI";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../store/slice/authSlice";
import { useDispatch } from "react-redux";

// Define types
type LoginStage = "emailEntry" | "otpEntry" | "verified";

const BookStoreLogin: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [stage, setStage] = useState<LoginStage>("emailEntry");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    const responce = await AuthAPI.sendOTP(email);
    if (responce.success) {
      setStage("otpEntry");
    } else {
      setError("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    const responce = await AuthAPI.verifyOTP(email, otp);
    if (responce.success) {
      setStage("verified");
      console.log(responce.response?.data);
      dispatch(login(responce.response?.data));
      navigate("/books", { replace: true });
    } else {
      setError("Failed to verify OTP. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <BookIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />

        <Typography component="h1" variant="h5" gutterBottom>
          {stage === "emailEntry" && "Sign in to BookVerse"}
          {stage === "otpEntry" && "Enter Verification Code"}
          {stage === "verified" && "Login Successful!"}
        </Typography>

        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          sx={{ mb: 3 }}
        >
          {stage === "emailEntry" &&
            "Enter your email to receive a one-time password"}
          {stage === "otpEntry" && `We've sent a 6-digit code to ${email}`}
          {stage === "verified" &&
            "You have successfully logged in to your account"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        {stage === "verified" ? (
          <Alert severity="success" sx={{ width: "100%" }}>
            Welcome to BookVerse! Redirecting to your dashboard...
          </Alert>
        ) : (
          <Box
            component="form"
            onSubmit={
              stage === "emailEntry" ? handleEmailSubmit : handleOtpSubmit
            }
            sx={{ width: "100%" }}
          >
            {stage === "emailEntry" ? (
              <TextField
                size="small"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            ) : (
              <TextField
                margin="normal"
                size="small"
                required
                fullWidth
                id="otp"
                label="One-Time Password"
                name="otp"
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                disabled={loading}
                inputProps={{ maxLength: 6 }}
                placeholder="Enter 6-digit code"
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : stage === "emailEntry" ? (
                "Send OTP"
              ) : (
                "Verify & Login"
              )}
            </Button>

            {stage === "otpEntry" && (
              <Button
                fullWidth
                variant="text"
                onClick={() => setStage("emailEntry")}
                sx={{ mt: 1 }}
              >
                Change Email
              </Button>
            )}
            <Button component={Link} to="/books" variant="text" sx={{ mt: 1 }}>
              Go to Book Store
            </Button>
          </Box>
        )}
      </Paper>

      <Typography
        variant="body2"
        color="textSecondary"
        align="center"
        sx={{ mt: 4 }}
      >
        © {new Date().getFullYear()} BookVerse. All rights reserved.
      </Typography>
    </Container>
  );
};

export default BookStoreLogin;
