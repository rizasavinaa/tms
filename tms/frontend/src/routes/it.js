import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loading from "../components/loading";
import NotFound from "../components/NotFound";

const Ithome = lazy(() => import("../components/Ithome"));
const ItUserRegister = lazy(() => import("../components/ItUserRegister"));
const ItUserList = lazy(() => import("../components/ItUserList"));
const ItUserDetail = lazy(() => import("../components/ItUserDetail"));

const ItRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Ithome />} />
        <Route path="/user-register" element={<ItUserRegister />} />
        <Route path="/users" element={<ItUserList />} />
        <Route path="/users/:id" element={<ItUserDetail />} />
        <Route path="*" element={<NotFound />} /> {/* Tambahkan ini */}
      </Routes>
    </Suspense>
  );
};

export default ItRoutes;