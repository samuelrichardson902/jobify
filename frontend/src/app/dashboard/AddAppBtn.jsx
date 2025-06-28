const AddAppBtn = ({ handleClick }) => {
  return (
    <button
      className="btn btn-primary text-primary-content rounded-lg fixed bottom-0 right-0 m-4"
      onClick={handleClick}
    >
      Add New Application
    </button>
  );
};

export default AddAppBtn;
