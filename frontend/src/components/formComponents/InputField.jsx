const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  onKeyDown,
}) => (
  <div className="form-control">
    <label className="label">
      <span className="label-text font-medium">{label}</span>
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`input input-bordered w-full focus:input-primary ${
        error ? "input-error border-error" : ""
      }`}
      onKeyDown={onKeyDown}
    />
    {error && (
      <span className="label-text-alt text-error text-sm">{error}</span>
    )}
  </div>
);

export default InputField;
