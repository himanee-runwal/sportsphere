import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { BiKey, BiCheckCircle } from 'react-icons/bi';

// Password regex: min 6 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

// Define Validation Schema using Yup
const resetPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required('New Password is required')
    .matches(
      passwordRegex,
      'Password must be at least 6 characters and include uppercase, lowercase, a number, and a special character'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword'), null], 'Passwords do not match'),
});

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Missing reset token. Please use the exact link sent to your email.');
      return;
    }
    setLoading(true);
    try {
      const submitData = {
        tokenOrOtp: token,
        newPassword: data.newPassword,
      };
      await authApi.resetPassword(submitData);
      setSuccess(true);
      toast.success('Your password has been reset successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 250px)' }}>
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-5">
          <div className="ss-card">
            {!token ? (
              <div className="text-center py-4">
                <h1 className="h4 text-danger mb-3">Invalid Link</h1>
                <p className="text-muted-custom">We couldn't find a reset token in the URL. Please make sure you clicked the exact link sent to your email.</p>
                <Link to="/forgot-password" className="btn btn-outline-primary mt-3">Go back to Forgot Password</Link>
              </div>
            ) : !success ? (
              <>
                {/* Page Header */}
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{
                      width: '56px',
                      height: '56px',
                      backgroundColor: 'rgba(15, 118, 110, 0.1)',
                      color: 'var(--ss-primary)',
                    }}
                  >
                    <BiKey style={{ fontSize: '28px' }} />
                  </div>
                  <h1 className="h3 mb-2 fw-bold text-dark">Reset Password</h1>
                  <p className="text-muted-custom small mb-0">
                    Set a secure password for your SportSphere account.
                  </p>
                </div>

                {/* Reset Form */}
                <form onSubmit={handleSubmit(onSubmit)} noValidate>

                  <Input
                    label="New Password"
                    name="newPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    error={errors.newPassword}
                    {...register('newPassword')}
                  />

                  <Input
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    error={errors.confirmPassword}
                    {...register('confirmPassword')}
                  />

                  {/* Submit Button */}
                  <Button type="submit" loading={loading} className="mb-3">
                    Reset Password
                  </Button>
                </form>
              </>
            ) : (
              /* Success Page State */
              <div className="text-center py-3">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    color: 'var(--ss-success)',
                  }}
                >
                  <BiCheckCircle style={{ fontSize: '32px' }} />
                </div>
                <h1 className="h3 mb-2 fw-bold text-dark">Password Updated!</h1>
                <p className="text-muted-custom small mb-4">
                  Your password has been successfully updated. You can now use your new password to log in.
                </p>
                <Link to="/login" className="btn btn-ss-primary w-100">
                  Go to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
