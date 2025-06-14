// import { NavLink } from "react-router-dom";
// import {
//   LayoutDashboard,
//   Users,
//   BookOpen,
//   Phone,
//   History,
//   CreditCard,
//   GitFork,
//   LogOut,
// } from "lucide-react";
// import { signOut } from "../lib/auth";
// import { WorkspaceDropdown } from "./WorkspaceDropdown";
// import { DarkModeToggle } from "../context/ThemeContext";

// const navItems = [
//   { icon: LayoutDashboard, label: "Dashboard", path: "/home" },
//   { icon: Users, label: "Agents", path: "/agents" },
//   { icon: BookOpen, label: "Knowledge Base", path: "/knowledge-base" },
//   { icon: Phone, label: "Phone numbers", path: "/phone-numbers" },
//   { icon: History, label: "Call history", path: "/call-history" },
//   { icon: CreditCard, label: "Billing", path: "/billing" },
//   { icon: GitFork, label: "Routing", path: "/routing" },
// ];

// export function Sidebar() {
//   const handleLogout = async () => {
//     await signOut();
//   };

//   return (
//     <div className="w-56 h-screen bg-black   text-white   flex flex-col flex-shrink-0 overflow-hidden">
//       <div className="p-2.5 pt-5 pb-3">
//         <WorkspaceDropdown />
//       </div>

//       <div className="h-0.5 w-4/5 mx-auto my-1 bg-gray-500" />

//       <nav className="flex-1 overflow-y-auto px-2.5 py-3">
//         <ul className="space-y-2">
//           {navItems.map((item) => (
//             <li key={item.path}>
//               <NavLink
//                 to={item.path}
//                 className={({ isActive }) =>
//                   `flex items-center space-x-2 px-3 py-2 rounded-full transition-colors sidebar-text ${
//                     isActive
//                       ? "bg-blue-600 text-white font-medium"
//                       : "text-gray-300 hover:bg-gray-900"
//                   }`
//                 }
//               >
//                 <item.icon size={16} />
//                 <span>{item.label}</span>
//               </NavLink>
//             </li>
//           ))}
//         </ul>
//       </nav>

//       <div className="p-3">
//         <button
//           onClick={handleLogout}
//           className="flex items-center space-x-2 text-gray-300 hover:text-white w-full px-3 py-2 rounded-full hover:bg-gray-900 transition-colors sidebar-text"
//         >
//           <LogOut size={16} />
//           <span>Logout</span>
//         </button>
//           <DarkModeToggle />
//       </div>
//     </div>
//   );
// }


import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Phone,
  History,
  CreditCard,
  GitFork,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "../lib/auth";
import { WorkspaceDropdown } from "./WorkspaceDropdown";
import { DarkModeToggle } from "../context/ThemeContext";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/home" },
  { icon: Users, label: "Agents", path: "/agents" },
  { icon: BookOpen, label: "Knowledge Base", path: "/knowledge-base" },
  { icon: Phone, label: "Phone numbers", path: "/phone-numbers" },
  { icon: History, label: "Call history", path: "/call-history" },
  { icon: CreditCard, label: "Billing", path: "/billing" },
  { icon: GitFork, label: "Routing", path: "/routing" },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile toggle button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-black text-white"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed lg:static z-40 bg-black text-white flex flex-col transition-all duration-300 ease-in-out
        ${isOpen ? "left-0" : "-left-64"} w-64 h-full lg:left-0 lg:w-56 lg:h-screen`}
      >
        <div className="p-2.5 pt-5 pb-3">
          <WorkspaceDropdown />
        </div>

        <div className="h-0.5 w-4/5 mx-auto my-1 bg-gray-500" />

        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setIsOpen(false)} // close on nav click (mobile)
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-full transition-colors sidebar-text ${
                      isActive
                        ? "bg-blue-600 text-white font-medium"
                        : "text-gray-300 hover:bg-gray-900"
                    }`
                  }
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-300 hover:text-white w-full px-3 py-2 rounded-full hover:bg-gray-900 transition-colors sidebar-text"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
          <DarkModeToggle />
        </div>
      </div>

      {/* Overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
