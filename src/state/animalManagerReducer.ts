import { AnimalState, AnimalType } from "../types";
import {
  animalConfigs,
  METRIC_THRESHOLD_FULL,
  DEFAULT_METRIC_VALUE,
} from "../config/animalConfigs";
import { updateEntityInArray } from "../utils";

export enum AnimalActionType {
  ADD_ANIMAL = "ADD_ANIMAL",
  FEED_ANIMAL = "FEED_ANIMAL",
  PLAY_ANIMAL = "PLAY_ANIMAL",
  REST_ANIMAL = "REST_ANIMAL",
  UPDATE_ANIMAL_NAME = "UPDATE_ANIMAL_NAME",
  UPDATE_METRICS_OVER_TIME = "UPDATE_METRICS_OVER_TIME",
}

export type AddAnimalPayload = {
  animalType: AnimalType;
  name: string;
  id: string;
};
export type AnimalIdPayload = { id: string };
export type UpdateAnimalNamePayload = { id: string; newName: string };

export type AnimalAction =
  | { type: AnimalActionType.ADD_ANIMAL; payload: AddAnimalPayload }
  | { type: AnimalActionType.FEED_ANIMAL; payload: AnimalIdPayload }
  | { type: AnimalActionType.PLAY_ANIMAL; payload: AnimalIdPayload }
  | { type: AnimalActionType.REST_ANIMAL; payload: AnimalIdPayload }
  | {
      type: AnimalActionType.UPDATE_ANIMAL_NAME;
      payload: UpdateAnimalNamePayload;
    }
  | { type: AnimalActionType.UPDATE_METRICS_OVER_TIME }; // No payload, acts on all animals

export const animalManagerReducer = (
  state: AnimalState[],
  action: AnimalAction
): AnimalState[] => {
  switch (action.type) {
    case AnimalActionType.ADD_ANIMAL: {
      const newAnimal: AnimalState = {
        id: action.payload.id,
        name: action.payload.name,
        type: action.payload.animalType,
        hunger: DEFAULT_METRIC_VALUE,
        happiness: DEFAULT_METRIC_VALUE,
        sleepiness: DEFAULT_METRIC_VALUE,
      };
      return [...state, newAnimal];
    }

    case AnimalActionType.FEED_ANIMAL: {
      return updateEntityInArray(state, action.payload.id, (animal) => {
        const config = animalConfigs[animal.type];
        return {
          ...animal,
          hunger: Math.max(0, animal.hunger - config.feedAmount),
        };
      });
    }

    case AnimalActionType.PLAY_ANIMAL: {
      return updateEntityInArray(state, action.payload.id, (animal) => {
        const config = animalConfigs[animal.type];
        return {
          ...animal,
          happiness: Math.min(100, animal.happiness + config.playAmount),
        };
      });
    }

    case AnimalActionType.REST_ANIMAL: {
      return updateEntityInArray(state, action.payload.id, (animal) => {
        const config = animalConfigs[animal.type];
        return {
          ...animal,
          sleepiness: Math.max(0, animal.sleepiness - config.restAmount),
        };
      });
    }

    case AnimalActionType.UPDATE_ANIMAL_NAME: {
      return updateEntityInArray(state, action.payload.id, (animal) => ({
        ...animal,
        name: action.payload.newName,
      }));
    }

    case AnimalActionType.UPDATE_METRICS_OVER_TIME: {
      return state.map((animal) => {
        const config = animalConfigs[animal.type];
        let currentHappinessDecayRate = config.baseHappinessDecayRate;

        if (
          animal.hunger >= METRIC_THRESHOLD_FULL ||
          animal.sleepiness >= METRIC_THRESHOLD_FULL
        ) {
          currentHappinessDecayRate *= config.happinessDecayModifierWhenFull;
        }

        return {
          ...animal,
          hunger: Math.min(100, animal.hunger + config.baseHungerIncreaseRate),
          happiness: Math.max(0, animal.happiness - currentHappinessDecayRate),
          sleepiness: Math.min(
            100,
            animal.sleepiness + config.baseSleepinessIncreaseRate
          ),
        };
      });
    }

    default:
      return state;
  }
};
