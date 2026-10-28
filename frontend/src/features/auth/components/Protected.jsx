import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

const Protected = ({ children }) => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <main
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#2563eb",
            letterSpacing: "2px",
            textAlign: "center",
            textShadow: "0 2px 8px rgba(37, 99, 235, 0.2)",
          }}
        >
          Loading....
        </h1>
      </main>
    );
  }
  if (!user) {
    return <Navigate to={"/login"} />;
  }

  return children;
};

export default Protected;
