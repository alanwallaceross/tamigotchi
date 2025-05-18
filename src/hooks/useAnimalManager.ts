import { useReducer, useEffect, useCallback } from "react";
import { AnimalState, AnimalType } from "../types";
import {
  animalManagerReducer,
  AnimalActionType,
  AddAnimalPayload,
} from "../state/animalManagerReducer";

const initialAnimals: AnimalState[] = [];

export const useAnimalManager = () => {
  const [animals, dispatch] = useReducer(animalManagerReducer, initialAnimals);

  // Update animal metrics every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch({ type: AnimalActionType.UPDATE_METRICS_OVER_TIME });
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const addAnimal = (name: string, animalType: AnimalType) => {
    const newAnimalPayload: AddAnimalPayload = {
      animalType,
      name,
      id: `animal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    dispatch({
      type: AnimalActionType.ADD_ANIMAL,
      payload: newAnimalPayload,
    });
  };

  const feedAnimal = useCallback((id: string) => {
    dispatch({ type: AnimalActionType.FEED_ANIMAL, payload: { id } });
  }, []);

  const playWithAnimal = useCallback((id: string) => {
    dispatch({ type: AnimalActionType.PLAY_ANIMAL, payload: { id } });
  }, []);

  const restAnimal = useCallback((id: string) => {
    dispatch({ type: AnimalActionType.REST_ANIMAL, payload: { id } });
  }, []);

  const changeAnimalName = useCallback((id: string, newName: string) => {
    dispatch({
      type: AnimalActionType.UPDATE_ANIMAL_NAME,
      payload: { id, newName },
    });
  }, []);

  return {
    animals,
    addAnimal,
    feedAnimal,
    playWithAnimal,
    restAnimal,
    changeAnimalName,
  };
};
