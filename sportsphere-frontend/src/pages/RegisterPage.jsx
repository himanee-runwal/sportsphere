import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { BiUserPlus } from 'react-icons/bi';

// Password criteria regex: min 6 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

// Define Validation Schema using Yup
const registerSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First Name is required')
    .min(2, 'Name must be at least 2 characters'),
  lastName: yup
    .string()
    .optional(),
  email: yup
    .string()
    .required('Email address is required')
    .email('Please enter a valid email address'),
  phone: yup
    .string()
    .required('Phone number is required')
    .min(10, 'Please enter a valid phone number'),
  password: yup
    .string()
    .required('Password is required')
    .matches(
      passwordRegex,
      'Password must be at least 6 characters and include uppercase, lowercase, a number, and a special character'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password'), null], 'Passwords do not match'),
});

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Exclude confirmPassword from request payload & explicitly set role to PLAYER
      const { confirmPassword, ...submitData } = data;
      const payload = {
        ...submitData,
        role: 'PLAYER',
      };
      
      const response = await registerUser(payload);
      // The API contract might not return a message, but we can assume success if it didn't throw
      toast.success(response?.message || 'Registration successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 250px)' }}>
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6">
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
                <BiUserPlus style={{ fontSize: '28px' }} />
              </div>
              <h1 className="h3 mb-2 fw-bold text-dark">Create your account</h1>
              <p className="text-muted-custom small mb-0">
                Join the SportSphere community as a player to book slots and play together.
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="row">
                <div className="col-md-6">
                  <Input
                    label="First Name"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    required
                    error={errors.firstName}
                    {...register('firstName')}
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    label="Last Name"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    error={errors.lastName}
                    {...register('lastName')}
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    error={errors.email}
                    {...register('email')}
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    placeholder="+1234567890"
                    required
                    error={errors.phone}
                    {...register('phone')}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    error={errors.password}
                    {...register('password')}
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    error={errors.confirmPassword}
                    {...register('confirmPassword')}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" loading={loading} className="mt-2 mb-3">
                Create Account
              </Button>
            </form>

            {/* Footer Options */}
            <div className="text-center mt-3 pt-3 border-top border-light">
              <p className="small text-muted-custom mb-0">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-decoration-none fw-semibold"
                  style={{ color: 'var(--ss-primary)' }}
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
