import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "../components/loading";
import NotFound from "../components/NotFound";

const Payrollhome = lazy(() => import("../components/payrollhome"));

const PayrollRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Payrollhome />} />
        <Route path="*" element={<NotFound />} /> {/* Tambahkan ini */}
      </Routes>
    </Suspense>
  );
};

export default PayrollRoutes;
