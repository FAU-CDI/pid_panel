import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateNamespace from "./pages/CreateNamespace";
import NamespaceDetail from "./pages/NamespaceDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/namespaces/create" element={<CreateNamespace />} />
        <Route path="/namespaces/:id" element={<NamespaceDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;