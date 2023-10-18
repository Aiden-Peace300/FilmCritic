import './WatchlistDeletePopup.css';

type EditBioTypes = {
  onClose: () => void;
};

const EditProfileBio: React.FC<EditBioTypes> = ({ onClose }) => {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <div className="message">
          You are a bout to edit your Profile Bio Here
        </div>
        <div className="buttons-container">
          <button className="button delete">Save</button>
          <button className="button cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileBio;
