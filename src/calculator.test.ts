import { describe, it, expect, beforeEach } from "vitest";
import { Calculator } from "./calculator";
import { SupportedOperation } from "./operation";

describe("Calculator", () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe("Initial State", () => {
    it("should initialize with display showing 0", () => {
      expect(calculator.display).toBe("0");
    });

    it("should initialize with no previous solution", () => {
      expect(calculator.previousSolution).toBeNull();
    });

    it("should initialize with no selected operation", () => {
      expect(calculator.selectedOperation).toBeNull();
    });

    it("should initialize with no error", () => {
      expect(calculator.getError()).toBeNull();
      expect(calculator.hasError()).toBe(false);
    });
  });

  describe("addDigit", () => {
    it("should add a digit to the display", () => {
      calculator.addDigit("5");
      expect(calculator.display).toBe("5");
    });

    it("should replace leading zero with digit", () => {
      calculator.addDigit("5");
      expect(calculator.display).toBe("5");
    });

    it("should append multiple digits", () => {
      calculator.addDigit("1");
      calculator.addDigit("2");
      calculator.addDigit("3");
      expect(calculator.display).toBe("123");
    });

    it("should allow decimal point", () => {
      calculator.addDigit("1");
      calculator.addDigit(".");
      calculator.addDigit("5");
      expect(calculator.display).toBe("1.5");
    });

    it("should prevent multiple decimal points", () => {
      calculator.addDigit("1");
      calculator.addDigit(".");
      calculator.addDigit("5");
      calculator.addDigit(".");
      calculator.addDigit("3");
      expect(calculator.display).toBe("1.53");
    });

    it("should handle leading decimal point", () => {
      calculator.addDigit(".");
      calculator.addDigit("5");
      expect(calculator.display).toBe("0.5");
    });

    it("should format numbers with commas", () => {
      calculator.addDigit("1");
      calculator.addDigit("2");
      calculator.addDigit("3");
      calculator.addDigit("4");
      calculator.addDigit("5");
      expect(calculator.display).toBe("12,345");
    });

    it("should reject invalid input", () => {
      calculator.addDigit("a");
      expect(calculator.hasError()).toBe(true);
      expect(calculator.getError()).toBe("Invalid input");
    });

    it("should prevent exceeding maximum digits", () => {
      for (let i = 0; i < 20; i++) {
        calculator.addDigit("9");
      }
      expect(calculator.hasError()).toBe(true);
      expect(calculator.getError()).toBe("Max digits reached");
    });

    it("should clear error when adding valid digit", () => {
      calculator.addDigit("a"); // Trigger error
      expect(calculator.hasError()).toBe(true);
      calculator.addDigit("5"); // Should clear error
      expect(calculator.hasError()).toBe(false);
      expect(calculator.display).toBe("5");
    });
  });

  describe("selectOperation", () => {
    it("should select addition operation", () => {
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Add);
      expect(calculator.selectedOperation).not.toBeNull();
      expect(calculator.selectedOperation?.symbol).toBe("+");
      expect(calculator.previousSolution).toBe("5");
      expect(calculator.display).toBe("0");
    });

    it("should select subtraction operation", () => {
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Subtract);
      expect(calculator.selectedOperation?.symbol).toBe("-");
    });

    it("should select multiplication operation", () => {
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Multiply);
      expect(calculator.selectedOperation?.symbol).toBe("*");
    });

    it("should select division operation", () => {
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Divide);
      expect(calculator.selectedOperation?.symbol).toBe("/");
    });

    it("should chain operations automatically", () => {
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Add);
      calculator.addDigit("3");
      calculator.selectOperation(SupportedOperation.Multiply);
      expect(calculator.display).toBe("0");
      expect(calculator.previousSolution).toBe("8");
    });
  });

  describe("calculate - Basic Operations", () => {
    it("should add two numbers", () => {
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Add);
      calculator.addDigit("3");
      calculator.calculate();
      expect(calculator.display).toBe("8");
    });

    it("should subtract two numbers", () => {
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Subtract);
      calculator.addDigit("3");
      calculator.calculate();
      expect(calculator.display).toBe("2");
    });

    it("should multiply two numbers", () => {
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Multiply);
      calculator.addDigit("3");
      calculator.calculate();
      expect(calculator.display).toBe("15");
    });

    it("should divide two numbers", () => {
      calculator.addDigit("6");
      calculator.selectOperation(SupportedOperation.Divide);
      calculator.addDigit("2");
      calculator.calculate();
      expect(calculator.display).toBe("3");
    });

    it("should handle decimal results", () => {
      calculator.addDigit("7");
      calculator.selectOperation(SupportedOperation.Divide);
      calculator.addDigit("2");
      calculator.calculate();
      expect(calculator.display).toBe("3.5");
    });

    it("should do nothing when no operation is selected", () => {
      calculator.addDigit("5");
      calculator.calculate();
      expect(calculator.display).toBe("5");
    });

    it("should clear operation state after calculation", () => {
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Add);
      calculator.addDigit("3");
      calculator.calculate();
      expect(calculator.selectedOperation).toBeNull();
      expect(calculator.previousSolution).toBeNull();
    });
  });

  describe("calculate - Error Handling", () => {
    it("should handle division by zero", () => {
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Divide);
      calculator.addDigit("0");
      calculator.calculate();
      expect(calculator.hasError()).toBe(true);
      expect(calculator.getError()).toBe("Cannot divide by zero");
      expect(calculator.display).toBe("Error");
    });

    it("should handle overflow", () => {
      // Create a very large number
      const largeNum = Number.MAX_SAFE_INTEGER.toString();
      for (const digit of largeNum) {
        calculator.addDigit(digit);
      }
      calculator.selectOperation(SupportedOperation.Multiply);
      calculator.addDigit("2");
      calculator.calculate();
      expect(calculator.hasError()).toBe(true);
    });

    it("should validate invalid operands", () => {
      calculator.display = "invalid";
      calculator.selectOperation(SupportedOperation.Add);
      calculator.calculate();
      expect(calculator.hasError()).toBe(true);
    });
  });

  describe("toggleSign", () => {
    it("should toggle positive to negative", () => {
      calculator.addDigit("5");
      calculator.toggleSign();
      expect(calculator.display).toBe("-5");
    });

    it("should toggle negative to positive", () => {
      calculator.addDigit("5");
      calculator.toggleSign();
      calculator.toggleSign();
      expect(calculator.display).toBe("5");
    });

    it("should toggle zero", () => {
      calculator.toggleSign();
      expect(calculator.display).toBe("0");
    });

    it("should toggle decimal numbers", () => {
      calculator.addDigit("3");
      calculator.addDigit(".");
      calculator.addDigit("5");
      calculator.toggleSign();
      expect(calculator.display).toBe("-3.5");
    });

    it("should not work in error state", () => {
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Divide);
      calculator.addDigit("0");
      calculator.calculate(); // Trigger error
      calculator.toggleSign();
      expect(calculator.hasError()).toBe(true);
    });
  });

  describe("clear", () => {
    it("should reset to initial state", () => {
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Add);
      calculator.addDigit("3");
      calculator.clear();
      expect(calculator.display).toBe("0");
      expect(calculator.selectedOperation).toBeNull();
      expect(calculator.previousSolution).toBeNull();
    });

    it("should cancel operation if one is selected", () => {
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Add);
      calculator.clear();
      expect(calculator.display).toBe("5");
      expect(calculator.selectedOperation).toBeNull();
    });

    it("should clear error state", () => {
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Divide);
      calculator.addDigit("0");
      calculator.calculate(); // Trigger error
      calculator.clear();
      expect(calculator.hasError()).toBe(false);
      expect(calculator.display).toBe("0");
    });
  });

  describe("cancelOperation", () => {
    it("should restore previous solution", () => {
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Add);
      calculator.cancelOperation();
      expect(calculator.display).toBe("5");
      expect(calculator.selectedOperation).toBeNull();
    });

    it("should reset to zero if no previous solution", () => {
      calculator.selectOperation(SupportedOperation.Add);
      calculator.cancelOperation();
      expect(calculator.display).toBe("0");
    });
  });

  describe("backspace", () => {
    it("should remove last digit", () => {
      calculator.addDigit("1");
      calculator.addDigit("2");
      calculator.addDigit("3");
      calculator.backspace();
      expect(calculator.display).toBe("12");
    });

    it("should reset to zero when removing last digit", () => {
      calculator.addDigit("5");
      calculator.backspace();
      expect(calculator.display).toBe("0");
    });

    it("should reset to zero when display is empty", () => {
      calculator.display = "";
      calculator.backspace();
      expect(calculator.display).toBe("0");
    });

    it("should reset to zero when only minus sign remains", () => {
      calculator.display = "-";
      calculator.backspace();
      expect(calculator.display).toBe("0");
    });
  });

  describe("Complex Calculations", () => {
    it("should handle chain calculations: 5 + 3 × 2", () => {
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Add);
      calculator.addDigit("3");
      calculator.selectOperation(SupportedOperation.Multiply);
      calculator.addDigit("2");
      calculator.calculate();
      expect(calculator.display).toBe("16");
    });

    it("should handle multiple operations in sequence", () => {
      calculator.addDigit("1");
      calculator.addDigit("0");
      calculator.selectOperation(SupportedOperation.Subtract);
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Multiply);
      calculator.addDigit("2");
      calculator.selectOperation(SupportedOperation.Add);
      calculator.addDigit("3");
      calculator.calculate();
      expect(calculator.display).toBe("13");
    });

    it("should handle negative number operations", () => {
      calculator.addDigit("5");
      calculator.toggleSign();
      calculator.selectOperation(SupportedOperation.Add);
      calculator.addDigit("3");
      calculator.calculate();
      expect(calculator.display).toBe("-2");
    });

    it("should handle decimal operations", () => {
      calculator.addDigit("1");
      calculator.addDigit(".");
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Multiply);
      calculator.addDigit("2");
      calculator.calculate();
      expect(calculator.display).toBe("3");
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero operations", () => {
      calculator.addDigit("0");
      calculator.selectOperation(SupportedOperation.Add);
      calculator.addDigit("0");
      calculator.calculate();
      expect(calculator.display).toBe("0");
    });

    it("should handle very small decimals", () => {
      calculator.addDigit("0");
      calculator.addDigit(".");
      calculator.addDigit("0");
      calculator.addDigit("0");
      calculator.addDigit("1");
      expect(calculator.display).toBe("0.001");
    });

    it("should handle repeated operations", () => {
      calculator.addDigit("5");
      calculator.selectOperation(SupportedOperation.Add);
      calculator.selectOperation(SupportedOperation.Multiply);
      calculator.addDigit("2");
      calculator.calculate();
      expect(calculator.display).toBe("10");
    });
  });
});
