import { Loader2 } from 'lucide-react';

export function CmsSpinner({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <Loader2 
      size={size} 
      className={`animate-spin text-indigo-500 ${className}`} 
    />
  );
}

export function CmsFullPageLoader({ message = "Loading system assets..." }: { message?: string }) {
  return (
    <div className="min-h-screen w-full bg-[#050505] dark:bg-[#050505] bright:bg-white flex flex-col items-center justify-center gap-4 text-center z-50 relative">
      <CmsSpinner size={40} />
      <span className="text-xs uppercase tracking-widest font-mono text-white/50 bright:text-slate-500 font-bold">
        {message}
      </span>
    </div>
  );
}

export function CmsTableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 space-y-4 animate-pulse">
      {/* Header bar skeleton */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div className="h-6 w-1/4 bg-white/10 rounded-lg"></div>
        <div className="h-9 w-24 bg-white/10 rounded-lg"></div>
      </div>
      
      {/* Table rows skeleton */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rIndex) => (
          <div key={rIndex} className="flex gap-4 py-3 border-b border-white/5">
            {Array.from({ length: cols }).map((_, cIndex) => (
              <div 
                key={cIndex} 
                className={`h-4 bg-white/5 rounded-md ${
                  cIndex === 0 ? 'w-2/5' : cIndex === cols - 1 ? 'w-1/6 ml-auto' : 'w-1/5'
                }`}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CmsGridSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="bg-[#0d0d0d] border border-white/10 p-6 rounded-2xl space-y-3">
          <div className="h-4 w-1/3 bg-white/10 rounded-md"></div>
          <div className="h-8 w-2/3 bg-white/10 rounded-lg"></div>
          <div className="h-3 w-1/2 bg-white/5 rounded-md pt-2"></div>
        </div>
      ))}
    </div>
  );
}

export function CmsFormSkeleton() {
  return (
    <div className="bg-[#0d0d0d] border border-white/10 p-6 md:p-8 rounded-3xl space-y-6 animate-pulse">
      <div className="h-6 w-1/3 bg-white/10 rounded-lg pb-4 border-b border-white/5"></div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="h-3 w-1/4 bg-white/10 rounded-md"></div>
          <div className="h-10 bg-white/5 rounded-xl"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-1/4 bg-white/10 rounded-md"></div>
          <div className="h-10 bg-white/5 rounded-xl"></div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-3 w-1/4 bg-white/10 rounded-md"></div>
        <div className="h-20 bg-white/5 rounded-xl"></div>
      </div>

      <div className="space-y-2">
        <div className="h-3 w-1/4 bg-white/10 rounded-md"></div>
        <div className="h-40 bg-white/5 rounded-xl"></div>
      </div>

      <div className="h-10 w-full bg-white/10 rounded-xl pt-4"></div>
    </div>
  );
}
