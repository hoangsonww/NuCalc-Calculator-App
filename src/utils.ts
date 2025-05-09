/**
 * Converts display text to a number by removing commas and parsing it.
 * @param {string} s - The text from the display.
 * @returns {number} The parsed number.
 */
export const displayTextToNumber = (s: string): number => {
  return parseFloat(s.replace(",", ""));
};

/**
 * Formats a number as display text with commas and up to 10 fractional digits.
 * @param {number} n - The number to format.
 * @returns {string} The formatted display text.
 */
export const numberToDisplayText = (n: number): string => {
  if (Number.isInteger(n)) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 10,
  }).format(n);
};

/**
 * Reformats display text by converting it to a number and back to display text.
 * @param {string} s - The display text to reformat.
 * @returns {string} The reformatted display text.
 */
export const reformatDisplayText = (s: string): string => {
  return numberToDisplayText(displayTextToNumber(s));
};
