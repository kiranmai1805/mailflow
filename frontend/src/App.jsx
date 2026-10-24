import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Campaigns from "./pages/Campaigns";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import EmailAccounts from "./pages/EmailAccounts";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import ProtectedRoute from "./components/auth/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* =================================================
            PROTECTED ROUTES
        ================================================= */}

        <Route element={<ProtectedRoute />}>

          <Route element={<MainLayout />}>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/contacts"
              element={<Contacts />}
            />

            <Route
              path="/email-accounts"
              element={<EmailAccounts />}
            />

            <Route
              path="/campaigns"
              element={<Campaigns />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

          </Route>

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;