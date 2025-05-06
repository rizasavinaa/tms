import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "../components/loading";
import NotFound from "../components/NotFound";

const Karyawanhome = lazy(() => import("../components/karyawanhome"));
const KaryawanPosisiList = lazy(() => import("../components/KaryawanPosisiList"));
const KaryawanPosisiDetail = lazy(() => import("../components/KaryawanPosisiDetail"));
const KaryawanPosisiRegister = lazy(() => import("../components/KaryawanPosisiRegister"));
const KaryawanPortoPreRegister = lazy(() => import("../components/KaryawanPortoPreRegister"));
const KaryawanPortoRegister = lazy(() => import("../components/KaryawanPortoRegister"));

const KaryawanRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Karyawanhome />} />
        <Route path="/posisi-pk" element={<KaryawanPosisiList />} />
        <Route path="/posisi-pk/:id" element={<KaryawanPosisiDetail />} />
        <Route path="/posisi-pk-register" element={<KaryawanPosisiRegister />} />
        <Route path="/porto-preregister" element={<KaryawanPortoPreRegister />} />
        <Route path="/porto-register/:talentId" element={<KaryawanPortoRegister />} />
        <Route path="*" element={<NotFound />} /> {/* Tambahkan ini */}
      </Routes>
    </Suspense>
  );
};

export default KaryawanRoutes;
