import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateField = ({ label, helper, selected, onChange }) => (
  <div className="form-control">
    <label className="label">
      <span className="label-text font-medium">{label}</span>
      {helper && <span className="label-text-alt">{helper}</span>}
    </label>
    <DatePicker
      selected={selected}
      onChange={onChange}
      className="input input-bordered w-full focus:input-primary bg-base-100 text-base-content"
      placeholderText="Select application deadline"
      dateFormat="MMM dd, yyyy"
      minDate={new Date()}
      showPopperArrow={false}
    />
  </div>
);

export default DateField;
