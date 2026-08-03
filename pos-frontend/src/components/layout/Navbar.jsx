import {
NotificationsNone,
Logout,
AccountCircle,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import "./Navbar.css";

function Navbar({
title = "Dashboard",
subtitle = "",
}) {
const navigate = useNavigate();

const today = new Date().toLocaleDateString("en-US", {
weekday: "long",
day: "numeric",
month: "long",
year: "numeric",
});

const logout = () => {
localStorage.removeItem("token");

```
navigate("/", {
  replace: true,
});
```

};

return ( <header className="navbar">

  <div>
    <h2>{title}</h2>

    <p>
      {subtitle || today}
    </p>
  </div>


  <div className="navbar-right">

    <button
      className="icon-btn"
      type="button"
      aria-label="Notifications"
    >
      <NotificationsNone />
    </button>


    {/* USER */}
    <div className="profile">

      <AccountCircle />

      <div>
        <strong>Admin</strong>

        <span>
          Store Owner
        </span>
      </div>

    </div>

    <button
      className="logout"
      onClick={logout}
      type="button"
    >
      <Logout />

      <span>
        Logout
      </span>
    </button>

  </div>

</header>

);
}

export default Navbar;
