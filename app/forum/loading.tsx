export default function ForumLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background pb-[80px] lg:pb-0 font-body-md antialiased animate-pulse">
      {/* Navbar Placeholder */}
      <div className="w-full h-16 bg-surface-container-low border-b border-outline-variant mb-6"></div>

      <main className="flex-grow max-w-[1440px] mx-auto w-full pt-8 px-container-margin md:px-[80px] pb-section-gap">
        <div className="h-10 w-96 bg-surface-container-high rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-surface-container-low rounded mb-8"></div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Placeholder */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30 h-80"></div>
          </aside>

          {/* Stream Placeholder */}
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center gap-4">
              <div className="h-12 w-64 bg-surface-container-low rounded-full"></div>
              <div className="h-12 w-32 bg-surface-container-low rounded-xl"></div>
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 h-44 flex flex-col justify-between"
              >
                <div className="h-5 w-1/4 bg-surface-container-high rounded"></div>
                <div className="h-6 w-3/4 bg-surface-container-high rounded"></div>
                <div className="h-4 w-full bg-surface-container-low rounded"></div>
                <div className="h-4 w-1/4 bg-surface-container-low rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
