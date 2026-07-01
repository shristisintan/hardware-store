import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";

import {
  Storefront,
  Inventory2,
  PointOfSale,
  Construction,
  PersonOutlineOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import { login } from "../services/authService";

import "./Login.css";

const features = [
  { icon: Inventory2, title: "Inventory", subtitle: "Real-time Stock" },
  { icon: PointOfSale, title: "Billing", subtitle: "Fast Checkout" },
  { icon: Construction, title: "Suppliers", subtitle: "Purchase Ready" },
];

function Login() {
  const navigate = useNavigate();

  const [loaded, setLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    setLoaded(true);

    const remembered = localStorage.getItem("rememberUser");

    if (remembered) {
      setRememberMe(true);
      setFormData((p) => ({ ...p, username: remembered }));
    }
  }, []);

  // ================= VALIDATION =================
  const validateField = (name, value) => {
    switch (name) {
      case "username": {
        const v = value.trim();
        if (!v) return "Username is required";
        if (v.length < 3) return "Minimum 3 characters";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (v.includes("@") && !emailRegex.test(v)) {
          return "Invalid email format";
        }
        return "";
      }

      case "password": {
        const v = value;
        if (!v) return "Password is required";
        if (v.length < 6) return "Minimum 6 characters";

        const hasLetter = /[a-zA-Z]/;
        const hasNumber = /\d/;

        if (!hasLetter.test(v) || !hasNumber.test(v)) {
          return "Must contain letters + numbers";
        }
        return "";
      }

      default:
        return "";
    }
  };

  const validate = () => {
    const err = {};
    err.username = validateField("username", formData.username);
    err.password = validateField("password", formData.password);

    Object.keys(err).forEach((k) => !err[k] && delete err[k]);

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));

    setErrors((p) => ({
      ...p,
      [field]: validateField(field, value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");

    if (!validate()) {
      setShake(true);
      setTimeout(() => setShake(false), 300);
      return;
    }

    try {
      setLoading(true);

      const data = await login(
        formData.username.trim(),
        formData.password
      );

      localStorage.setItem("token", data.token);

      if (rememberMe) {
        localStorage.setItem("rememberUser", formData.username.trim());
      } else {
        localStorage.removeItem("rememberUser");
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed");
      setShake(true);
      setTimeout(() => setShake(false), 300);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`login-page ${loaded ? "loaded" : ""}`}>

      {/* LEFT */}
      <section className="brand-panel">
        <div className="brand-content">
          <div className="brand-logo">
            <Storefront fontSize="large" />
          </div>

          <span className="brand-tag">HARDWARE STORE POS</span>

          <h1>
            Shova<br />Stores
          </h1>

          <p>
            Manage inventory, billing, suppliers and reports
            from one powerful system.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div className="feature-card" key={f.title}>
                <Icon />
                <h3>{f.title}</h3>
                <span>{f.subtitle}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* RIGHT */}
      <section className="login-panel">
        <div className={`login-card ${shake ? "shake" : ""}`}>

          <div className="login-icon">
            <LockOutlined />
          </div>

          <h2>Welcome Back</h2>
          <p>Sign in to continue</p>

          {serverError && (
            <Alert severity="error">{serverError}</Alert>
          )}

          <form onSubmit={handleSubmit} className="login-form">

            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              error={!!errors.username}
              helperText={errors.username}
              onChange={(e) => handleChange("username", e.target.value)}
            />

            <TextField
  fullWidth
  label="Password"
  type={showPassword ? "text" : "password"}
  value={formData.password}
  error={!!errors.password}
  helperText={errors.password}
  onChange={(e) => handleChange("password", e.target.value)}
  slotProps={{
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={() => setShowPassword((p) => !p)} edge="end">
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    },
  }}
/>

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label="Remember me"
            />

            <Button
              fullWidth
              type="submit"
              disabled={loading}
              className="login-btn"
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>

          </form>
        </div>
      </section>

    </main>
  );
}

export default Login;