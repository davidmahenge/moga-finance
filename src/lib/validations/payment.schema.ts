import { z } from "zod";

export const paymentSchema = z.object({
  loanId: z.string().min(1, "Loan is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "MOBILE_MONEY", "CHEQUE"]),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
