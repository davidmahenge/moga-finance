import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast, isToday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("sw-TZ", {
    style: "currency",
    currency: "TZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("TZS", "TSH");
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy, HH:mm");
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(date: Date | string): boolean {
  const d = new Date(date);
  return isPast(d) && !isToday(d);
}

export async function generateLoanNumber(prisma: {
  loan: { count: () => Promise<number> };
}): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.loan.count();
  return `LN-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function generateReceiptNumber(prisma: {
  payment: { count: () => Promise<number> };
}): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.payment.count();
  return `RCP-${year}-${String(count + 1).padStart(4, "0")}`;
}

export const LOAN_STATUSES = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "ACTIVE",
  "CLOSED",
  "REJECTED",
  "DEFAULTED",
] as const;

export type LoanStatus = (typeof LOAN_STATUSES)[number];

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  APPROVED: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  CLOSED: "bg-slate-100 text-slate-700",
  REJECTED: "bg-red-100 text-red-700",
  DEFAULTED: "bg-red-900 text-red-100",
  OVERDUE: "bg-orange-100 text-orange-700",
  VERIFIED: "bg-green-100 text-green-700",
  PENDING_DOC: "bg-gray-100 text-gray-700",
};

export const EMPLOYMENT_STATUSES = [
  { value: "EMPLOYED", label: "Employed" },
  { value: "SELF_EMPLOYED", label: "Self Employed" },
  { value: "UNEMPLOYED", label: "Unemployed" },
  { value: "RETIRED", label: "Retired" },
];

export const DOCUMENT_TYPES = [
  { value: "NATIONAL_ID", label: "National ID" },
  { value: "PROOF_OF_INCOME", label: "Proof of Income" },
  { value: "BANK_STATEMENT", label: "Bank Statement" },
  { value: "EMPLOYMENT_LETTER", label: "Employment Letter" },
  { value: "UTILITY_BILL", label: "Utility Bill" },
  { value: "COLLATERAL_PHOTO", label: "Collateral Photo" },
  { value: "OTHER", label: "Other" },
];

export const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "MOBILE_MONEY", label: "Mobile Money (M-Pesa)" },
  { value: "CHEQUE", label: "Cheque" },
];

export const COLLATERAL_TYPES = [
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "VEHICLE", label: "Vehicle" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "SAVINGS", label: "Savings / Fixed Deposit" },
  { value: "OTHER", label: "Other" },
];
