import { useState, useEffect } from "react";

export function useAuthForm({ supabase, session, authLoading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [tab, setTab] = useState("login"); // 'login' or 'signup'

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (tab === "signup") {
      if (!emailRegex.test(email)) return "Please enter a valid email address";
      if (email.length > 254) return "Email is too long";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (tab === "signup") {
      if (password.length < 6)
        return "Password must be at least 6 characters long";
      if (password.length > 128) return "Password is too long";
      if (password.toLowerCase() === password)
        return "Password should contain at least one uppercase letter";
      if (!/\d/.test(password))
        return "Password should contain at least one number";
    }
    return "";
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  const sanitizeInput = (input) => {
    let sanitized = input.trim();
    sanitized = sanitized.replace(/[\x00-\x0B\x0C\x0E-\x1F\x7F]/g, "");
    return sanitized;
  };

  const validateForm = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError =
      tab === "signup"
        ? validateConfirmPassword(password, confirmPassword)
        : "";

    setErrors({
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    return !emailError && !passwordError && !confirmPasswordError;
  };

  const handleEmailChange = (e) => {
    const sanitizedEmail = sanitizeInput(e.target.value);
    setEmail(sanitizedEmail);
    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
  };

  const handlePasswordChange = (e) => {
    const sanitizedPassword = sanitizeInput(e.target.value);
    setPassword(sanitizedPassword);
    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
  };

  const handleConfirmPasswordChange = (e) => {
    const sanitizedConfirmPassword = sanitizeInput(e.target.value);
    setConfirmPassword(sanitizedConfirmPassword);
    if (errors.confirmPassword)
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
  };

  // ... (useEffect for Google Identity Services remains the same)
  useEffect(() => {
    if (authLoading || session) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleSignIn();
      setFormLoading(false);
    };
    script.onerror = () => {
      setMessage(
        "Failed to load Google Sign-In script. Please check your network."
      );
      setFormLoading(false);
    };
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
    // eslint-disable-next-line
  }, [authLoading, session]);

  const initializeGoogleSignIn = () => {
    if (
      typeof window.google === "undefined" ||
      !window.google.accounts ||
      !window.google.accounts.id
    ) {
      console.warn(
        "Google Identity Services script not fully loaded or available."
      );
      return;
    }
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        if (response.credential) {
          setMessage("");
          setFormLoading(true);
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
          });
          if (error) {
            setMessage(`Google sign-in error: ${error.message}`);
            console.error("Google sign-in error:", error);
          } else {
            setMessage("Successfully signed in with Google! Redirecting...");
          }
          setFormLoading(false);
        } else {
          setMessage("Google sign-in cancelled or failed to get credential.");
          console.error("Google sign-in failed: No credential received.");
        }
      },
    });
    window.google.accounts.id.renderButton(
      document.getElementById("googleSignInButton"),
      {
        theme: "outline",
        text: "continue_with",
        size: "large",
        type: "standard",
        shape: "rectangular",
      }
    );
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage("");
      return;
    }
    setFormLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });
    if (error) {
      setMessage(`${error.message}`);
      console.error("Login error:", error);
    } else {
      setMessage("Successfully logged in! Redirecting...");
    }
    setFormLoading(false);
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage("");
      return;
    }
    setFormLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
    });
    if (error) {
      setMessage(`Sign up failed: ${error.message}`);
      console.error("Sign up error:", error);
    } else {
      setMessage("Check your email for the confirmation link!");
    }
    setFormLoading(false);
  };

  return {
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
    authLoading,
    session,
  };
}
