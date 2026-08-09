import React, { forwardRef, useState } from 'react';
import { BiShow, BiHide } from 'react-icons/bi';

const Input = forwardRef(({
  label,
  name,
  type = 'text',
  error,
  placeholder,
  className = '',
  required = false,
  ...rest
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';

  return (
    <div className={`ss-input-group mb-3 text-start ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label fw-semibold text-muted-custom small mb-1">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      {isPasswordType ? (
        <div className="input-group">
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            id={name}
            name={name}
            placeholder={placeholder}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${name}-error` : undefined}
            className={`form-control ${error ? 'is-invalid' : ''}`}
            required={required}
            {...rest}
          />
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center justify-content-center border-start-0"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
            title={showPassword ? 'Hide password' : 'View password'}
            aria-label={showPassword ? 'Hide password' : 'View password'}
            style={{
              borderColor: error ? 'var(--ss-danger)' : 'var(--ss-border)',
              backgroundColor: 'var(--ss-surface)',
              color: 'var(--ss-text-secondary)',
              borderTopRightRadius: '8px',
              borderBottomRightRadius: '8px',
            }}
          >
            {showPassword ? <BiHide size={18} /> : <BiShow size={18} />}
          </button>
        </div>
      ) : (
        <input
          ref={ref}
          type={type}
          id={name}
          name={name}
          placeholder={placeholder}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          required={required}
          {...rest}
        />
      )}

      {error && (
        <div id={`${name}-error`} className="ss-input-error" role="alert">
          {error.message || error}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
