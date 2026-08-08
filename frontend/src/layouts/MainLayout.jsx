import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

function MainLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Top Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MainLayout;