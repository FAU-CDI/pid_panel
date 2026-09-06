import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateNamespace from "./pages/CreateNamespace";
import NamespaceDetail from "./pages/NamespaceDetail";
import EditNamespace from "./pages/EditNamespace";
import CreatePID from "./pages/CreatePID";
import EditPID from "./pages/EditPID";
import DeletePID from "./pages/DeletePID";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/namespaces/create" element={<CreateNamespace />} />
        <Route path="/namespaces/:id" element={<NamespaceDetail />} />
        <Route path="/namespaces/:id/edit" element={<EditNamespace />} />
        <Route path="/namespaces/:id/resources/create" element={<CreatePID />} />
        <Route path="/namespaces/:id/resources/:pid/edit" element={<EditPID />} />
        <Route path="/namespaces/:id/resources/:pid/delete" element={<DeletePID />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;