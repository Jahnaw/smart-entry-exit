import { useEffect, useState } from "react";

function App() {
  const [serverStatus, setServerStatus] = useState("Checking...");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((response) => response.json())
      .then((data) => {
        setServerStatus(data.message);
      })
      .catch(() => {
        setServerStatus("Backend is not reachable");
      });
  }, []);

  return (
    <div className="app">
      <h1>Smart Entry-Exit</h1>

      <p>QR-Based Entry/Exit Management System</p>

      <p>Backend Status: {serverStatus}</p>
    </div>
  );
}

export default App;