import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material';
import {
  Construction,
  Inventory2,
  PointOfSale,
  Storefront,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { login } from '../services/authService';
import './Login.css';

const counterStats = [
  { label: 'Counter', value: 'Open', icon: PointOfSale },
  { label: 'Stock', value: 'Live', icon: Inventory2 },
  { label: 'Supplies', value: 'Ready', icon: Construction }
];

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const data = await login(
        formData.username.trim(),
        formData.password
      );

      localStorage.setItem('token', data.token);

      if (rememberMe) {
        localStorage.setItem('rememberUser', formData.username.trim());
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`login-page ${loaded ? 'loaded' : ''}`}>

      {/* LEFT */}
      <section className="login-brand-panel">

        <div className="brand-top">
          <div className="brand-icon">
            <Storefront />
          </div>

          <div>
            <p className="eyebrow">Shova Stores</p>
            <h1 className="brand-title">Billing Desk</h1>
            <p className="brand-sub">
              Fast • Clean • Modern POS System
            </p>
          </div>
        </div>

        <div className="stats">
          {counterStats.map((item) => {
            const Icon = item.icon;
            return (
              <div className="stat" key={item.label}>
                <Icon />
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            );
          })}
        </div>

      </section>

      {/* RIGHT */}
      <section className="login-form-panel">

        <div className="login-card">

          <h2 className="form-title">Welcome back</h2>
          <p className="form-subtitle">Sign in to continue</p>

          {serverError && (
            <Alert severity="error" className="alert">
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="form">

            <TextField
              label="Username"
              fullWidth
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              error={!!errors.username}
              helperText={errors.username}
              size="small"
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              error={!!errors.password}
              helperText={errors.password}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <div className="row">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                }
                label="Remember me"
              />
            </div>

            <Button
              type="submit"
              fullWidth
              className="btn"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                'Sign in'
              )}
            </Button>

          </form>

        </div>

      </section>

    </main>
  );
}

export default Login;