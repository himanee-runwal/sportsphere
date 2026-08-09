import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'outline'
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...rest
}) => {
  // Determine Bootstrap custom class
  let btnClass = 'btn-ss-primary';
  if (variant === 'secondary') {
    btnClass = 'btn-ss-secondary';
  } else if (variant === 'outline') {
    btnClass = 'btn-ss-outline';
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn w-100 d-flex align-items-center justify-content-center ${btnClass} ${className}`}
      {...rest}
    >
      {loading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
