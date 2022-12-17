export function Chip({
  data,
  id,
  deleteChip,
}: {
  data: string;
  id: string;
  deleteChip: (id: string) => void;
}) {
  return (
    <span className="inline-flex items-center rounded-full bg-accent-300 py-0.5 pl-2.5 pr-1 text-sm font-medium text-accent-600">
      {data}
      <button
        onClick={() => deleteChip(id)}
        type="button"
        className="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-accent-500 hover:bg-accent-400 hover:text-accent-600 focus:bg-accent-400 focus:text-white focus:outline-none"
      >
        <span className="sr-only">Remove {data} option</span>
        <svg
          onClick={() => deleteChip(id)}
          className="h-2 w-2"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 8 8"
        >
          <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
        </svg>
      </button>
    </span>
  );
}
