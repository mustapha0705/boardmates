import React from "react";
import "../styles/login.css"

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-wrapper">
        {/* Card */}
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <h2>Welcome back</h2>
            <p>Please enter your details to sign in</p>
          </div>

          {/* Form */}
          <form className="login-form">
            {/* Email */}
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined icon">
                  mail
                </span>
                <input
                  type="email"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                <a href="#">Forgot password?</a>
              </div>
              <div className="input-wrapper">
                <span className="material-symbols-outlined icon">
                  lock
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Remember */}
            <div className="remember">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <button className="primary-btn" type="submit">
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>Or continue with</span>
          </div>

          {/* Google */}
          <button className="google-btn">
            <svg viewBox="0 0 24 24">
              <path d="M12.48 10.92V14.4h6.5c-.25 1.41-1.41 4.14-6.5 4.14-4.41 0-8-3.65-8-8.14s3.59-8.14 8-8.14c2.51 0 4.19 1.05 5.15 1.96l2.77-2.67C18.6 1.15 15.82 0 12.48 0 5.58 0 0 5.58 0 12.5s5.58 12.5 12.48 12.5c7.21 0 12-5.07 12-12.21 0-.82-.09-1.44-.21-2.07l-11.79.2z" />
            </svg>
            Google
          </button>

          {/* Footer */}
          <p className="signup-text">
            Don't have an account? <a href="#">Sign up</a>
          </p>
        </div>

        {/* Bottom links */}
        <div className="bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Support</a>
        </div>
      </div>
    </div>
  );
}