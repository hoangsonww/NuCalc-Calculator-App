/** Type declaration for a calculator operation. */
export interface CalculatorOperation {
  symbol: string;
  operator: (operand: number) => number;
}

export enum SupportedOperation {
  Add,
  Subtract,
  Multiply,
  Divide,
}
