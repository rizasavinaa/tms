import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "../components/loading";
import NotFound from "../components/NotFound";

const Clienthome = lazy(() => import("../components/clienthome"));

const ClientRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Clienthome />} />
        <Route path="*" element={<NotFound />} /> {/* Tambahkan ini */}
      </Routes>
    </Suspense>
  );
};

export default ClientRoutes;
