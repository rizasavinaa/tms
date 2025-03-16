import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getMe } from "./features/authSlice";
const UserList = lazy(() => import("./components/UserList"));
const AddUser = lazy(() => import("./components/AddUser"));
const EditUser = lazy(() => import("./components/EditUser"));
const Karyawanhome = lazy(() => import("./components/karyawanhome"));
const Pekerjakreatifhome = lazy(() => import("./components/pekerjakreatifhome"));
const Clienthome = lazy(() => import("./components/clienthome"));
const Ithome = lazy(() => import("./components/ithome"));
const Payrollhome= lazy(() => import("./components/payrollhome"));
const Login = lazy(() => import("./components/login"));
const Loading = lazy(() => import('./components/loading'));
const NoAccess = lazy(() => import('./components/NoAccess'));
const NotFound = lazy(() => import('./components/NotFound'));

function App() {
  const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getMe());  // Ambil data user setiap kali aplikasi dibuka
    }, [dispatch]);
  return (
    <Router>
      <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="users/" element={<UserList/>}/>
            <Route path="add" element={<AddUser/>}/>
            <Route path="edit/:id" element={<EditUser/>}/>
            <Route path="/karyawan" element={<Karyawanhome/>}/>
            <Route path="/pekerjakreatif" element={<Pekerjakreatifhome/>}/>
            <Route path="/client" element={<Clienthome/>}/>
            <Route path="/it" element={<Ithome/>}/>
            <Route path="/payroll" element={<Payrollhome/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/no-access" element={<NoAccess/>}/>
            <Route path="*" element={<NotFound />} />
          </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
