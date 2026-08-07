import { Bell, Moon } from "lucide-react";

export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8">

      <div>
        <h2 className="text-xl font-semibold">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-5">

        <Bell className="cursor-pointer" />

        <Moon className="cursor-pointer" />

        <div className="rounded-full bg-slate-200 px-4 py-2">
          Luna
        </div>

      </div>

    </header>
  );
}