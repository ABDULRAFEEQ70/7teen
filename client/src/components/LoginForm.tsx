import { useState } from "react";
import { TextField, Button, Stack, Alert } from "@mui/material";
import axios from "axios";
import { useAuth } from "../AuthContext";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:4000/api/auth/login", {
        username,
        password,
      });
      login(data.token, data.user.role);
    } catch (err) {
      console.error(err);
      setError("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />
        <Button type="submit" variant="contained">
          Login
        </Button>
      </Stack>
    </form>
  );
}

export default LoginForm;