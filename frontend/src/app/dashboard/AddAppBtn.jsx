import AddAppModal from "./AddAppModal";

const AddAppBtn = () => {
  const modalId = "addAppModal";

  return (
    <>
      <AddAppModal modalId={modalId} />

      <button
        className="btn btn-primary text-primary-content rounded-lg fixed bottom-0 right-0 m-4"
        onClick={() => document.getElementById(modalId)?.showModal()}
      >
        Add New Application
      </button>
    </>
  );
};

export default AddAppBtn;
