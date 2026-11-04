"use client";

// Next 16.3+: retry() re-fetches the segment; reset() only re-renders what is
// already there, so it cannot recover from a failed server fetch.
export default function Error({ retry }: { retry: () => void }) {
  return (
    <div>
      <p>We could not load your tasks.</p>
      <button onClick={() => retry()}>Try again</button>
    </div>
  );
}
