import { describe, it, expect } from "vitest";
import {
  displayTextToNumber,
  numberToDisplayText,
  reformatDisplayText,
} from "./utils";

describe("Utils", () => {
  describe("displayTextToNumber", () => {
    it("should parse a simple number", () => {
      expect(displayTextToNumber("123")).toBe(123);
    });

    it("should parse a number with comma", () => {
      expect(displayTextToNumber("1,234")).toBe(1234);
    });

    it("should parse a decimal number", () => {
      expect(displayTextToNumber("123.45")).toBe(123.45);
    });

    it("should parse a negative number", () => {
      expect(displayTextToNumber("-123")).toBe(-123);
    });

    it("should parse zero", () => {
      expect(displayTextToNumber("0")).toBe(0);
    });

    it("should parse a number with comma and decimal", () => {
      expect(displayTextToNumber("1,234.56")).toBe(1234.56);
    });
  });

  describe("numberToDisplayText", () => {
    it("should format an integer without decimals", () => {
      expect(numberToDisplayText(123)).toBe("123");
    });

    it("should format a large integer with commas", () => {
      expect(numberToDisplayText(1234)).toBe("1,234");
    });

    it("should format a very large integer with commas", () => {
      expect(numberToDisplayText(1234567)).toBe("1,234,567");
    });

    it("should format zero", () => {
      expect(numberToDisplayText(0)).toBe("0");
    });

    it("should format a negative integer", () => {
      expect(numberToDisplayText(-123)).toBe("-123");
    });

    it("should format a negative large integer with commas", () => {
      expect(numberToDisplayText(-1234567)).toBe("-1,234,567");
    });

    it("should format a decimal number", () => {
      expect(numberToDisplayText(123.45)).toBe("123.45");
    });

    it("should format a decimal number with commas", () => {
      expect(numberToDisplayText(1234.56)).toBe("1,234.56");
    });

    it("should limit decimal places to 10", () => {
      const result = numberToDisplayText(1.123456789012345);
      const decimalPart = result.split(".")[1];
      expect(decimalPart.length).toBeLessThanOrEqual(10);
    });

    it("should format small decimal numbers", () => {
      expect(numberToDisplayText(0.5)).toBe("0.5");
    });

    it("should format very small decimal numbers", () => {
      expect(numberToDisplayText(0.001)).toBe("0.001");
    });

    it("should format negative decimal numbers", () => {
      expect(numberToDisplayText(-123.45)).toBe("-123.45");
    });

    it("should handle numbers close to zero", () => {
      expect(numberToDisplayText(0.0000001)).toBe("0.0000001");
    });
  });

  describe("reformatDisplayText", () => {
    it("should reformat a simple number", () => {
      expect(reformatDisplayText("123")).toBe("123");
    });

    it("should add commas when reformatting", () => {
      expect(reformatDisplayText("1234")).toBe("1,234");
    });

    it("should preserve decimals when reformatting", () => {
      expect(reformatDisplayText("123.45")).toBe("123.45");
    });

    it("should add commas to number with decimal", () => {
      expect(reformatDisplayText("1234.56")).toBe("1,234.56");
    });

    it("should handle zero", () => {
      expect(reformatDisplayText("0")).toBe("0");
    });

    it("should handle negative numbers", () => {
      expect(reformatDisplayText("-1234")).toBe("-1,234");
    });

    it("should remove unnecessary decimals from integers", () => {
      expect(reformatDisplayText("123.00")).toBe("123");
    });

    it("should handle numbers already formatted with commas", () => {
      expect(reformatDisplayText("1,234")).toBe("1,234");
    });
  });

  describe("Edge Cases", () => {
    it("should handle maximum safe integer", () => {
      const max = Number.MAX_SAFE_INTEGER;
      const formatted = numberToDisplayText(max);
      expect(formatted).toContain(",");
      expect(displayTextToNumber(formatted)).toBe(max);
    });

    it("should handle minimum safe integer", () => {
      const min = Number.MIN_SAFE_INTEGER;
      const formatted = numberToDisplayText(min);
      expect(formatted).toContain(",");
      expect(displayTextToNumber(formatted)).toBe(min);
    });

    it("should handle very precise decimals", () => {
      const num = 0.123456789;
      const formatted = numberToDisplayText(num);
      expect(formatted).toBe("0.123456789");
    });

    it("should round-trip conversion correctly", () => {
      const original = 12345.67;
      const formatted = numberToDisplayText(original);
      const parsed = displayTextToNumber(formatted);
      expect(parsed).toBe(original);
    });

    it("should handle infinity", () => {
      const formatted = numberToDisplayText(Infinity);
      expect(formatted).toBe("∞");
    });

    it("should handle negative infinity", () => {
      const formatted = numberToDisplayText(-Infinity);
      expect(formatted).toBe("-∞");
    });

    it("should handle NaN", () => {
      const formatted = numberToDisplayText(NaN);
      expect(formatted).toBe("NaN");
    });
  });
});
