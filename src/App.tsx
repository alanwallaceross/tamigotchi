import { useState } from "react";
import "./App.css";
import Animal from "./components/Animal";
import { useAnimalManager } from "./hooks/useAnimalManager";
import AnimalModal from "./components/AnimalModal";
import { AnimalType } from "./types";

function App() {
  const {
    animals,
    addAnimal,
    feedAnimal,
    playWithAnimal,
    restAnimal,
    changeAnimalName,
  } = useAnimalManager();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddNewAnimalSubmit = (name: string, animalType: AnimalType) => {
    addAnimal(name, animalType);
    setIsModalOpen(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Virtual Pet Simulator</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="add-animal-button"
        >
          Add New Animal
        </button>
      </header>
      <main className="animal-grid">
        {animals.map((animal) => (
          <Animal
            key={animal.id}
            animal={animal}
            onFeed={feedAnimal}
            onPlay={playWithAnimal}
            onRest={restAnimal}
            onNameChange={changeAnimalName}
          />
        ))}
      </main>
      <AnimalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddNewAnimalSubmit}
      />
    </div>
  );
}

export default App;

