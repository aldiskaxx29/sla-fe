const ExecutivePage = () => {
  const isLocalDev =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

  if (isLocalDev) {
    return (
      <div className="mx-6 mt-6 rounded-xl border border-[#DBDBDB] bg-white p-6 min-h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="max-w-xl text-center">
          <p className="text-2xl font-semibold text-[#0E2133]">
            Executive Summary
          </p>
          <p className="mt-3 text-sm text-[#4B465C]">
            Dashboard executive tidak tersedia sebagai iframe lokal di
            environment ini, jadi halaman menampilkan shell aplikasi saja
            tanpa blank screen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src="https://qosmo.telkom.co.id/executive/?page=executive"
      title="Executive Dashboard"
      className="w-full min-h-[100vh] border-0"
    />
  );
};

export default ExecutivePage;
