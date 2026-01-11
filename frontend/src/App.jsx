import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Cargando...");

  useEffect(() => {
    fetch("http://localhost:4000/api/v1/health")
      .then((res) => res.json())
      .then((data) => setStatus(JSON.stringify(data)))
      .catch((err) => setStatus("Error: " + err.message));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Mini E-commerce</h1>
      <p>Hola Sayita:</p>
      <pre>{status}</pre>
    </div>
  );
}

export default App;
