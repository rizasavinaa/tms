import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "../components/loading";
import NotFound from "../components/NotFound";

const Karyawanhome = lazy(() => import("../components/karyawanhome"));

const KaryawanRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Karyawanhome />} />
        <Route path="*" element={<NotFound />} /> {/* Tambahkan ini */}
      </Routes>
    </Suspense>
  );
};

export default KaryawanRoutes;
