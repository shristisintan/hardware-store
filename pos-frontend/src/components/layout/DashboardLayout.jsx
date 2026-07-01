import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function DashboardLayout({
  children,
  title = "Dashboard",
  subtitle = "",
}) {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden", // 🔥 prevents page overflow chaos
        background: "#F5F7FA",
      }}
    >
      {/* SIDEBAR (fixed column) */}
      <Sidebar />

      {/* MAIN AREA */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0, // 🔥 prevents horizontal overflow bugs
        }}
      >
        {/* NAVBAR (fixed at top) */}
        <div
          style={{
            flexShrink: 0,
          }}
        >
          <Navbar title={title} subtitle={subtitle} />
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div
          style={{
            flex: 1,
            overflowY: "auto", // 🔥 THIS is what you were missing
            padding: "25px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;