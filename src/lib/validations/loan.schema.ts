import { z } from "zod";

export const loanSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  principalAmount: z.number().min(100000, "Minimum loan amount is TSH 100,000"),
  interestRate: z.number().min(0.1).max(100, "Invalid interest rate"),
  termMonths: z.number().min(1).max(360, "Term must be between 1-360 months"),
  purpose: z.string().min(10, "Please describe the loan purpose"),
  notes: z.string().optional(),
});

export type LoanFormData = z.infer<typeof loanSchema>;

export const loanStatusSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "APPROVED", "REJECTED", "ACTIVE", "CLOSED", "DEFAULTED"]),
  rejectionReason: z.string().optional(),
  approvedBy: z.string().optional(),
  disbursementDate: z.string().optional(),
});
