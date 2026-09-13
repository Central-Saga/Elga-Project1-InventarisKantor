import { z } from 'zod';

export const assetLoanSchema = z.object({
  asset_id: z.number().int().positive(),
  loan_date: z.string().date(),
  expected_return_date: z.string().date(),
  notes: z.string().max(1000).optional(),
}).refine(
  (value) => value.expected_return_date >= value.loan_date,
  { message: 'Tanggal kembali harus setelah tanggal pinjam.', path: ['expected_return_date'] },
);

export type AssetLoanInput = z.infer<typeof assetLoanSchema>;

export interface AssetSummary {
  id: number;
  asset_code: string;
  name: string;
  status: 'available' | 'borrowed' | 'disposed' | string;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Terjadi kesalahan pada request.';
}

export function formatDate(value?: string): string {
  if (!value) return '-';

  const datePart = value.slice(0, 10);
  const date = new Date(`${datePart}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
}