import { CalculatorOperation, SupportedOperation } from "./operation";
import { reformatDisplayText, numberToDisplayText } from "./utils";

export class Calculator {
  display: string = "0";
  previousSolution: string | null = null;
  selectedOperation: CalculatorOperation | null = null;
  error: string | null = null;

  // Constants for validation
  private readonly MAX_DIGITS = 15;
  private readonly MAX_VALUE = Number.MAX_SAFE_INTEGER;
  private readonly MIN_VALUE = Number.MIN_SAFE_INTEGER;

  constructor() {}

  /**
   * Sets an error state and updates the display.
   * @param {string} message - The error message to display.
   * @returns {void}
   */
  private setError(message: string): void {
    this.error = message;
    this.display = "Error";
  }

  /**
   * Clears any error state.
   * @returns {void}
   */
  private clearError(): void {
    if (this.error !== null) {
      this.error = null;
      this.display = "0";
      this.previousSolution = null;
      this.selectedOperation = null;
    }
  }

  /**
   * Checks if a number is valid (not NaN, Infinity, or out of safe range).
   * @param {number} value - The number to validate.
   * @returns {boolean} True if valid, false otherwise.
   */
  private isValidNumber(value: number): boolean {
    return (
      !isNaN(value) &&
      isFinite(value) &&
      value <= this.MAX_VALUE &&
      value >= this.MIN_VALUE
    );
  }

  /**
   * Validates and handles the result of a calculation.
   * Sets an error if the result is invalid.
   * @param {number} result - The calculation result to validate.
   * @returns {boolean} True if valid, false if error was set.
   */
  private validateResult(result: number): boolean {
    if (isNaN(result)) {
      this.setError("Invalid operation");
      return false;
    }
    if (!isFinite(result)) {
      this.setError("Overflow");
      return false;
    }
    if (result > this.MAX_VALUE || result < this.MIN_VALUE) {
      this.setError("Number too large");
      return false;
    }
    return true;
  }

  /**
   * Gets the number of significant digits in the display.
   * @returns {number} The count of significant digits.
   */
  private getDisplayDigitCount(): string {
    return this.display.replace(/[.,\-]/g, "");
  }

  /**
   * Adds a digit or decimal point to the current display value.
   * Handles leading zeros, prevents multiple decimals, and reformats as needed.
   * @param {string} digit - The digit or decimal point to append.
   * @returns {void}
   */
  addDigit(digit: string): void {
    // Clear error state if user starts new input
    this.clearError();

    // Validate input
    if (!/^[\d.]$/.test(digit)) {
      this.setError("Invalid input");
      return;
    }

    // Check maximum digits
    if (
      digit !== "." &&
      this.getDisplayDigitCount().length >= this.MAX_DIGITS
    ) {
      this.setError("Max digits reached");
      return;
    }
    if (this.display === "0" && digit !== ".") {
      this.display = digit;
      return;
    }
    if (digit === "." && this.display.includes(".")) {
      return;
    }
    this.display += digit;
    if (
      this.display.includes(".") &&
      (digit === "." || this.display.endsWith("0"))
    ) {
      return;
    }
    this.display = reformatDisplayText(this.display);
  }

  /**
   * Selects an arithmetic operation, chaining any existing operation first.
   * Stores the selected operation and moves the current display to previousSolution.
   * @param {SupportedOperation} operation - The operation to select.
   * @returns {void}
   */
  selectOperation(operation: SupportedOperation): void {
    if (this.selectedOperation) {
      this.calculate();
    }
    switch (operation) {
      case SupportedOperation.Add:
        this.selectedOperation = {
          symbol: "+",
          operator: (operand: number) => {
            const firstOperand =
              this.previousSolution !== null
                ? parseFloat(this.previousSolution)
                : 0;
            return firstOperand + operand;
          },
        };
        break;
      case SupportedOperation.Subtract:
        this.selectedOperation = {
          symbol: "-",
          operator: (operand: number) => {
            const firstOperand =
              this.previousSolution !== null
                ? parseFloat(this.previousSolution)
                : 0;
            return firstOperand - operand;
          },
        };
        break;
      case SupportedOperation.Multiply:
        this.selectedOperation = {
          symbol: "*",
          operator: (operand: number) => {
            const firstOperand =
              this.previousSolution !== null
                ? parseFloat(this.previousSolution)
                : 0;
            return firstOperand * operand;
          },
        };
        break;
      case SupportedOperation.Divide:
        this.selectedOperation = {
          symbol: "/",
          operator: (operand: number) => {
            const firstOperand =
              this.previousSolution !== null
                ? parseFloat(this.previousSolution)
                : 0;
            return firstOperand / operand;
          },
        };
        break;
      default:
        throw new Error("Unsupported operation");
    }
    this.previousSolution = this.display;
    this.display = "0";
  }

  /**
   * Executes the current arithmetic operation using the display value as the second operand.
   * Updates the display with the result and clears stored state.
   * Handles division by zero and validates results.
   * @returns {void}
   */
  calculate(): void {
    if (this.selectedOperation === null) {
      return;
    }

    const secondOperand = parseFloat(this.display);

    // Check for invalid operand
    if (!this.isValidNumber(secondOperand)) {
      this.setError("Invalid number");
      this.previousSolution = null;
      this.selectedOperation = null;
      return;
    }

    // Check for division by zero
    if (this.selectedOperation.symbol === "/" && secondOperand === 0) {
      this.setError("Cannot divide by zero");
      this.previousSolution = null;
      this.selectedOperation = null;
      return;
    }

    const result = this.selectedOperation.operator(secondOperand);

    // Validate result
    if (!this.validateResult(result)) {
      this.previousSolution = null;
      this.selectedOperation = null;
      return;
    }

    this.display = numberToDisplayText(result);
    this.previousSolution = null;
    this.selectedOperation = null;
  }

  /**
   * Cancels the ongoing operation, reverting the display to the previous solution or zero.
   * Clears stored operation and previous solution.
   * @returns {void}
   */
  cancelOperation(): void {
    this.display = this.previousSolution !== null ? this.previousSolution : "0";
    this.previousSolution = null;
    this.selectedOperation = null;
  }

  /**
   * Clears the calculator state. If an operation is selected, cancels it; otherwise resets everything.
   * @returns {void}
   */
  clear(): void {
    if (this.selectedOperation !== null) {
      this.cancelOperation();
    } else {
      this.display = "0";
      this.previousSolution = null;
      this.selectedOperation = null;
    }
  }

  /**
   * Toggles the sign of the current display value between positive and negative.
   * @returns {void}
   */
  toggleSign(): void {
    // Cannot toggle sign in error state
    if (this.error !== null) {
      return;
    }

    const currentValue = parseFloat(this.display);

    if (!this.isValidNumber(currentValue)) {
      this.setError("Invalid number");
      return;
    }

    const toggledValue = -currentValue;

    if (!this.validateResult(toggledValue)) {
      return;
    }

    this.display = numberToDisplayText(toggledValue);
  }

  /**
   * Gets the current error message, if any.
   * @returns {string | null} The error message or null if no error.
   */
  getError(): string | null {
    return this.error;
  }

  /**
   * Checks if the calculator is in an error state.
   * @returns {boolean} True if there's an error, false otherwise.
   */
  hasError(): boolean {
    return this.error !== null;
  }

  /**
   * Removes the last character from the display. Resets to zero if empty or lone minus sign remains.
   * @returns {void}
   */
  backspace(): void {
    this.display = this.display.slice(0, -1);
    if (this.display === "" || this.display === "-") {
      this.display = "0";
    }
  }
}
