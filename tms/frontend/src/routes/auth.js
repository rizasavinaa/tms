import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "../components/loading";

const Login = lazy(() => import("../components/login"));
const NoAccess = lazy(() => import("../components/NoAccess"));
const ResetPassword = lazy(() => import("../components/ResetPassword"));

const AuthRoutes = () => (
    <Suspense fallback={<Loading />}>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/no-access" element={<NoAccess />} />
            <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
    </Suspense>
);

export default AuthRoutes;
