const TextAreaField = ({ label, value, onChange, placeholder, rows = 2 }) => (
  <div className="form-control">
    <label className="label">
      <span className="label-text font-medium">{label}</span>
    </label>
    <textarea
      value={value}
      onChange={onChange}
      className="textarea textarea-bordered w-full focus:textarea-primary resize-none"
      placeholder={placeholder}
      rows={rows}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) e.preventDefault();
      }}
    ></textarea>
  </div>
);

export default TextAreaField;
