import React, { useState } from "react";
import "./AnimalModal.css";
import { AnimalType } from "../types";

interface AnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, animalType: AnimalType) => void;
}

const AnimalModal: React.FC<AnimalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [animalType, setAnimalType] = useState<AnimalType>(AnimalType.Poodle);
  const [nameError, setNameError] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    if (nameError) {
      setNameError("");
    }
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAnimalType(event.target.value as AnimalType);
  };

  const validateName = (): boolean => {
    if (!name.trim()) {
      setNameError("Name cannot be empty.");
      return false;
    }
    if (name.trim().length > 17) {
      setNameError("Name cannot exceed 17 characters.");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleSubmit = () => {
    if (validateName()) {
      onSubmit(name.trim(), animalType);
      setName("");
      setAnimalType(AnimalType.Poodle);
      onClose();
    }
  };

  const handleCancel = () => {
    setName("");
    setAnimalType(AnimalType.Poodle);
    setNameError("");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="animalModalHeading"
      >
        <h2 id="animalModalHeading">Add New Animal</h2>

        <div className="form-group">
          <label htmlFor="animalName">Name:</label>
          <input
            type="text"
            id="animalName"
            value={name}
            onChange={handleNameChange}
            aria-describedby="nameError"
          />
          {nameError && (
            <p id="nameError" className="error-message">
              {nameError}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="animalType">Species:</label>
          <select
            id="animalType"
            value={animalType}
            onChange={handleTypeChange}
          >
            {Object.values(AnimalType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <button onClick={handleSubmit} className="button-submit">
            Submit
          </button>
          <button onClick={handleCancel} className="button-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimalModal;
