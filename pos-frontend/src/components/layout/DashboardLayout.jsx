import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function DashboardLayout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f5f7fa",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          padding: "25px",
        }}
      >
        <Navbar />

        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;