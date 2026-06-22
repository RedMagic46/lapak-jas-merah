export default function ChatLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background pb-[80px] lg:pb-0 font-body-md antialiased animate-pulse">
      {/* Navbar Placeholder */}
      <div className="w-full h-16 bg-surface-container-low border-b border-outline-variant mb-6"></div>

      <main className="flex-grow max-w-[1440px] mx-auto w-full pt-8 px-container-margin md:px-[80px] pb-section-gap flex gap-4 h-[600px]">
        {/* Contacts Sidebar Placeholder */}
        <div className="w-80 bg-surface-container-low rounded-2xl border border-outline-variant/30 h-full p-4 space-y-4">
          <div className="h-10 w-full bg-surface-container-high rounded-xl"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-full bg-surface-container-high shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/2 bg-surface-container-high rounded"></div>
                <div className="h-3 w-3/4 bg-surface-container-low rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Panel Placeholder */}
        <div className="flex-1 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 h-full flex flex-col justify-between p-6">
          <div className="flex gap-3 items-center border-b border-outline-variant/20 pb-4">
            <div className="w-10 h-10 rounded-full bg-surface-container-low"></div>
            <div className="h-5 w-40 bg-surface-container-low rounded"></div>
          </div>
          <div className="flex-1"></div>
          <div className="h-12 w-full bg-surface-container-low rounded-full"></div>
        </div>
      </main>
    </div>
  );
}
