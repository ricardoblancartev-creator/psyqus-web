export default function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 animate-pulse h-full w-full">
      <div className="rounded-full bg-slate-800 h-64 w-64"></div>
      <div className="h-4 bg-slate-800 rounded w-3/4"></div>
      <div className="h-4 bg-slate-800 rounded w-1/2"></div>
    </div>
  );
}