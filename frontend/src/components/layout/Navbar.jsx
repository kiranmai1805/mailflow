export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      <div className="flex items-center gap-4">
        <button className="rounded-full bg-slate-200 px-4 py-2">
          Luna
        </button>
      </div>
    </header>
  );
}