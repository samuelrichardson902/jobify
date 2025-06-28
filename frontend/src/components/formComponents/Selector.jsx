const Selector = ({
  label,
  value,
  onChange,
  error,
  onKeyDown,
  options = [],
}) => (
  <div className="form-control flex gap-2">
    <label className="label">
      <span className="label-text font-medium">{label}</span>
    </label>
    <select
      value={value || ""}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className="select flex-1 focus:select-primary"
    >
      {options.map((option, index) => (
        <option key={index} value={option.value || option}>
          {option.label || option}
        </option>
      ))}
    </select>
    {error && (
      <span className="label-text-alt text-error text-sm">{error}</span>
    )}
  </div>
);

export default Selector;
