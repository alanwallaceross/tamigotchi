export enum AnimalType {
  Poodle = "Poodle",
  Chameleon = "Chameleon",
  CalicoCat = "Calico Cat",
}

export interface AnimalState {
  id: string;
  name: string;
  type: AnimalType;
  happiness: number;
  hunger: number;
  sleepiness: number;
}
