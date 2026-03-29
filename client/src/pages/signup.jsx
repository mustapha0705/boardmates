import React, { useState } from "react";
import "../styles/signup.css"

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="signup-page">
      {/* Main */}
      <main className="signup-main">
        <div className="signup-card">
          {/* Title */}
          <div className="signup-title">
            <h1>Create your account</h1>
            <p>
              Join the world's most active community of chess enthusiasts.
            </p>
          </div>

          {/* Form */}
          <form className="signup-form">
            {/* Email */}
            <div className="form-group">
              <label>Email address</label>
              <input type="email" placeholder="name@example.com" />
            </div>

            {/* Password */}
            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Chess Username */}
            <div className="form-group">
              <div className="label-row">
                <label>Chess.com/Lichess Username</label>
                {/* <span className="optional">Optional</span> */}
              </div>
              <input type="text" placeholder="e.g. magnus_c" />
            </div>

            {/* Rating */}
            <div className="form-group">
              <label>Your Rating (ELO)</label>
              <input type="number" placeholder="e.g. 1500" />
            </div>

            {/* Submit */}
            <button className="primary-btn" type="submit">
              <span>Create Account</span>
              <span className="material-symbols-outlined">
                arrow_forward
              </span>
            </button>
          </form>

          {/* Terms */}
          <p className="terms">
            By signing up, you agree to our{" "}
            <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="signup-footer">
        <p>© 2024 Boardmates. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Help Center</a>
          <a href="#">Community Rules</a>
          <a href="#">Security</a>
        </div>
      </footer>
    </div>
  );
}