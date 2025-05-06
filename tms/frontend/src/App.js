import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useLayoutEffect, lazy } from "react";
import { useDispatch } from "react-redux";
import { getMe } from "./features/authSlice";

import ItRoutes from "./routes/it";
import KaryawanRoutes from "./routes/karyawan";
import ClientRoutes from "./routes/client";
import PekerjakreatifRoutes from "./routes/pekerjakreatif";
import PayrollRoutes from "./routes/payroll";
import AuthRoutes from "./routes/auth";
import NotFound from "./components/NotFound";
import Login from "./components/login";
import NoAccess from "./components/NoAccess";

function App() {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(getMe()); // Ambil data user saat aplikasi dibuka
    //Jsfunction(); // Pastikan inisialisasi JS dilakukan sekali ketika halaman pertama kali di-load
  }, [dispatch]); // Hanya dijalankan sekali pada mount (mirip dengan useEffect, tetapi lebih awal)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/it/*" element={<ItRoutes />} />
        <Route path="/karyawan/*" element={<KaryawanRoutes />} />
        <Route path="/client/*" element={<ClientRoutes />} />
        <Route path="/pekerjakreatif/*" element={<PekerjakreatifRoutes />} />
        <Route path="/payroll/*" element={<PayrollRoutes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/no-access" element={<NoAccess />} />
        
        {/* Route NotFound harus paling bawah untuk menangkap rute yang tidak ada */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;


