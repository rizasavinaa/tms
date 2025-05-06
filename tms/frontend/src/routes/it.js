import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loading from "../components/loading";
import NotFound from "../components/NotFound";

const Ithome = lazy(() => import("../components/Ithome"));
const ItUserRegister = lazy(() => import("../components/ItUserRegister"));
const ItUserList = lazy(() => import("../components/ItUserList"));
const ItUserDetail = lazy(() => import("../components/ItUserDetail"));
const ItRoleList = lazy(() => import("../components/ItRoleList"));
const ItRoleDetail = lazy(() => import("../components/ItRoleDetail"));
const ItRoleRegister = lazy(() => import("../components/ItRoleRegister"));
const ItRolePrivilegeList = lazy(() => import("../components/ItRolePrivilegeList"));
const ItRolePrivilegeRegister = lazy(() => import("../components/ItRolePrivilegeRegister"));
const ItReportUserActivity = lazy(() => import("../components/ItReportUserActivity"));

const ItRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Ithome />} />
        <Route path="/user-register" element={<ItUserRegister />} />
        <Route path="/users" element={<ItUserList />} />
        <Route path="/users/:id" element={<ItUserDetail />} />
        <Route path="/role-register" element={<ItRoleRegister />} />
        <Route path="/roles" element={<ItRoleList />} />
        <Route path="/roles/:id" element={<ItRoleDetail />} />
        <Route path="/hak-akses" element={<ItRolePrivilegeList />} />
        <Route path="/hak-akses-register" element={<ItRolePrivilegeRegister/>} />
        <Route path="/laporan-aktivitas-user" element={<ItReportUserActivity />} />
        <Route path="*" element={<NotFound />} /> {/* Tambahkan ini */}
      </Routes>
    </Suspense>
  );
};

export default ItRoutes;