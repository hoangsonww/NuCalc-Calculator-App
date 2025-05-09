import { Calculator } from "./calculator";
import { SupportedOperation } from "./operation";

const calculator = new Calculator();

/**
 * Updates the calculator’s display elements to reflect the current state.
 * @returns {void}
 */
const updateDisplay = (): void => {
  const display = document.getElementById("display")!;
  display.textContent = calculator.display;

  const previousValueDisplay = document.getElementById("previous-value")!;
  previousValueDisplay.textContent = calculator.previousSolution ?? "";

  const activeOperationDisplay = document.getElementById("active-operation")!;
  activeOperationDisplay.textContent =
    calculator.selectedOperation?.symbol ?? "";
};

const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."];

for (let digit of digits) {
  const button = document.getElementById(`${digit}-button`)!;
  button.addEventListener("click", () => {
    calculator.addDigit(digit);
    updateDisplay();
  });
}

document.addEventListener("keydown", (event) => {
  const digit = event.key;
  if (digits.includes(digit)) {
    calculator.addDigit(digit);
    updateDisplay();
  }
});

const addButton = document.getElementById("add-button")!;
addButton.addEventListener("click", () => {
  calculator.selectOperation(SupportedOperation.Add);
  updateDisplay();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "+") {
    calculator.selectOperation(SupportedOperation.Add);
    updateDisplay();
  }
});

const subtractButton = document.getElementById("subtract-button")!;
subtractButton.addEventListener("click", () => {
  calculator.selectOperation(SupportedOperation.Subtract);
  updateDisplay();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "-") {
    calculator.selectOperation(SupportedOperation.Subtract);
    updateDisplay();
  }
});

const multiplyButton = document.getElementById("multiply-button")!;
multiplyButton.addEventListener("click", () => {
  calculator.selectOperation(SupportedOperation.Multiply);
  updateDisplay();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "*") {
    calculator.selectOperation(SupportedOperation.Multiply);
    updateDisplay();
  }
});

const divideButton = document.getElementById("divide-button")!;
divideButton.addEventListener("click", () => {
  calculator.selectOperation(SupportedOperation.Divide);
  updateDisplay();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/") {
    calculator.selectOperation(SupportedOperation.Divide);
    updateDisplay();
  }
});

const signButton = document.getElementById("sign-button")!;
signButton.addEventListener("click", () => {
  calculator.toggleSign();
  updateDisplay();
});

const equalsButton = document.getElementById("equals-button")!;
equalsButton.addEventListener("click", () => {
  calculator.calculate();
  updateDisplay();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "=" || event.key === "Enter") {
    calculator.calculate();
    updateDisplay();
  }
});

const clearButton = document.getElementById("clear-button")!;
clearButton.addEventListener("click", () => {
  calculator.clear();
  updateDisplay();
});

const backspaceButton = document.getElementById("backspace-button")!;
backspaceButton.addEventListener("click", () => {
  calculator.backspace();
  updateDisplay();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Backspace") {
    calculator.backspace();
    updateDisplay();
  }
});
