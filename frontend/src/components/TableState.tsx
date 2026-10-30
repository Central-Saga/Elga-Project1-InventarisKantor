interface TableStateProps {
  colSpan: number;
  loading: boolean;
  empty: boolean;
  emptyLabel: string;
  error?: string | null;
  onRetry?: () => void;
}

export function TableState({ colSpan, loading, empty, emptyLabel, error, onRetry }: TableStateProps) {
  if (loading) {
    return (
      <tr aria-label="Memuat data">
        <td colSpan={colSpan} className="px-4 py-8">
          <div className="space-y-3 animate-pulse">
            <div className="h-3 rounded bg-slate-200" />
            <div className="h-3 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-200" />
          </div>
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr>
        <td colSpan={colSpan} className="px-4 py-8 text-center">
          <p role="alert" className="text-sm text-rose-700">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Coba lagi
            </button>
          )}
        </td>
      </tr>
    );
  }

  if (empty) {
    return (
      <tr>
        <td colSpan={colSpan} className="px-4 py-10 text-center text-slate-400">
          {emptyLabel}
        </td>
      </tr>
    );
  }

  return null;
}