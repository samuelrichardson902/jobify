import { useState } from "react";

const EyeIcon = ({ onMouseDown, onMouseUp, onMouseLeave }) => (
  <button
    type="button"
    tabIndex={-1}
    onMouseDown={onMouseDown}
    onMouseUp={onMouseUp}
    onMouseLeave={onMouseLeave}
    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 bg-transparent border-none cursor-pointer"
    aria-label="Show password while holding"
  >
    {/* Simple eye SVG */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width="22"
      height="22"
    >
      <path
        stroke="#888"
        strokeWidth="2"
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
      />
      <circle cx="12" cy="12" r="3" stroke="#888" strokeWidth="2" />
    </svg>
  </button>
);

const AuthInput = ({
  id,
  name,
  type,
  placeholder,
  value,
  onChange,
  error,
  maxLength,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="form-control relative">
      <input
        id={id}
        name={name}
        type={isPassword && !showPassword ? "password" : "text"}
        autoComplete={name}
        required
        className={`input input-bordered w-full ${error ? "input-error" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
      />
      {isPassword && (
        <EyeIcon
          onMouseDown={() => setShowPassword(true)}
          onMouseUp={() => setShowPassword(false)}
          onMouseLeave={() => setShowPassword(false)}
        />
      )}
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default AuthInput;
