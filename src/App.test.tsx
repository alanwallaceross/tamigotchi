import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import {
  test,
  describe,
  expect,
  beforeEach,
  afterEach,
  spyOn,
  jest,
} from "bun:test";
import App from "./App";
import { AnimalType, AnimalState } from "./types";
import { animalConfigs, DEFAULT_METRIC_VALUE } from "./config/animalConfigs";
import "@testing-library/jest-dom";

import * as AnimalComponentModule from "./components/Animal";

const originalMathRandom = Math.random;
const METRIC_UPDATE_INTERVAL = 5000;

interface MockAnimalProps {
  animal: AnimalState;
  onNameChange: (id: string, name: string) => void;
  onFeed: (id: string) => void;
  onPlay: (id: string) => void;
  onRest: (id: string) => void;
}

const animalComponentCallTracker = jest.fn();

const mockAnimalRenderImplementation = (props: MockAnimalProps) => {
  animalComponentCallTracker(props);
  return (
    <div data-testid={`animal-card-${props.animal.id}`}>
      <h1 data-testid={`animal-name-${props.animal.id}`}>
        {props.animal.name}
      </h1>
      <p data-testid={`animal-type-${props.animal.id}`}>{props.animal.type}</p>
      <button onClick={() => props.onFeed(props.animal.id)}>Feed</button>
      <button onClick={() => props.onPlay(props.animal.id)}>Play</button>
      <button onClick={() => props.onRest(props.animal.id)}>Rest</button>
      <input
        type="text"
        defaultValue={props.animal.name}
        aria-label={`edit-name-${props.animal.id}`}
        onBlur={(e) => props.onNameChange(props.animal.id, e.target.value)}
      />
    </div>
  );
};

let animalSpy: ReturnType<typeof spyOn>;

