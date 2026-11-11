export default function AdminLoading() {
  return (
    <main
      aria-label="Loading administration dashboard"
      className="min-h-screen animate-pulse bg-gray-100 px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="h-16 w-72 rounded-2xl bg-gray-200" />
        <div className="mt-8 grid gap-6 min-[900px]:grid-cols-[16rem_minmax(0,1fr)]">
          <div className="hidden min-h-[30rem] rounded-2xl bg-white p-5 min-[900px]:block">
            <div className="space-y-4">
              {Array.from({ length: 7 }, (_, index) => (
                <div key={index} className="h-11 rounded-xl bg-gray-100" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-24 rounded-2xl bg-gray-200" />
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-32 rounded-2xl bg-white" />
              ))}
            </div>
            <div className="h-52 rounded-2xl bg-white" />
            <div className="h-64 rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    </main>
  );
}
