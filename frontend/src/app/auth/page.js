"use client";

import { useSupabaseAuth } from "../../components/SupabaseAuthProvider";
import { useAuthForm } from "../../lib/useAuthForm";
import AuthCard from "./AuthCard";
import AuthTabs from "./AuthTabs";
import AuthInput from "./AuthInput";
import AuthButton from "./AuthButton";

const Auth = () => {
  const { supabase, session, loading: authLoading } = useSupabaseAuth();
  const {
    email,
    password,
    confirmPassword,
    formLoading,
    message,
    errors,
    tab,
    setTab,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleEmailSignIn,
    handleEmailSignUp,
    authLoading: hookAuthLoading,
    session: hookSession,
  } = useAuthForm({ supabase, session, authLoading });

  const backgroundImageUrl = "/mountain_landscape_bg.jpg";

  // loading spinner
  if (hookAuthLoading || hookSession) {
    return (
      <div className="relative min-h-screen font-inter">
        {/* Background Image Div */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center blur-lg"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
        {/* Centered Loading Spinner */}
        <div className="relative z-10 flex justify-center items-center h-screen">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-inter">
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center filter blur-md"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-2">
        <AuthCard
          title="Jobify"
          headline="Keep Track of all your Job Applications in One Place"
        >
          <AuthTabs tab={tab} setTab={setTab} />

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <AuthInput
              id="email-address"
              name="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={handleEmailChange}
              error={errors.email}
              maxLength={254}
            />
            <AuthInput
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              error={errors.password}
              maxLength={128}
            />
            {tab === "signup" && (
              <AuthInput
                id="confirm-password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                error={errors.confirmPassword}
                maxLength={128}
              />
            )}

            {message && (
              <div
                className={`alert mb-4 ${
                  message.includes("success") ||
                  message.includes("Successfully") ||
                  message.includes("Check your email")
                    ? "alert-success"
                    : "alert-error"
                }`}
              >
                <span>{message}</span>
              </div>
            )}

            <div className="form-control">
              {tab === "login" ? (
                <AuthButton
                  onClick={handleEmailSignIn}
                  loading={formLoading}
                  className="btn-primary"
                >
                  Sign In
                </AuthButton>
              ) : (
                <AuthButton
                  onClick={handleEmailSignUp}
                  loading={formLoading}
                  className="btn-primary"
                >
                  Create Account
                </AuthButton>
              )}
            </div>
          </form>

          <div className="divider">OR</div>

          <div className="flex justify-center mt-2">
            <div id="googleSignInButton"></div>
          </div>
        </AuthCard>
      </div>
    </div>
  );
};

export default Auth;
