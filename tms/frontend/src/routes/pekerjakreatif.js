import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "../components/loading";
import NotFound from "../components/NotFound";
import PKDataDiri from "../components/PKDataDiri";
import PKPortofolioDetail from "../components/PKPortofolioDetail";
const PKPortofolioListMaster = lazy(() => import("../components/PKPortofolioListMaster"));
const PKPortofolioRegister = lazy(() => import("../components/PKPortofolioRegister"));
const Pekerjakreatifhome = lazy(() => import("../components/pekerjakreatifhome"));
const PKKontrakList = lazy(() => import("../components/PKKontrakList"));
const PKKontrakDetail = lazy(() => import("../components/PKKontrakDetail"));
const PKBuktiKerjaRegister = lazy(() => import("../components/PKBuktiKerjaRegister"));
const PKBuktiKerjaList = lazy(() => import("../components/PKBuktiKerjaList"));
const PKReportPembayaran = lazy(() => import("../components/PKReportPembayaran"));
const PKBuktiKerjaDetail = lazy(() => import("../components/PKBuktiKerjaDetail"));

const PekerjakreatifRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/data-diri" element={<PKDataDiri />} />
        <Route path="/porto-pk/:id" element={<PKPortofolioDetail />} />
        <Route path="/porto-pk" element={<PKPortofolioListMaster />} />
        <Route path="/porto-register/:talentId" element={<PKPortofolioRegister />} />
        <Route path="/kontrak" element={<PKKontrakList />} />
        <Route path="/kontrak/:id" element={<PKKontrakDetail />} />
        <Route path="/bukti-kerja-register/" element={<PKBuktiKerjaRegister />} />
        <Route path="/bukti-kerja" element={<PKBuktiKerjaList />} />
        <Route path="/pembayaran" element={<PKReportPembayaran />} />
        <Route path="/bukti-kerja/:id" element={<PKBuktiKerjaDetail />} />
        <Route path="/" element={<Pekerjakreatifhome />} />
        <Route path="*" element={<NotFound />} /> {/* Tambahkan ini */}
      </Routes>
    </Suspense>
  );
};

export default PekerjakreatifRoutes;
