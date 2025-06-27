const ToggleSwitch = ({ label, description, checked, onChange }) => (
  <div className="form-control">
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="label-text font-medium text-base">{label}</span>
        {description && <span className="label-text-alt">{description}</span>}
      </div>
      <input
        type="checkbox"
        className="toggle toggle-primary toggle-lg"
        checked={checked}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onChange();
          }
        }}
      />
    </div>
  </div>
);

export default ToggleSwitch;
