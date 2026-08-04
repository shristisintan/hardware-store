import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function DashboardLayout({
  children,
  title = "Dashboard",
  subtitle = "",
  showHeader = true,
}) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#F7F7F5",
        color: "#1F2937",
      }}
    >
      {/* =========================
          SIDEBAR
      ========================= */}
      <Sidebar />

      {/* =========================
          MAIN APPLICATION
      ========================= */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* =========================
            TOP NAVIGATION
        ========================= */}
        {showHeader && (
          <header
            style={{
              flexShrink: 0,
              backgroundColor: "#FFFFFF",
              borderBottom: "1px solid #E8E8E5",
              zIndex: 10,
            }}
          >
            <Navbar
              title={title}
              subtitle={subtitle}
            />
          </header>
        )}

        {/* =========================
            PAGE CONTENT
        ========================= */}
        <section
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1500px",
              margin: "0 auto",
              padding: "32px 36px 48px",
              boxSizing: "border-box",
            }}
          >
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardLayout;
