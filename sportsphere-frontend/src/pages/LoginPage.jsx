import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { BiLockOpenAlt } from 'react-icons/bi';

// Define Validation Schema using Yup
const loginSchema = yup.object().shape({
  emailOrPhone: yup
    .string()
    .required('Email or Phone is required'),
  password: yup
    .string()
    .required('Password is required'),
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Get destination path from redirect or default to home/dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('Successfully logged in!');
      navigate(from, { replace: true });
    } catch (err) {
      if (err.status === 401) {
        toast.error('Invalid credentials');
      } else {
        toast.error(err.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 250px)' }}>
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-5">
          <div className="ss-card">
            {/* Page Header */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-teal-light rounded-circle mb-3"
                style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: 'rgba(15, 118, 110, 0.1)',
                  color: 'var(--ss-primary)',
                }}
              >
                <BiLockOpenAlt style={{ fontSize: '28px' }} />
              </div>
              <h1 className="h3 mb-2 fw-bold text-dark">Welcome back</h1>
              <p className="text-muted-custom small mb-0">
                Play Together. Book Smarter. Enter credentials to access SportSphere.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input
                label="Email or Phone Number"
                name="emailOrPhone"
                type="text"
                placeholder="name@example.com or +1234567890"
                required
                error={errors.emailOrPhone}
                {...register('emailOrPhone')}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                error={errors.password}
                {...register('password')}
              />

              {/* Forgot Password Link */}
              <div className="text-end mb-4">
                <Link
                  to="/forgot-password"
                  className="text-decoration-none small fw-semibold"
                  style={{ color: 'var(--ss-primary)' }}
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button type="submit" loading={loading} className="mb-3">
                Log In
              </Button>
            </form>

            {/* Footer Options */}
            <div className="text-center mt-3 pt-3 border-top border-light">
              <p className="small text-muted-custom mb-0">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-decoration-none fw-semibold"
                  style={{ color: 'var(--ss-primary)' }}
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
