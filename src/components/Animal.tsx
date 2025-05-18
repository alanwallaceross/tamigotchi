import { AnimalState } from "../types";
import { KeyboardEvent, useRef, useEffect } from "react";
import "./Animal.css";

interface AnimalProps {
  animal: AnimalState;
  onNameChange: (id: string, newName: string) => void;
  onFeed: (id: string) => void;
  onPlay: (id: string) => void;
  onRest: (id: string) => void;
}

const Animal: React.FC<AnimalProps> = ({
  animal,
  onNameChange,
  onFeed,
  onPlay,
  onRest,
}) => {
  const nameDisplayRef = useRef<HTMLSpanElement>(null);
  const justSubmittedByEnter = useRef(false);

  useEffect(() => {
    if (
      nameDisplayRef.current &&
      nameDisplayRef.current.textContent !== animal.name
    ) {
      nameDisplayRef.current.textContent = animal.name;
    }
  }, [animal.name]);

  const handleNameEdit = () => {
    const currentVal = nameDisplayRef.current?.textContent?.trim() || "";
    if (currentVal && currentVal !== animal.name) {
      onNameChange(animal.id, currentVal);
    } else {
      if (nameDisplayRef.current) {
        nameDisplayRef.current.textContent = animal.name;
      }
    }
  };

  const handleNameKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleNameEdit();
      justSubmittedByEnter.current = true;
      nameDisplayRef.current?.blur();
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (nameDisplayRef.current) {
        nameDisplayRef.current.textContent = animal.name;
      }
      nameDisplayRef.current?.blur();
    }
  };

  const handleNameBlur = () => {
    if (justSubmittedByEnter.current) {
      justSubmittedByEnter.current = false;
      return;
    }
    handleNameEdit();
  };

  return (
    <div className="animal-container">
      <div className="animal-animal">
        <img
          src={`src/assets/avatars/${animal.type
            .toLowerCase()
            .replace(/\s+/g, "")}.svg`}
          alt={`Your ${animal.type}`}
          className="animal-image"
        />
        <div className="animal-identity">
          <h1 className="animal-name-display">
            <span className="animal-name-label">Name: </span>
            <span
              ref={nameDisplayRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onKeyDown={handleNameKeyDown}
              onBlur={handleNameBlur}
              className="animal-name-value"
              title="Editable name"
            >
              {animal.name}
            </span>
          </h1>
          <p className="animal-type-display">
            <strong>Species:</strong> {animal.type}
          </p>
        </div>
      </div>
      <div className="animal-stats">
        <div className="stat">
          <strong>Hunger:</strong>
          <div className="meter">
            <div
              className="meter-fill"
              style={{ width: `${animal.hunger}%` }}
            ></div>
          </div>
          <button className="action-button" onClick={() => onFeed(animal.id)}>
            Feed
          </button>
        </div>
        <div className="stat">
          <strong>Happiness:</strong>
          <div className="meter">
            <div
              className="meter-fill"
              style={{ width: `${animal.happiness}%` }}
            ></div>
          </div>
          <button className="action-button" onClick={() => onPlay(animal.id)}>
            Play
          </button>
        </div>
        <div className="stat">
          <strong>Sleep:</strong>{" "}
          <div className="meter">
            <div
              className="meter-fill"
              style={{ width: `${animal.sleepiness}%` }}
            ></div>
          </div>
          <button className="action-button" onClick={() => onRest(animal.id)}>
            Rest
          </button>
        </div>
      </div>
    </div>
  );
};

export default Animal;
