import { AnimalType } from "../types";

export const METRIC_THRESHOLD_FULL = 100;
export const DEFAULT_METRIC_VALUE = 50; // Neutral value

export interface AnimalInteractionRates {
  feedAmount: number; // How much hunger decreases when fed
  playAmount: number; // How much happiness increases when played with
  restAmount: number; // How much sleepiness decreases when rested
}

export interface AnimalTimeRates {
  baseHappinessDecayRate: number; // Points per interval
  baseHungerIncreaseRate: number; // Points per interval
  baseSleepinessIncreaseRate: number; // Points per interval
  happinessDecayModifierWhenFull: number; // Multiplier, e.g., 1.5 for 50% faster, or 2 for 100% faster
}

export interface AnimalConfig extends AnimalInteractionRates, AnimalTimeRates {}

export const animalConfigs: Record<AnimalType, AnimalConfig> = {
  [AnimalType.Poodle]: {
    // Interactions
    feedAmount: 10,
    playAmount: 10,
    restAmount: 10,
    // Time-based rates
    baseHappinessDecayRate: 5,
    baseHungerIncreaseRate: 5,
    baseSleepinessIncreaseRate: 6,
    happinessDecayModifierWhenFull: 1.5,
  },
  [AnimalType.Chameleon]: {
    // Interactions
    feedAmount: 12,
    playAmount: 12,
    restAmount: 12,
    // Time-based rates
    baseHappinessDecayRate: 7,
    baseHungerIncreaseRate: 8,
    baseSleepinessIncreaseRate: 7,
    happinessDecayModifierWhenFull: 1.3,
  },
  [AnimalType.CalicoCat]: {
    // Interactions
    feedAmount: 8,
    playAmount: 8,
    restAmount: 15,
    // Time-based rates
    baseHappinessDecayRate: 6,
    baseHungerIncreaseRate: 4,
    baseSleepinessIncreaseRate: 5,
    happinessDecayModifierWhenFull: 1.8,
  },
};
