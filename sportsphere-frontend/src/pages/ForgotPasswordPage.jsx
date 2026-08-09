import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { BiMailSend, BiEnvelopeOpen } from 'react-icons/bi';

// Define Validation Schema using Yup
const forgotPasswordSchema = yup.object().shape({
  emailOrPhone: yup
    .string()
    .required('Email or Phone is required'),
});

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userContact, setUserContact] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data);
      setUserContact(data.emailOrPhone);
      setSubmitted(true);
      toast.success('If an account with that email exists, a password reset link has been sent.');
    } catch (err) {
      toast.error(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 250px)' }}>
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-5">
          <div className="ss-card">
            {!submitted ? (
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
                    <BiMailSend style={{ fontSize: '28px' }} />
                  </div>
                  <h1 className="h3 mb-2 fw-bold text-dark">Forgot Password?</h1>
                  <p className="text-muted-custom small mb-0">
                    No worries! Just enter your registered email or phone and we'll send you instructions to reset your password.
                  </p>
                  <p className="text-muted-custom small mt-2 mb-0">
                    If an account with that email exists, a password reset link has been sent.
                  </p>
                </div>

                {/* Form */}
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

                  {/* Submit Button */}
                  <Button type="submit" loading={loading} className="mb-3">
                    Send Reset Link
                  </Button>
                </form>
              </>
            ) : (
              /* Success Confirmation Screen */
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
                  <BiEnvelopeOpen style={{ fontSize: '32px' }} />
                </div>
                <h1 className="h3 mb-2 fw-bold text-dark">Check your inbox/phone</h1>
                <p className="text-muted-custom small mb-4">
                  If an account with that email exists, a password reset link has been sent to <strong className="text-dark">{userContact}</strong>. 
                  Please click the link in the email to set a new password.
                </p>
              </div>
            )}

            {/* Footer Options */}
            <div className="text-center mt-3 pt-3 border-top border-light">
              <p className="small text-muted-custom mb-0">
                Back to{' '}
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

export default ForgotPasswordPage;
