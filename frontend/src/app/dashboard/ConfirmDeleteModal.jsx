const ConfirmDeleteModal = ({ modalId, appToDelete, onConfirm, onCancel }) => {
  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Confirm Deletion</h3>
        <p className="py-4">
          Are you sure you want to delete the application for{" "}
          <span className="font-semibold text-primary">
            {appToDelete?.company || "this company"}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="modal-action">
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-error" onClick={onConfirm}>
            Delete Application
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onCancel}>close</button>
      </form>
    </dialog>
  );
};

export default ConfirmDeleteModal;
