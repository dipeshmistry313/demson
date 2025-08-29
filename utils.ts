/**
 * Formats a number into the Indian Rupee (INR) currency format.
 * - Uses the 'en-IN' locale for Indian numbering system (lakhs, crores).
 * - Displays the '₹' currency symbol.
 * - Removes decimal places for a cleaner look.
 * @param value The number to format.
 * @returns A formatted currency string (e.g., "₹1,00,000").
 */
export const formatCurrencyINR = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);
};
