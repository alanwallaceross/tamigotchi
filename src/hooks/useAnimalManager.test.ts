import { act, renderHook } from "@testing-library/react";
import { describe, it, expect } from "bun:test";
import { useAnimalManager } from "./useAnimalManager";
import { AnimalType } from "../types";
import {
  DEFAULT_METRIC_VALUE,
  animalConfigs,
  // METRIC_THRESHOLD_FULL, // Not directly used in assertions here, but good for context
} from "../config/animalConfigs";

describe("useAnimalManager Hook", () => {
  it("should initialize with an empty animal list", () => {
    const { result } = renderHook(() => useAnimalManager());
    expect(result.current.animals).toHaveLength(0);
  });

  const addTestAnimal = (
    hookResult: { current: ReturnType<typeof useAnimalManager> },
    name: string,
    type: AnimalType
  ) => {
    act(() => {
      hookResult.current.addAnimal(name, type);
    });
    const newAnimal =
      hookResult.current.animals[hookResult.current.animals.length - 1];
    if (!newAnimal) throw new Error("Animal not added in test helper");
    return { animalId: newAnimal.id, animalType: newAnimal.type };
  };

  it("addAnimal should add the first new animal correctly", () => {
    const { result } = renderHook(() => useAnimalManager());
    expect(result.current.animals).toHaveLength(0);

    const testName = "Singleton Poodle";
    const testType = AnimalType.Poodle;
    act(() => {
      result.current.addAnimal(testName, testType);
    });

    expect(result.current.animals).toHaveLength(1);
    let newAnimal = result.current.animals[0];
    expect(newAnimal.id).toEqual(expect.stringMatching(/^animal-/));
    expect(newAnimal.type).toBe(testType);
    expect(newAnimal.name).toBe(testName);
    expect(newAnimal.hunger).toBe(DEFAULT_METRIC_VALUE);
    expect(newAnimal.happiness).toBe(DEFAULT_METRIC_VALUE);
    expect(newAnimal.sleepiness).toBe(DEFAULT_METRIC_VALUE);

    const secondTestName = "Duo Chameleon";
    const secondTestType = AnimalType.Chameleon;
    act(() => {
      result.current.addAnimal(secondTestName, secondTestType);
    });
    expect(result.current.animals).toHaveLength(2);
    newAnimal = result.current.animals[1];
    expect(newAnimal.id).toEqual(expect.stringMatching(/^animal-/));
    expect(newAnimal.id).not.toBe(result.current.animals[0].id);
    expect(newAnimal.type).toBe(secondTestType);
    expect(newAnimal.name).toBe(secondTestName);
  });

  it("feedAnimal should decrease hunger of the specified animal", () => {
    const { result } = renderHook(() => useAnimalManager());
    const { animalId, animalType } = addTestAnimal(
      result,
      "Feed Me",
      AnimalType.CalicoCat
    );

    act(() => {
      result.current.feedAnimal(animalId);
    });

    const fedAnimal = result.current.animals.find((a) => a.id === animalId);
    expect(fedAnimal).toBeDefined();
    const expectedHunger =
      DEFAULT_METRIC_VALUE - animalConfigs[animalType].feedAmount;
    expect(fedAnimal!.hunger).toBe(expectedHunger);
  });

  it("playWithAnimal should increase happiness of the specified animal", () => {
    const { result } = renderHook(() => useAnimalManager());
    const { animalId, animalType } = addTestAnimal(
      result,
      "Playtime Pup",
      AnimalType.Poodle
    );

    act(() => {
      result.current.playWithAnimal(animalId);
    });

    const playedAnimal = result.current.animals.find((a) => a.id === animalId);
    expect(playedAnimal).toBeDefined();
    const expectedHappiness =
      DEFAULT_METRIC_VALUE + animalConfigs[animalType].playAmount;
    expect(playedAnimal!.happiness).toBe(expectedHappiness);
  });

  it("restAnimal should decrease sleepiness of the specified animal", () => {
    const { result } = renderHook(() => useAnimalManager());
    const { animalId, animalType } = addTestAnimal(
      result,
      "Sleepy Sloth",
      AnimalType.Chameleon
    );

    act(() => {
      result.current.restAnimal(animalId);
    });

    const restedAnimal = result.current.animals.find((a) => a.id === animalId);
    expect(restedAnimal).toBeDefined();
    const expectedSleepiness =
      DEFAULT_METRIC_VALUE - animalConfigs[animalType].restAmount;
    expect(restedAnimal!.sleepiness).toBe(expectedSleepiness);
  });

  it("changeAnimalName should update the name of the specified animal", () => {
    const { result } = renderHook(() => useAnimalManager());
    const { animalId } = addTestAnimal(result, "Old Name", AnimalType.Poodle);
    const newName = "Brand New Name";

    act(() => {
      result.current.changeAnimalName(animalId, newName);
    });

    const renamedAnimal = result.current.animals.find((a) => a.id === animalId);
    expect(renamedAnimal).toBeDefined();
    expect(renamedAnimal!.name).toBe(newName);
  });

  it("should update metrics over time via useEffect and setInterval", () => {
    const { result } = renderHook(() => useAnimalManager());
    const { animalId, animalType } = addTestAnimal(
      result,
      "Timer Test Animal",
      AnimalType.CalicoCat
    );

    const initialAnimal = result.current.animals.find((a) => a.id === animalId);
    expect(initialAnimal).toBeDefined();
    const config = animalConfigs[animalType];

    act(() => {
      global.clock.tick(5000);
    });

    const updatedAnimal = result.current.animals.find((a) => a.id === animalId);
    expect(updatedAnimal).toBeDefined();
    expect(updatedAnimal!.hunger).toBe(
      DEFAULT_METRIC_VALUE + config.baseHungerIncreaseRate
    );
    expect(updatedAnimal!.happiness).toBe(
      DEFAULT_METRIC_VALUE - config.baseHappinessDecayRate
    );
    expect(updatedAnimal!.sleepiness).toBe(
      DEFAULT_METRIC_VALUE + config.baseSleepinessIncreaseRate
    );

    act(() => {
      global.clock.tick(5000);
    });

    const furtherUpdatedAnimal = result.current.animals.find(
      (a) => a.id === animalId
    );
    expect(furtherUpdatedAnimal).toBeDefined();
    expect(furtherUpdatedAnimal!.hunger).toBe(
      DEFAULT_METRIC_VALUE + 2 * config.baseHungerIncreaseRate
    );
    expect(furtherUpdatedAnimal!.happiness).toBe(
      DEFAULT_METRIC_VALUE - 2 * config.baseHappinessDecayRate
    );
    expect(furtherUpdatedAnimal!.sleepiness).toBe(
      DEFAULT_METRIC_VALUE + 2 * config.baseSleepinessIncreaseRate
    );
  });

  it("useEffect cleanup should clear the interval, even if no animals were added", () => {
    const { unmount } = renderHook(() => useAnimalManager());

    unmount();

    expect(() => {
      act(() => {
        global.clock.tick(10000);
      });
    }).not.toThrow();
  });
});
