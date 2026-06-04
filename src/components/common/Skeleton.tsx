import React from 'react';

// Shimmering Progress Bar placed at the absolute top of the page
export const ShimmerProgressBar: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[9999] overflow-hidden bg-blue-100 dark:bg-neutral-800">
      <div className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-orange-500 animate-pulse w-full origin-left token-progress-bar" />
    </div>
  );
};

// Shimmering Premium Worker Card Skeleton to prevent layout shifts
export const WorkerCardSkeleton: React.FC = () => {
  return (
    <div className="relative bg-white dark:bg-neutral-900 rounded-[32px] border-2 border-slate-100 dark:border-neutral-800 p-6 flex flex-col justify-between overflow-hidden animate-pulse shadow-sm h-[290px]">
      <div className="space-y-4">
        {/* Header content matching Real Card */}
        <div className="flex gap-4 items-start">
          {/* Avatar circle */}
          <div className="w-14 h-14 bg-gray-200 dark:bg-neutral-800 rounded-full shrink-0" />
          
          {/* Middle detail blocks */}
          <div className="flex-grow space-y-2.5">
            {/* Title / Name */}
            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded-md w-3/4" />
            
            {/* Secondary role or badge */}
            <div className="h-3.5 bg-gray-200 dark:bg-neutral-800 rounded-md w-1/2" />
            
            {/* Third line (Rating visual block) */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <div className="h-3 w-16 bg-gray-150 dark:bg-neutral-800 rounded-md" />
              <div className="h-3 w-10 bg-gray-150 dark:bg-neutral-800 rounded-md" />
            </div>
          </div>
        </div>

        {/* Body bio and details block */}
        <div className="space-y-2 pt-2">
          {/* Bio line 1 */}
          <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded-md w-full" />
          {/* Bio line 2 */}
          <div className="h-3 bg-gray-150 dark:bg-neutral-800/80 rounded-md w-11/12" />
        </div>
      </div>

      {/* Card Footer controls */}
      <div className="pt-4 mt-auto border-t border-gray-100 dark:border-neutral-800/60 flex items-center justify-between">
        {/* Left footer status */}
        <div className="h-3.5 w-24 bg-gray-200 dark:bg-neutral-800 rounded-md" />
        {/* Right footer CTA button */}
        <div className="h-8 w-24 bg-gray-250 dark:bg-neutral-750 rounded-xl" />
      </div>
    </div>
  );
};

// Shimmering Live Job Card Skeleton to prevent layout shifts
export const JobCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-850 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse space-y-4 relative overflow-hidden shadow-sm">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="space-y-2.5 flex-grow">
          {/* Job title */}
          <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded-md w-[80%]" />
          
          {/* Posted metadata line */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-3 w-20 bg-gray-150 dark:bg-neutral-800 rounded-md" />
            <div className="h-3 w-3 bg-gray-100 dark:bg-neutral-800 rounded-full" />
            <div className="h-3 w-28 bg-gray-150 dark:bg-neutral-800 rounded-md" />
          </div>
        </div>
        
        {/* Budget circular badge */}
        <div className="h-7 w-20 bg-emerald-100/50 dark:bg-emerald-950/20 rounded-xl shrink-0" />
      </div>

      {/* Main description section */}
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded-md w-full" />
        <div className="h-3 bg-gray-150 dark:bg-neutral-800/80 rounded-md w-10/12" />
      </div>

      {/* Bottom control row */}
      <div className="pt-3 border-t border-gray-50 dark:border-gray-800/50 flex flex-wrap items-center justify-between gap-3">
        {/* Left tags or labels */}
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-gray-150 dark:bg-neutral-800 rounded-lg" />
          <div className="h-5 w-20 bg-gray-150 dark:bg-neutral-800 rounded-lg" />
        </div>
        
        {/* Right CTA button */}
        <div className="h-8 w-24 bg-gray-250 dark:bg-neutral-750 rounded-xl" />
      </div>
    </div>
  );
};
