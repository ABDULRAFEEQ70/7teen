import { Stack, Button, Alert, TextField, MenuItem } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import React from "react";

interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
}

const schema = yup.object({
  firstName: yup.string().min(2).required(),
  lastName: yup.string().min(2).required(),
  dateOfBirth: yup.string().required(),
  gender: yup.string().oneOf(["Male", "Female", "Other"]).required(),
  phone: yup.string().required(),
  email: yup.string().email().optional(),
  address: yup.string().optional(),
});

function PatientForm() {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
    },
    resolver: yupResolver(schema),
  });

  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const onSubmit = async (data: PatientFormData) => {
    try {
      await axios.post("http://localhost:4000/api/patients", data);
      setSuccess(true);
      setError("");
      reset();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map((e: any) => e.msg).join(", "));
      } else {
        setError("Failed to submit");
      }
      setSuccess(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2}>
        {success && <Alert severity="success">Patient registered!</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="First Name"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Last Name"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Date of Birth"
              type="date"
              InputLabelProps={{ shrink: true }}
              error={!!errors.dateOfBirth}
              helperText={errors.dateOfBirth?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Gender"
              error={!!errors.gender}
              helperText={errors.gender?.message}
              fullWidth
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          )}
        />

        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Phone"
              error={!!errors.phone}
              helperText={errors.phone?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Address"
              multiline
              rows={2}
              fullWidth
            />
          )}
        />

        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Register Patient"}
        </Button>
      </Stack>
    </form>
  );
}

export default PatientForm;