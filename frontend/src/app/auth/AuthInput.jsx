const AuthInput = ({
  id,
  name,
  type,
  placeholder,
  value,
  onChange,
  error,
  maxLength,
}) => (
  <div className="form-control">
    <input
      id={id}
      name={name}
      type={type}
      autoComplete={name}
      required
      className={`input input-bordered w-full ${error ? "input-error" : ""}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
    />
    {error && (
      <label className="label">
        <span className="label-text-alt text-error">{error}</span>
      </label>
    )}
  </div>
);

export default AuthInput;
