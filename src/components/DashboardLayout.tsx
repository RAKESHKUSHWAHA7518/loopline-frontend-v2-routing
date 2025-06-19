import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Black header area */}
        <div
          className="bg-black dark:bg-black flex-shrink-0"
          style={{ height: "5rem" }}
        ></div>

        {/* Main content area with curved edges */}
        <div className="flex-1 bg-black dark:bg-black overflow-hidden">
          <div className="h-full bg-[#f3f4f6] dark:bg-[#141414] rounded-tl-[2rem] overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto px-16 py-14 bg-[#F4F4F4] scrollbar-none dark:bg-[#141414]">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
