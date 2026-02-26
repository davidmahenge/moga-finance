import { z } from "zod";

export const collateralSchema = z.object({
  loanId: z.string().min(1, "Loan is required"),
  type: z.enum(["REAL_ESTATE", "VEHICLE", "EQUIPMENT", "SAVINGS", "OTHER"]),
  description: z.string().min(5, "Description is required"),
  estimatedValue: z.number().min(1, "Value must be greater than 0"),
  valuationDate: z.string().min(1, "Valuation date is required"),
  valuedBy: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export type CollateralFormData = z.infer<typeof collateralSchema>;
