interface RequestErrorProps {
  message: string;
  onRetry?: () => void;
}

export function RequestError({ message, onRetry }: RequestErrorProps) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
      <span>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-bold hover:bg-rose-100"
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}
