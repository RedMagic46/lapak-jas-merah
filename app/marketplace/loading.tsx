export default function MarketplaceLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background pb-[80px] lg:pb-0 font-body-md antialiased">
      <div className="w-full h-16 bg-surface-container-low border-b border-outline-variant animate-pulse mb-6"></div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-container-margin md:px-[80px] py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="h-8 w-32 bg-surface-container-high rounded mb-4 animate-pulse"></div>
            <div className="flex lg:flex-col gap-unit overflow-x-auto pb-4 lg:pb-0">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-12 w-28 lg:w-full bg-surface-container-low rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-end mb-6">
              <div className="h-10 w-48 bg-surface-container-high rounded animate-pulse"></div>
              <div className="h-6 w-24 bg-surface-container-high rounded animate-pulse"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-gutter">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="bg-surface-container-lowest rounded-[16px] border border-outline-variant/50 p-card-padding flex flex-col h-[320px] animate-pulse"
                >
                  <div className="w-full aspect-square rounded-[12px] bg-surface-container-low mb-4"></div>
                  <div className="h-4 w-1/3 bg-surface-container-high rounded mb-2"></div>
                  <div className="h-5 w-3/4 bg-surface-container-high rounded mb-2"></div>
                  <div className="h-6 w-1/2 bg-surface-container-high rounded mt-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
