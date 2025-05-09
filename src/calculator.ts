import { CalculatorOperation, SupportedOperation } from "./operation";
import { reformatDisplayText, numberToDisplayText } from "./utils";

export class Calculator {
  display: string = "0";
  previousSolution: string | null = null;
  selectedOperation: CalculatorOperation | null = null;

  constructor() {}

  /**
   * Adds a digit or decimal point to the current display value.
   * Handles leading zeros, prevents multiple decimals, and reformats as needed.
   * @param {string} digit - The digit or decimal point to append.
   * @returns {void}
   */
  addDigit(digit: string): void {
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
   * @returns {void}
   */
  calculate(): void {
    if (this.selectedOperation === null) {
      return;
    }
    const secondOperand = parseFloat(this.display);
    const result = this.selectedOperation.operator(secondOperand);
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
    const currentValue = parseFloat(this.display);
    const toggledValue = -currentValue;
    this.display = numberToDisplayText(toggledValue);
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
