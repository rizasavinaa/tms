import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "../components/loading";
import NotFound from "../components/NotFound";

const Payrollhome = lazy(() => import("../components/payrollhome"));
const LaporanGaji = lazy(() => import("../components/PayReportPayment"));
const PayrollBuktiKerjaList = lazy(() => import("../components/PayBuktiKerjaList"));

const PayrollRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Payrollhome />} />
        <Route path="/laporan-gaji" element={<LaporanGaji />} />
        <Route path="/pembayaran" element={<PayrollBuktiKerjaList />} />
        <Route path="*" element={<NotFound />} /> {/* Tambahkan ini */}
      </Routes>
    </Suspense>
  );
};

export default PayrollRoutes;
