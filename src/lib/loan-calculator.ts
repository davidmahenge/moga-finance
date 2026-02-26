export interface AmortizationRow {
  installmentNo: number;
  dueDate: Date;
  principalDue: number;
  interestDue: number;
  totalDue: number;
  remainingBalance: number;
}

/**
 * Calculate the monthly payment using reducing balance (amortized) method
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / termMonths;
  const payment =
    (principal * r * Math.pow(1 + r, termMonths)) /
    (Math.pow(1 + r, termMonths) - 1);
  return Math.round(payment * 100) / 100;
}

/**
 * Calculate total interest over the loan term
 */
export function calculateTotalInterest(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  const monthly = calculateMonthlyPayment(principal, annualRate, termMonths);
  const total = monthly * termMonths;
  return Math.round((total - principal) * 100) / 100;
}

/**
 * Generate the full amortization schedule for a loan
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate: Date
): AmortizationRow[] {
  const r = annualRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
  const schedule: AmortizationRow[] = [];
  let balance = principal;

  for (let i = 1; i <= termMonths; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    const interestDue = Math.round(balance * r * 100) / 100;
    let principalDue = Math.round((monthlyPayment - interestDue) * 100) / 100;

    // Last payment adjustment to clear balance exactly
    if (i === termMonths) {
      principalDue = Math.round(balance * 100) / 100;
    }

    const totalDue = Math.round((principalDue + interestDue) * 100) / 100;
    balance = Math.round((balance - principalDue) * 100) / 100;
    if (balance < 0) balance = 0;

    schedule.push({
      installmentNo: i,
      dueDate,
      principalDue,
      interestDue,
      totalDue,
      remainingBalance: balance,
    });
  }

  return schedule;
}
