const AuthButton = ({ onClick, loading, children, className }) => (
  <button
    type="submit"
    onClick={onClick}
    className={`btn w-full ${className}`}
    disabled={loading}
  >
    {loading ? (
      <span className="loading loading-spinner loading-xs"></span>
    ) : (
      children
    )}
  </button>
);

export default AuthButton;
