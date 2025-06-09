import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "../components/loading";
import NotFound from "../components/NotFound";

const KaryawanHome = lazy(() => import("../components/karyawanhome"));
const KaryawanPosisiList = lazy(() => import("../components/KaryawanPosisiList"));
const KaryawanPosisiDetail = lazy(() => import("../components/KaryawanPosisiDetail"));
const KaryawanPosisiRegister = lazy(() => import("../components/KaryawanPosisiRegister"));
const KaryawanPortoPreRegister = lazy(() => import("../components/KaryawanPortoPreRegister"));
const KaryawanPortoRegister = lazy(() => import("../components/KaryawanPortoRegister"));
const KaryawanPortoList = lazy(() => import("../components/KaryawanPortoList"));
const KaryawanPortoDetail = lazy(() => import("../components/KaryawanPortoDetail"));
const KaryawanPKList = lazy(() => import("../components/KaryawanPKList"));
const KaryawanPKDetail = lazy(() => import("../components/KaryawanPKDetail"));
const KaryawanPKRegister = lazy(() => import("../components/KaryawanPKRegister"));
const KaryawanKlienList = lazy(() => import("../components/KaryawanKlienList"));
const KaryawanKlienRegister = lazy(() => import("../components/KaryawanKlienRegister"));
const KaryawanKlienDetail = lazy(() => import("../components/KaryawanKlienDetail"));
const KaryawanKontrakRegister = lazy(() => import("../components/KaryawanKontrakRegister"));
const KaryawanKontrakRiwayatRegister = lazy(() => import("../components/KaryawanKontrakRiwayatRegister"));
const KaryawanKontrakList = lazy(() => import("../components/KaryawanKontrakList"));
const KaryawanKontrakDetail = lazy(() => import("../components/KaryawanKontrakDetail"));
const KaryawanReportRetensi = lazy(() => import("../components/KaryawanReportRetensi"));
const KaryawanBuktiKerjaDetail = lazy(() => import("../components/KaryawanBuktiKerjaDetail"));
const KaryawanReportBuktiKerja = lazy(() => import("../components/KaryawanReportBuktiKerja"));

const KaryawanRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<KaryawanHome />} />
        <Route path="/posisi-pk" element={<KaryawanPosisiList />} />
        <Route path="/posisi-pk/:id" element={<KaryawanPosisiDetail />} />
        <Route path="/posisi-pk-register" element={<KaryawanPosisiRegister />} />
        <Route path="/porto-preregister" element={<KaryawanPortoPreRegister />} />
        <Route path="/porto-register/:talentId" element={<KaryawanPortoRegister />} />
        <Route path="/porto-pk" element={<KaryawanPortoList />} />
        <Route path="/porto-pk/:id" element={<KaryawanPortoDetail />} />
        <Route path="/pk" element={<KaryawanPKList />} />
        <Route path="/pk/:id" element={<KaryawanPKDetail />} />
        <Route path="/pk-register" element={<KaryawanPKRegister />} />
        <Route path="/klien" element={<KaryawanKlienList />} />
        <Route path="/klien/:id" element={<KaryawanKlienDetail />} />
        <Route path="/klien-register" element={<KaryawanKlienRegister />} />
        <Route path="/kontrak-register/:id" element={<KaryawanKontrakRegister />} />
        <Route path="/riwayat-kontrak-register/:id" element={<KaryawanKontrakRiwayatRegister />} />
        <Route path="/kontrak" element={<KaryawanKontrakList />} />
        <Route path="/kontrak/:id" element={<KaryawanKontrakDetail />} />
        <Route path="/laporan-retensi" element={<KaryawanReportRetensi />} />
        <Route path="/bukti-kerja/:id" element={<KaryawanBuktiKerjaDetail />} />
        <Route path="/laporan-bukti-kerja" element={<KaryawanReportBuktiKerja />} />
        <Route path="*" element={<NotFound />} /> {/* Tambahkan ini */}
      </Routes>
    </Suspense>
  );
};

export default KaryawanRoutes;
