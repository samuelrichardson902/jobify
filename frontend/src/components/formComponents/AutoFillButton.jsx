const AutoFillButton = ({ onClick, disabled, loading }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="btn btn-outline btn-accent min-w-fit self-end"
  >
    {loading ? (
      <span className="loading loading-spinner loading-sm"></span>
    ) : (
      "AutoFill"
    )}
  </button>
);

export default AutoFillButton;
