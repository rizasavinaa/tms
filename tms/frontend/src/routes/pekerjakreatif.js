import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "../components/loading";
import NotFound from "../components/NotFound";

const Pekerjakreatifhome = lazy(() => import("../components/pekerjakreatifhome"));

const PekerjakreatifRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Pekerjakreatifhome />} />
        <Route path="*" element={<NotFound />} /> {/* Tambahkan ini */}
      </Routes>
    </Suspense>
  );
};

export default PekerjakreatifRoutes;
