import { formatCurrency, formatDate } from "./utils";

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
`;

const headerStyle = `
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  padding: 32px 24px;
  text-align: center;
  color: white;
`;

function emailLayout(content: string, title: string): string {
  return `
    <div style="${baseStyle}">
      <div style="${headerStyle}">
        <h1 style="margin:0;font-size:24px;font-weight:700;">Moga Finance</h1>
        <p style="margin:8px 0 0;opacity:0.9;font-size:14px;">${title}</p>
      </div>
      <div style="padding:32px 24px;background:#f8fafc;">
        ${content}
      </div>
      <div style="padding:20px 24px;background:#1e293b;text-align:center;color:#94a3b8;font-size:12px;">
        <p style="margin:0;">Moga Finance Ltd &bull; P.O. Box 12345, Dar es Salaam, Tanzania</p>
        <p style="margin:8px 0 0;">This is an automated message, please do not reply directly.</p>
      </div>
    </div>
  `;
}

function card(content: string): string {
  return `<div style="background:white;border-radius:8px;padding:24px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">${content}</div>`;
}

export function loanApprovedEmail(
  customerName: string,
  loanNumber: string,
  amount: number,
  termMonths: number,
  monthlyPayment: number,
  firstDueDate: string
): string {
  const content = `
    ${card(`
      <p style="margin:0 0 16px;font-size:16px;">Dear <strong>${customerName}</strong>,</p>
      <p style="margin:0 0 16px;color:#374151;">We are pleased to inform you that your loan application has been <strong style="color:#16a34a;">APPROVED</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 0;color:#6b7280;font-size:14px;">Loan Number</td>
          <td style="padding:10px 0;font-weight:600;text-align:right;">${loanNumber}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 0;color:#6b7280;font-size:14px;">Loan Amount</td>
          <td style="padding:10px 0;font-weight:600;text-align:right;">${formatCurrency(amount)}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 0;color:#6b7280;font-size:14px;">Term</td>
          <td style="padding:10px 0;font-weight:600;text-align:right;">${termMonths} months</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 0;color:#6b7280;font-size:14px;">Monthly Payment</td>
          <td style="padding:10px 0;font-weight:600;text-align:right;">${formatCurrency(monthlyPayment)}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#6b7280;font-size:14px;">First Payment Due</td>
          <td style="padding:10px 0;font-weight:600;text-align:right;">${firstDueDate}</td>
        </tr>
      </table>
      <p style="margin:16px 0 0;color:#374151;font-size:14px;">Please ensure your monthly payment of <strong>${formatCurrency(monthlyPayment)}</strong> is made on time to avoid any penalties.</p>
    `)}
  `;
  return emailLayout(content, "Loan Application Approved");
}

export function loanRejectedEmail(
  customerName: string,
  loanNumber: string,
  reason: string
): string {
  const content = `
    ${card(`
      <p style="margin:0 0 16px;font-size:16px;">Dear <strong>${customerName}</strong>,</p>
      <p style="margin:0 0 16px;color:#374151;">We regret to inform you that your loan application <strong>${loanNumber}</strong> has been <strong style="color:#dc2626;">DECLINED</strong>.</p>
      <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;border-radius:4px;margin:16px 0;">
        <p style="margin:0;color:#7f1d1d;font-size:14px;"><strong>Reason:</strong> ${reason}</p>
      </div>
      <p style="margin:16px 0 0;color:#374151;font-size:14px;">You are welcome to reapply after addressing the above concerns. Our loan officers are available to guide you through the process.</p>
    `)}
  `;
  return emailLayout(content, "Loan Application Update");
}

export function paymentDueEmail(
  customerName: string,
  loanNumber: string,
  amount: number,
  dueDate: string,
  daysUntilDue: number
): string {
  const content = `
    ${card(`
      <p style="margin:0 0 16px;font-size:16px;">Dear <strong>${customerName}</strong>,</p>
      <p style="margin:0 0 16px;color:#374151;">This is a friendly reminder that your loan payment is due in <strong style="color:#d97706;">${daysUntilDue} day(s)</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 0;color:#6b7280;font-size:14px;">Loan Number</td>
          <td style="padding:10px 0;font-weight:600;text-align:right;">${loanNumber}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 0;color:#6b7280;font-size:14px;">Amount Due</td>
          <td style="padding:10px 0;font-weight:600;text-align:right;color:#d97706;">${formatCurrency(amount)}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#6b7280;font-size:14px;">Due Date</td>
          <td style="padding:10px 0;font-weight:600;text-align:right;">${dueDate}</td>
        </tr>
      </table>
      <p style="margin:16px 0 0;color:#374151;font-size:14px;">Please make your payment on time to avoid late fees and maintain your good credit standing.</p>
    `)}
  `;
  return emailLayout(content, "Payment Due Reminder");
}

export function paymentOverdueEmail(
  customerName: string,
  loanNumber: string,
  amount: number,
  dueDate: string,
  daysOverdue: number
): string {
  const content = `
    ${card(`
      <p style="margin:0 0 16px;font-size:16px;">Dear <strong>${customerName}</strong>,</p>
      <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;border-radius:4px;margin:0 0 16px;">
        <p style="margin:0;color:#7f1d1d;font-weight:600;">URGENT: Payment Overdue by ${daysOverdue} day(s)</p>
      </div>
      <p style="margin:0 0 16px;color:#374151;">Your loan payment for <strong>${loanNumber}</strong> is now overdue. Please settle immediately to avoid further penalties.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 0;color:#6b7280;font-size:14px;">Overdue Amount</td>
          <td style="padding:10px 0;font-weight:600;text-align:right;color:#dc2626;">${formatCurrency(amount)}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#6b7280;font-size:14px;">Original Due Date</td>
          <td style="padding:10px 0;font-weight:600;text-align:right;">${dueDate}</td>
        </tr>
      </table>
      <p style="margin:16px 0 0;color:#374151;font-size:14px;">Contact us immediately at our office or visit any branch to make your payment. Failure to pay may result in legal action.</p>
    `)}
  `;
  return emailLayout(content, "URGENT: Overdue Payment Notice");
}

export function paymentReceivedEmail(
  customerName: string,
  receiptNumber: string,
  amount: number,
  paymentDate: string,
  remainingBalance: number
): string {
  const content = `
    ${card(`
      <p style="margin:0 0 16px;font-size:16px;">Dear <strong>${customerName}</strong>,</p>
      <p style="margin:0 0 16px;color:#374151;">We have received your payment. Thank you!</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 0;color:#6b7280;font-size:14px;">Receipt Number</td>
          <td style="padding:10px 0;font-weight:600;text-align:right;">${receiptNumber}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 0;color:#6b7280;font-size:14px;">Amount Paid</td>
          <td style="padding:10px 0;font-weight:600;text-align:right;color:#16a34a;">${formatCurrency(amount)}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 0;color:#6b7280;font-size:14px;">Payment Date</td>
          <td style="padding:10px 0;font-weight:600;text-align:right;">${paymentDate}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#6b7280;font-size:14px;">Outstanding Balance</td>
          <td style="padding:10px 0;font-weight:600;text-align:right;">${formatCurrency(remainingBalance)}</td>
        </tr>
      </table>
      <p style="margin:16px 0 0;color:#374151;font-size:14px;">Please keep this receipt for your records. Your continued commitment to timely payment is appreciated.</p>
    `)}
  `;
  return emailLayout(content, "Payment Received");
}
