export default function SellerLoading() {
  return (
    <div className="bg-surface min-h-screen flex animate-pulse">
      {/* Sidebar Placeholder */}
      <div className="w-64 bg-surface-container-low border-r border-outline-variant hidden lg:block h-screen sticky top-0 shrink-0"></div>

      {/* Content Placeholder */}
      <div className="flex-1 p-8 space-y-6">
        <div className="h-10 w-64 bg-surface-container-high rounded-md"></div>
        <div className="h-4 w-96 bg-surface-container-low rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="h-32 bg-surface-container-low rounded-xl border border-outline-variant/20"></div>
          <div className="h-32 bg-surface-container-low rounded-xl border border-outline-variant/20"></div>
          <div className="h-32 bg-surface-container-low rounded-xl border border-outline-variant/20"></div>
        </div>
        <div className="h-96 bg-surface-container-low rounded-xl border border-outline-variant/20 pt-6"></div>
      </div>
    </div>
  );
}
