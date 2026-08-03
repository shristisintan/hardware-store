import {
  Dashboard,
  Inventory2,
  People,
  PointOfSale,
  ReceiptLong,
  Assessment,
  Settings,
  Storefront,
} from "@mui/icons-material";

import { NavLink } from "react-router-dom";

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
    title: "Sales",
    path: "/sales",
    icon: <ReceiptLong />,
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
  return (
    <aside className="sidebar">

      <div>

        {/* ===============================
            LOGO
        ================================ */}

        <div className="sidebar-logo">

          <Storefront />

          <div>
            <h2>
              Shuva Stores
            </h2>

            <span>
              POS System
            </span>
          </div>

        </div>


        {/* ===============================
            NAVIGATION
        ================================ */}

        <nav className="sidebar-menu">

          {menuItems.map((item) => (

            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "menu-item active"
                  : "menu-item"
              }
            >

              {item.icon}

              <span>
                {item.title}
              </span>

            </NavLink>

          ))}

        </nav>

      </div>

    </aside>
  );
}

export default Sidebar;
