const AddAppBtn = (modalId) => {
  return (
    <button
      className="btn btn-primary text-white rounded-lg fixed bottom-0 right-0 m-4"
      onClick={() => document.getElementById(modalId).showModal()}
    >
      Add New Application
    </button>
  );
};

export default AddAppBtn;
