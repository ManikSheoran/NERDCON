export default function TimerPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="pixel-card text-center py-16 max-w-2xl">
        <h1 className="font-pixel text-3xl uppercase tracking-[0.35em] text-brand-primary mb-8">
          Quest Not Started
        </h1>
        <p className="text-gray-400 text-lg mb-4">
          The adventure begins soon. Get ready!
        </p>
        <p className="text-gray-500 text-sm">
          Quest starts:{" "}
          <span className="text-brand-primary font-bold">
            November 15, 2025 at 5:00 PM IST
          </span>
        </p>
      </div>
    </div>
  );
}
