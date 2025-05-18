import "@testing-library/jest-dom";
import Animal from "./Animal";

import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { AnimalState, AnimalType } from "../types";

describe("Animal Component", () => {
  const mockAnimal: AnimalState = {
    id: "1",
    name: "Buddy",
    type: AnimalType.Poodle,
    hunger: 50,
    happiness: 70,
    sleepiness: 30,
  };

  const mockOnNameChange = jest.fn();
  const mockOnFeed = jest.fn();
  const mockOnPlay = jest.fn();
  const mockOnRest = jest.fn();

  beforeEach(() => {
    mockOnNameChange.mockClear();
    mockOnFeed.mockClear();
    mockOnPlay.mockClear();
    mockOnRest.mockClear();
  });

  afterEach(cleanup);

  const getMeterFill = (labelText: string): HTMLElement => {
    const statElement = screen.getByText(labelText).closest(".stat");
    if (!statElement)
      throw new Error(`Could not find stat container for ${labelText}`);
    const meterFill = statElement.querySelector(".meter-fill");
    if (!meterFill)
      throw new Error(`Could not find meter-fill for ${labelText}`);
    return meterFill as HTMLElement;
  };

  test("renders animal information correctly", () => {
    render(
      <Animal
        animal={mockAnimal}
        onNameChange={mockOnNameChange}
        onFeed={mockOnFeed}
        onPlay={mockOnPlay}
        onRest={mockOnRest}
      />
    );

    expect(screen.getByText(/Name:\s?/)).toBeInTheDocument();
    expect(screen.getByText("Buddy")).toBeInTheDocument();
    expect(screen.getByText("Species:")).toBeInTheDocument();
    expect(screen.getByText(AnimalType.Poodle)).toBeInTheDocument();

    expect(screen.getByText("Hunger:")).toBeInTheDocument();
    const hungerMeter = getMeterFill("Hunger:");
    expect(hungerMeter).toHaveStyle("width: 50%");

    expect(screen.getByText("Happiness:")).toBeInTheDocument();
    const happinessMeter = getMeterFill("Happiness:");
    expect(happinessMeter).toHaveStyle("width: 70%");

    expect(screen.getByText("Sleep:")).toBeInTheDocument();
    const sleepinessMeter = getMeterFill("Sleep:");
    expect(sleepinessMeter).toHaveStyle("width: 30%");

    const image = screen.getByAltText(
      `Your ${AnimalType.Poodle}`
    ) as HTMLImageElement;
    expect(image).toBeInTheDocument();
    expect(image.src).toContain("src/assets/avatars/poodle.svg");
  });

  test("allows editing animal name and calls onNameChange on Enter", () => {
    render(
      <Animal
        animal={mockAnimal}
        onNameChange={mockOnNameChange}
        onFeed={mockOnFeed}
        onPlay={mockOnPlay}
        onRest={mockOnRest}
      />
    );

    const nameDisplay = screen.getByText("Buddy");
    fireEvent.focus(nameDisplay);
    nameDisplay.textContent = "Charlie";
    fireEvent.keyDown(nameDisplay, { key: "Enter", code: "Enter" });

    expect(mockOnNameChange).toHaveBeenCalledWith("1", "Charlie");
    expect(nameDisplay.textContent).toBe("Charlie");
  });

  test("allows editing animal name and calls onNameChange on blur", () => {
    render(
      <Animal
        animal={mockAnimal}
        onNameChange={mockOnNameChange}
        onFeed={mockOnFeed}
        onPlay={mockOnPlay}
        onRest={mockOnRest}
      />
    );

    const nameDisplay = screen.getByText("Buddy");
    fireEvent.focus(nameDisplay);
    nameDisplay.textContent = "Lucy";
    fireEvent.blur(nameDisplay);

    expect(mockOnNameChange).toHaveBeenCalledWith("1", "Lucy");
  });

  test("reverts name change on Escape key", () => {
    render(
      <Animal
        animal={mockAnimal}
        onNameChange={mockOnNameChange}
        onFeed={mockOnFeed}
        onPlay={mockOnPlay}
        onRest={mockOnRest}
      />
    );

    const nameDisplay = screen.getByText("Buddy");
    fireEvent.focus(nameDisplay);
    nameDisplay.textContent = "Max"; // Simulate typing a new name
    fireEvent.keyDown(nameDisplay, { key: "Escape", code: "Escape" });

    expect(nameDisplay.textContent).toBe("Buddy");
    expect(mockOnNameChange).not.toHaveBeenCalled();
  });

  test("calls onFeed when Feed button is clicked", () => {
    render(
      <Animal
        animal={mockAnimal}
        onNameChange={mockOnNameChange}
        onFeed={mockOnFeed}
        onPlay={mockOnPlay}
        onRest={mockOnRest}
      />
    );
    fireEvent.click(screen.getByText("Feed"));
    expect(mockOnFeed).toHaveBeenCalledWith("1");
  });

  test("calls onPlay when Play button is clicked", () => {
    render(
      <Animal
        animal={mockAnimal}
        onNameChange={mockOnNameChange}
        onFeed={mockOnFeed}
        onPlay={mockOnPlay}
        onRest={mockOnRest}
      />
    );
    fireEvent.click(screen.getByText("Play"));
    expect(mockOnPlay).toHaveBeenCalledWith("1");
  });

  test("calls onRest when Rest button is clicked", () => {
    render(
      <Animal
        animal={mockAnimal}
        onNameChange={mockOnNameChange}
        onFeed={mockOnFeed}
        onPlay={mockOnPlay}
        onRest={mockOnRest}
      />
    );
    fireEvent.click(screen.getByText("Rest"));
    expect(mockOnRest).toHaveBeenCalledWith("1");
  });

  test("updates displayed name when animal.name prop changes", () => {
    const { rerender } = render(
      <Animal
        animal={mockAnimal}
        onNameChange={mockOnNameChange}
        onFeed={mockOnFeed}
        onPlay={mockOnPlay}
        onRest={mockOnRest}
      />
    );
    expect(screen.getByText("Buddy")).toBeInTheDocument();

    const updatedAnimal = { ...mockAnimal, name: "Daisy" };
    rerender(
      <Animal
        animal={updatedAnimal}
        onNameChange={mockOnNameChange}
        onFeed={mockOnFeed}
        onPlay={mockOnPlay}
        onRest={mockOnRest}
      />
    );
    expect(screen.getByText("Daisy")).toBeInTheDocument();
    expect(screen.queryByText("Buddy")).not.toBeInTheDocument();
  });
});