describe("<App />", () => {
  beforeEach(() => {
    animalSpy = spyOn(AnimalComponentModule, "default").mockImplementation(
      mockAnimalRenderImplementation
    );
    animalComponentCallTracker.mockClear();
    Math.random = originalMathRandom;
  });

  afterEach(() => {
    if (animalSpy) {
      animalSpy.mockRestore();
    }
    Math.random = originalMathRandom;
    cleanup();
  });

  const getAnimalPropsById = (id: string) => {
    const callsForId = animalComponentCallTracker.mock.calls.filter(
      (c) => c[0].animal.id === id
    );
    return callsForId.length > 0 ? callsForId[callsForId.length - 1][0] : null;
  };

  const addSpecificAnimalViaUI = (
    animalType: AnimalType,
    name?: string
  ): string => {
    const addButton = screen.getByRole("button", { name: /add new animal/i });
    act(() => {
      fireEvent.click(addButton);
    });

    const modal = screen.getByRole("dialog");
    // @ts-expect-error This assertion works at runtime with bun test due to happydom.setup.ts
    expect(modal).toBeInTheDocument();

    const nameInput = screen.getByLabelText("Name:");
    const speciesSelect = screen.getByLabelText("Species:");
    const submitButtonModal = screen.getByRole("button", { name: "Submit" });
    const animalNameForModal = name || `Test ${animalType}`;
    act(() => {
      fireEvent.change(nameInput, { target: { value: animalNameForModal } });
      fireEvent.change(speciesSelect, { target: { value: animalType } });
      fireEvent.click(submitButtonModal);
    });
    act(() => {
      global.clock.tick(1);
    });
    const calls = animalComponentCallTracker.mock.calls;
    if (calls.length === 0)
      throw new Error("Animal component was not called after modal submission");
    const lastCallArgs = calls[calls.length - 1][0] as MockAnimalProps;
    return lastCallArgs.animal.id;
  };

  test("should render with no animals initially", () => {
    render(<App />);
    expect(animalComponentCallTracker).toHaveBeenCalledTimes(0);
    const animalGrid = screen.getByRole("main", { name: "" });
    expect(animalGrid.children.length).toBe(0);
  });

  test("clicking 'Add New Animal' (and simulating modal submission) adds one new animal", () => {
    render(<App />);
    expect(animalComponentCallTracker).toHaveBeenCalledTimes(0);

    const appHeaderAddButton = screen.getByRole("button", {
      name: /add new animal/i,
    });
    act(() => {
      fireEvent.click(appHeaderAddButton);
    });

    const modalNameInput = screen.getByLabelText("Name:");
    const modalSpeciesSelect = screen.getByLabelText("Species:");
    const modalSubmitButton = screen.getByRole("button", { name: "Submit" });

    const testName = "Mittens";
    const testType = AnimalType.CalicoCat;

    act(() => {
      fireEvent.change(modalNameInput, { target: { value: testName } });
      fireEvent.change(modalSpeciesSelect, { target: { value: testType } });
      fireEvent.click(modalSubmitButton);
    });

    expect(animalComponentCallTracker).toHaveBeenCalledTimes(1);

    const newAnimalCall = animalComponentCallTracker.mock.calls[0];
    expect(newAnimalCall![0].animal as AnimalState).toBeDefined();
    const newAnimalData = newAnimalCall![0].animal as AnimalState;

    expect(newAnimalData.id).toEqual(expect.stringMatching(/^animal-/));
    expect(newAnimalData.name).toBe(testName);
    expect(newAnimalData.type).toBe(testType);
    expect(newAnimalData.hunger).toBe(DEFAULT_METRIC_VALUE);
    expect(newAnimalData.happiness).toBe(DEFAULT_METRIC_VALUE);
    expect(newAnimalData.sleepiness).toBe(DEFAULT_METRIC_VALUE);
  });

  describe("Animal Interactions via mocked Animal component", () => {
    let testAnimalId: string;
    const testAnimalType = AnimalType.Poodle;

    beforeEach(() => {
      render(<App />);
      testAnimalId = addSpecificAnimalViaUI(testAnimalType, "Test Poodle");
      expect(animalComponentCallTracker).toHaveBeenCalled();
      const animalProps = getAnimalPropsById(testAnimalId);
      expect(animalProps).not.toBeNull();
      expect(animalProps!.animal.name).toBe("Test Poodle");
    });

    test("feeding an animal updates its hunger", () => {
      const feedButton = screen.getByRole("button", { name: "Feed" });
      act(() => {
        feedButton.click();
      });
      act(() => {
        global.clock.tick(1);
      });
      const animalProps = getAnimalPropsById(testAnimalId);
      const config = animalConfigs[testAnimalType];
      expect(animalProps!.animal.hunger).toBe(
        DEFAULT_METRIC_VALUE - config.feedAmount
      );
    });

    test("playing with an animal updates its happiness", () => {
      const playButton = screen.getByRole("button", { name: "Play" });
      act(() => {
        playButton.click();
      });
      act(() => {
        global.clock.tick(1);
      });
      const animalProps = getAnimalPropsById(testAnimalId);
      const config = animalConfigs[testAnimalType];
      expect(animalProps!.animal.happiness).toBe(
        DEFAULT_METRIC_VALUE + config.playAmount
      );
    });

    test("resting an animal updates its sleepiness", () => {
      const restButton = screen.getByRole("button", { name: "Rest" });
      act(() => {
        restButton.click();
      });
      act(() => {
        global.clock.tick(1);
      });
      const animalProps = getAnimalPropsById(testAnimalId);
      const config = animalConfigs[testAnimalType];
      expect(animalProps!.animal.sleepiness).toBe(
        DEFAULT_METRIC_VALUE - config.restAmount
      );
    });

    test("changing an animal's name updates its name", () => {
      const newName = "Poodleson The Great";
      const nameInput = screen.getByLabelText(`edit-name-${testAnimalId}`);
      act(() => {
        fireEvent.change(nameInput, { target: { value: newName } });
        fireEvent.blur(nameInput);
      });
      act(() => {
        global.clock.tick(1);
      });
      const animalProps = getAnimalPropsById(testAnimalId);
      expect(animalProps!.animal.name).toBe(newName);
    });

    test("metrics do not go below 0 or above 100", () => {
      const feedButton = screen.getByRole("button", { name: "Feed" });
      const playButton = screen.getByRole("button", { name: "Play" });
      const restButton = screen.getByRole("button", { name: "Rest" });

      for (let i = 0; i < 15; i++) {
        act(() => {
          feedButton.click();
        });
      }
      act(() => {
        global.clock.tick(1);
      });
      let animalProps = getAnimalPropsById(testAnimalId);
      expect(animalProps!.animal.hunger).toBe(0);

      for (let i = 0; i < 15; i++) {
        act(() => {
          playButton.click();
        });
      }
      act(() => {
        global.clock.tick(1);
      });
      animalProps = getAnimalPropsById(testAnimalId);
      expect(animalProps!.animal.happiness).toBe(100);

      for (let i = 0; i < 15; i++) {
        act(() => {
          restButton.click();
        });
      }
      act(() => {
        global.clock.tick(1);
      });
      animalProps = getAnimalPropsById(testAnimalId);
      expect(animalProps!.animal.sleepiness).toBe(0);
    });
  });

  describe("Animal Interactions and Time Effects through App", () => {
    beforeEach(() => {
      render(<App />);
    });

    test("metrics update over time", () => {
      const animalName = "Timer Dog";
      const animalType = AnimalType.Poodle;
      const animalId = addSpecificAnimalViaUI(animalType, animalName);

      let currentProps = getAnimalPropsById(animalId);
      expect(currentProps!.animal.hunger).toBe(DEFAULT_METRIC_VALUE);
      const config = animalConfigs[animalType];

      act(() => {
        global.clock.tick(METRIC_UPDATE_INTERVAL);
      });
      currentProps = getAnimalPropsById(animalId);
      expect(currentProps!.animal.hunger).toBe(
        DEFAULT_METRIC_VALUE + config.baseHungerIncreaseRate
      );

      act(() => {
        global.clock.tick(METRIC_UPDATE_INTERVAL);
      });
      currentProps = getAnimalPropsById(animalId);
      expect(currentProps!.animal.hunger).toBe(
        DEFAULT_METRIC_VALUE + 2 * config.baseHungerIncreaseRate
      );
    });

    test("changing an animal's name updates it", () => {
      const animalName = "Timer Dog";
      const animalType = AnimalType.Poodle;
      const animalId = addSpecificAnimalViaUI(animalType, animalName);

      let currentProps = getAnimalPropsById(animalId);
      expect(currentProps!.animal.name).toBe(animalName);

      const newName = "Updated Timer Dog";
      const nameInput = screen.getByLabelText(`edit-name-${animalId}`);
      act(() => {
        fireEvent.change(nameInput, { target: { value: newName } });
        fireEvent.blur(nameInput);
      });
      act(() => {
        global.clock.tick(1);
      });
      currentProps = getAnimalPropsById(animalId);
      expect(currentProps!.animal.name).toBe(newName);
    });

    test("metrics update over time", () => {
      const animalId = addSpecificAnimalViaUI(
        AnimalType.Chameleon,
        "Timer Chameleon"
      );
      const initialProps = getAnimalPropsById(animalId);
      expect(initialProps!.animal.hunger).toBe(DEFAULT_METRIC_VALUE);

      act(() => {
        global.clock.tick(METRIC_UPDATE_INTERVAL);
      });

      const propsAfterOneInterval = getAnimalPropsById(animalId);
      const chameleonConfig = animalConfigs[AnimalType.Chameleon];
      expect(propsAfterOneInterval!.animal.hunger).toBe(
        DEFAULT_METRIC_VALUE + chameleonConfig.baseHungerIncreaseRate
      );
      expect(propsAfterOneInterval!.animal.happiness).toBe(
        DEFAULT_METRIC_VALUE - chameleonConfig.baseHappinessDecayRate
      );
      expect(propsAfterOneInterval!.animal.sleepiness).toBe(
        DEFAULT_METRIC_VALUE + chameleonConfig.baseSleepinessIncreaseRate
      );

      act(() => {
        global.clock.tick(METRIC_UPDATE_INTERVAL);
      });

      const propsAfterTwoIntervals = getAnimalPropsById(animalId);
      expect(propsAfterTwoIntervals!.animal.hunger).toBe(
        DEFAULT_METRIC_VALUE + 2 * chameleonConfig.baseHungerIncreaseRate
      );
    });
  });
});
