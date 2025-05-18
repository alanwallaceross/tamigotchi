import {
  animalManagerReducer,
  AnimalActionType,
  AnimalAction,
} from "./animalManagerReducer";
import { AnimalState, AnimalType } from "../types";
import {
  DEFAULT_METRIC_VALUE,
  animalConfigs,
  METRIC_THRESHOLD_FULL,
} from "../config/animalConfigs";

describe("animalManagerReducer", () => {
  let baseInitialState: AnimalState[];

  beforeEach(() => {
    baseInitialState = [
      {
        id: "poodle1",
        name: "Buddy",
        type: AnimalType.Poodle,
        hunger: 50,
        happiness: 50,
        sleepiness: 50,
      },
      {
        id: "cat1",
        name: "Whiskers",
        type: AnimalType.CalicoCat,
        hunger: 30,
        happiness: 70,
        sleepiness: 40,
      },
    ];
  });

  it("should handle ADD_ANIMAL", () => {
    const action: AnimalAction = {
      type: AnimalActionType.ADD_ANIMAL,
      payload: {
        id: "chameleon1",
        animalType: AnimalType.Chameleon,
        name: "Pascal",
      },
    };
    const newState = animalManagerReducer(baseInitialState, action);
    expect(newState).toHaveLength(baseInitialState.length + 1);
    const newAnimal = newState.find((animal) => animal.id === "chameleon1");
    expect(newAnimal).toEqual({
      id: "chameleon1",
      name: "Pascal",
      type: AnimalType.Chameleon,
      hunger: DEFAULT_METRIC_VALUE,
      happiness: DEFAULT_METRIC_VALUE,
      sleepiness: DEFAULT_METRIC_VALUE,
    });
  });

  it("should handle FEED_ANIMAL for a specific animal", () => {
    const animalToFeed = baseInitialState[0]; // Buddy the Poodle
    const config = animalConfigs[animalToFeed.type];
    const action: AnimalAction = {
      type: AnimalActionType.FEED_ANIMAL,
      payload: { id: animalToFeed.id },
    };
    const newState = animalManagerReducer(baseInitialState, action);
    const fedAnimal = newState.find((animal) => animal.id === animalToFeed.id);
    expect(fedAnimal?.hunger).toBe(
      Math.max(0, animalToFeed.hunger - config.feedAmount)
    );
    const otherAnimal = newState.find(
      (animal) => animal.id === baseInitialState[1].id
    );
    expect(otherAnimal?.hunger).toBe(baseInitialState[1].hunger);
  });

  it("should handle PLAY_ANIMAL for a specific animal", () => {
    const animalToPlayWith = baseInitialState[0];
    const config = animalConfigs[animalToPlayWith.type];
    const action: AnimalAction = {
      type: AnimalActionType.PLAY_ANIMAL,
      payload: { id: animalToPlayWith.id },
    };
    const newState = animalManagerReducer(baseInitialState, action);
    const playedAnimal = newState.find(
      (animal) => animal.id === animalToPlayWith.id
    );
    expect(playedAnimal?.happiness).toBe(
      Math.min(100, animalToPlayWith.happiness + config.playAmount)
    );
  });

  it("should handle REST_ANIMAL for a specific animal", () => {
    const animalToRest = baseInitialState[0];
    const config = animalConfigs[animalToRest.type];
    const action: AnimalAction = {
      type: AnimalActionType.REST_ANIMAL,
      payload: { id: animalToRest.id },
    };
    const newState = animalManagerReducer(baseInitialState, action);
    const restedAnimal = newState.find(
      (animal) => animal.id === animalToRest.id
    );
    expect(restedAnimal?.sleepiness).toBe(
      Math.max(0, animalToRest.sleepiness - config.restAmount)
    );
  });

  it("should handle UPDATE_ANIMAL_NAME for a specific animal", () => {
    const animalToRename = baseInitialState[0];
    const newName = "Super Buddy";
    const action: AnimalAction = {
      type: AnimalActionType.UPDATE_ANIMAL_NAME,
      payload: { id: animalToRename.id, newName },
    };
    const newState = animalManagerReducer(baseInitialState, action);
    const renamedAnimal = newState.find(
      (animal) => animal.id === animalToRename.id
    );
    expect(renamedAnimal?.name).toBe(newName);
  });

  it("should handle UPDATE_METRICS_OVER_TIME for all animals (standard decay/increase)", () => {
    const action: AnimalAction = {
      type: AnimalActionType.UPDATE_METRICS_OVER_TIME,
    };
    const newState = animalManagerReducer(baseInitialState, action);

    newState.forEach((updatedAnimal, index) => {
      const originalAnimal = baseInitialState[index];
      const config = animalConfigs[originalAnimal.type];
      expect(updatedAnimal.hunger).toBe(
        Math.min(100, originalAnimal.hunger + config.baseHungerIncreaseRate)
      );
      expect(updatedAnimal.happiness).toBe(
        Math.max(0, originalAnimal.happiness - config.baseHappinessDecayRate)
      );
      expect(updatedAnimal.sleepiness).toBe(
        Math.min(
          100,
          originalAnimal.sleepiness + config.baseSleepinessIncreaseRate
        )
      );
    });
  });

  it("should handle UPDATE_METRICS_OVER_TIME with accelerated happiness decay when hunger is full", () => {
    baseInitialState[0].hunger = METRIC_THRESHOLD_FULL; // Poodle's hunger is full
    const originalPoodle = baseInitialState[0];
    const poodleConfig = animalConfigs[originalPoodle.type];

    const action: AnimalAction = {
      type: AnimalActionType.UPDATE_METRICS_OVER_TIME,
    };
    const newState = animalManagerReducer(baseInitialState, action);
    const updatedPoodle = newState.find((a) => a.id === originalPoodle.id);

    const expectedHappinessDecay =
      poodleConfig.baseHappinessDecayRate *
      poodleConfig.happinessDecayModifierWhenFull;
    expect(updatedPoodle?.happiness).toBe(
      Math.max(0, originalPoodle.happiness - expectedHappinessDecay)
    );
  });

  it("should handle UPDATE_METRICS_OVER_TIME with accelerated happiness decay when sleepiness is full", () => {
    baseInitialState[0].sleepiness = METRIC_THRESHOLD_FULL; // Poodle's sleepiness is full
    const originalPoodle = baseInitialState[0];
    const poodleConfig = animalConfigs[originalPoodle.type];

    const action: AnimalAction = {
      type: AnimalActionType.UPDATE_METRICS_OVER_TIME,
    };
    const newState = animalManagerReducer(baseInitialState, action);
    const updatedPoodle = newState.find((a) => a.id === originalPoodle.id);

    const expectedHappinessDecay =
      poodleConfig.baseHappinessDecayRate *
      poodleConfig.happinessDecayModifierWhenFull;
    expect(updatedPoodle?.happiness).toBe(
      Math.max(0, originalPoodle.happiness - expectedHappinessDecay)
    );
  });

  it("should return current state for an unknown action type", () => {
    const unknownAction = { type: "UNKNOWN_ACTION" } as unknown as AnimalAction;
    const newState = animalManagerReducer(baseInitialState, unknownAction);
    expect(newState).toEqual(baseInitialState);
  });

  it("should not let metrics go below 0 or above 100 from interactions", () => {
    baseInitialState[0] = {
      ...baseInitialState[0],
      hunger: 5,
      happiness: 95,
      sleepiness: 5,
    };
    const animal = baseInitialState[0];

    const actionFeed: AnimalAction = {
      type: AnimalActionType.FEED_ANIMAL,
      payload: { id: animal.id },
    };
    let newState = animalManagerReducer(baseInitialState, actionFeed);
    expect(newState.find((a) => a.id === animal.id)?.hunger).toBe(0);

    const actionPlay: AnimalAction = {
      type: AnimalActionType.PLAY_ANIMAL,
      payload: { id: animal.id },
    };
    newState = animalManagerReducer(newState, actionPlay);
    expect(newState.find((a) => a.id === animal.id)?.happiness).toBe(100);

    const actionRest: AnimalAction = {
      type: AnimalActionType.REST_ANIMAL,
      payload: { id: animal.id },
    };
    newState = animalManagerReducer(newState, actionRest);
    expect(newState.find((a) => a.id === animal.id)?.sleepiness).toBe(0);
  });
});
