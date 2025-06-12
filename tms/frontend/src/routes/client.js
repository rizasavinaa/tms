import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "../components/loading";
import NotFound from "../components/NotFound";

const Clienthome = lazy(() => import("../components/clienthome"));
const KlienPKList = lazy(() => import("../components/KlienPKList"));
const KlienPKDetail = lazy(() => import("../components/KlienPKDetail"));
const KlienKontrakList = lazy(() => import("../components/KlienKontrakList"));
const KlienKontrakDetail = lazy(() => import("../components/KlienKontrakDetail"));
const KlienBuktiKerjaList = lazy(() => import("../components/KlienBuktiKerjaList"));
const KlienBuktiKerjaDetail = lazy(() => import("../components/KlienBuktiKerjaDetail"));
const KlienReportRetensi = lazy(() => import("../components/KlienReportRetensi"));

const ClientRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/pk" element={<KlienPKList />} />
        <Route path="/pk/:id" element={<KlienPKDetail />} />
        <Route path="/kontrak" element={<KlienKontrakList />} />
        <Route path="/kontrak/:id" element={<KlienKontrakDetail />} />
        <Route path="/bukti-kerja" element={<KlienBuktiKerjaList />} />
        <Route path="/bukti-kerja/:id" element={<KlienBuktiKerjaDetail />} />
        <Route path="/laporan-retensi" element={<KlienReportRetensi />} />
        <Route path="/" element={<Clienthome />} />
        <Route path="*" element={<NotFound />} /> {/* Tambahkan ini */}
      </Routes>
    </Suspense>
  );
};

export default ClientRoutes;
