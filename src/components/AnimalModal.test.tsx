import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AnimalModal from "./AnimalModal";
import { AnimalType } from "../types";

const mockOnClose = jest.fn();
const mockOnSubmit = jest.fn();

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  onSubmit: mockOnSubmit,
};

describe("AnimalModal Component", () => {
  let unmount: () => void;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (unmount) {
      unmount();
    }
    // @ts-expect-error: unmount is intentionally reassigned for test cleanup
    unmount = undefined;
  });

  test("renders nothing when isOpen is false", () => {
    const { unmount: localUnmount } = render(
      <AnimalModal {...defaultProps} isOpen={false} />
    );
    unmount = localUnmount;
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("renders the modal with all elements when isOpen is true", () => {
    const { unmount: localUnmount } = render(<AnimalModal {...defaultProps} />);
    unmount = localUnmount;

    expect(
      screen.getByRole("dialog", { name: "Add New Animal" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name:")).toBeInTheDocument();
    expect(screen.getByLabelText("Species:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();

    const speciesSelect = screen.getByLabelText(
      "Species:"
    ) as HTMLSelectElement;
    expect(speciesSelect.value).toBe(AnimalType.Poodle);
  });

  test("allows typing in the name input", () => {
    const { unmount: localUnmount } = render(<AnimalModal {...defaultProps} />);
    unmount = localUnmount;
    const nameInput = screen.getByLabelText("Name:") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Fluffy" } });
    expect(nameInput.value).toBe("Fluffy");
  });

  test("allows selecting a species", () => {
    const { unmount: localUnmount } = render(<AnimalModal {...defaultProps} />);
    unmount = localUnmount;
    const speciesSelect = screen.getByLabelText(
      "Species:"
    ) as HTMLSelectElement;
    fireEvent.change(speciesSelect, {
      target: { value: AnimalType.Chameleon },
    });
    expect(speciesSelect.value).toBe(AnimalType.Chameleon);
  });

  describe("Validation", () => {
    test("shows error and does not submit if name is empty", () => {
      const { unmount: localUnmount } = render(
        <AnimalModal {...defaultProps} />
      );
      unmount = localUnmount;
      const nameInput = screen.getByLabelText("Name:") as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: "  " } });
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));

      expect(screen.getByText("Name cannot be empty.")).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    test("clears error when user starts typing after an error", () => {
      const { unmount: localUnmount } = render(
        <AnimalModal {...defaultProps} />
      );
      unmount = localUnmount;
      const nameInput = screen.getByLabelText("Name:") as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: "  " } });
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
      expect(screen.getByText("Name cannot be empty.")).toBeInTheDocument();

      fireEvent.change(nameInput, { target: { value: "F" } });
      expect(
        screen.queryByText("Name cannot be empty.")
      ).not.toBeInTheDocument();
    });

    test("shows error and does not submit if name is too long (over 17 chars)", () => {
      const { unmount: localUnmount } = render(
        <AnimalModal {...defaultProps} />
      );
      unmount = localUnmount;
      const longName = "a".repeat(18);
      const nameInput = screen.getByLabelText("Name:") as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: longName } });
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));

      expect(
        screen.getByText("Name cannot exceed 17 characters.")
      ).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Submission", () => {
    test("calls onSubmit with trimmed name and selected type, then closes and resets", () => {
      const { unmount: localUnmount } = render(
        <AnimalModal {...defaultProps} />
      );
      unmount = localUnmount;
      const nameInput = screen.getByLabelText("Name:") as HTMLInputElement;
      const speciesSelect = screen.getByLabelText(
        "Species:"
      ) as HTMLSelectElement;

      fireEvent.change(nameInput, { target: { value: "  Rex  " } });
      fireEvent.change(speciesSelect, {
        target: { value: AnimalType.CalicoCat },
      });
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith("Rex", AnimalType.CalicoCat);
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      expect(nameInput.value).toBe("");
      expect(speciesSelect.value).toBe(AnimalType.Poodle);
    });
  });

  describe("Cancellation", () => {
    test("calls onClose and resets fields when cancel button is clicked", () => {
      const { unmount: localUnmount } = render(
        <AnimalModal {...defaultProps} />
      );
      unmount = localUnmount;
      const nameInput = screen.getByLabelText("Name:") as HTMLInputElement;
      const speciesSelect = screen.getByLabelText(
        "Species:"
      ) as HTMLSelectElement;

      fireEvent.change(nameInput, { target: { value: "Temporary" } });
      fireEvent.change(speciesSelect, {
        target: { value: AnimalType.Chameleon },
      });

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).not.toHaveBeenCalled();

      expect(nameInput.value).toBe("");
      expect(speciesSelect.value).toBe(AnimalType.Poodle);
    });
  });

  test("error message is linked to input via aria-describedby", () => {
    const { unmount: localUnmount } = render(<AnimalModal {...defaultProps} />);
    unmount = localUnmount;
    const nameInput = screen.getByLabelText("Name:");
    fireEvent.change(nameInput, { target: { value: " " } });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    const errorMessage = screen.getByText("Name cannot be empty.");

    expect(nameInput).toHaveAttribute("aria-describedby", "nameError");
    expect(errorMessage.id).toBe("nameError");
  });
});
