import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateField = ({ label, helper, selected, onChange }) => (
  <div className="form-control">
    <label className="label">
      <span className="label-text font-medium">{label}</span>
      {helper && <span className="label-text-alt">{helper}</span>}
    </label>
    <div className="relative">
      <DatePicker
        selected={selected}
        onChange={onChange}
        className="input input-bordered w-full focus:input-primary bg-base-100 text-base-content pr-10"
        placeholderText="Select application deadline"
        dateFormat="MMM dd, yyyy"
        minDate={new Date()}
        showPopperArrow={false}
      />
      {selected && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange(null);
          }}
          onMouseDown={(e) => e.preventDefault()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center bg-error text-error-content hover:bg-error-focus select-none"
          title="Clear date"
        >
          ✕
        </button>
      )}
    </div>
  </div>
);

export default DateField;
