import {
  Dashboard,
  Inventory2,
  People,
  PointOfSale,
  Assessment,
  Settings,
  Logout,
  Storefront,
} from "@mui/icons-material";

import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const menuItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: <Dashboard />,
  },
  {
    title: "Products",
    path: "/products",
    icon: <Inventory2 />,
  },
  {
    title: "Customers",
    path: "/customers",
    icon: <People />,
  },
  {
    title: "Billing",
    path: "/billing",
    icon: <PointOfSale />,
  },
  {
    title: "Reports",
    path: "/reports",
    icon: <Assessment />,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: <Settings />,
  },
];

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          <Storefront />

          <div>
            <h2>Shova Stores</h2>
            <span>POS System</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              {item.icon}
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <button className="logout-btn" onClick={logout}>
        <Logout />
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;