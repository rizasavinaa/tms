import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "./authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const useAuthRedirect = (privilegeId) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isError, isLoading } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const roleRoutes = useMemo(() => ({
        1: "/it",
        2: "/karyawan",
        3: "/pekerjakreatif",
        4: "/client",
        5: "/payroll",
    }), []);

    // Ambil data user saat pertama kali halaman dibuka
    useEffect(() => {
        dispatch(getMe());
    }, [dispatch]);

    useEffect(() => {
        if (isLoading) return; // Tunggu proses getMe selesai

        // if (isError) {
        //     sessionStorage.setItem("redirectAfterLogin", location.pathname);
        //     console.log("User tidak ditemukan, redirect ke /login");
        //     navigate("/login");
        //     return;
        // }

        if (isError) {
            //belum login simpan terus halaman yg mau dituju
            const savedRedirect = sessionStorage.getItem("redirectAfterLogin");
            sessionStorage.setItem("redirectAfterLogin", location.pathname + location.search);
            console.log('simpan', location.pathname + location.search);
            console.log("User tidak ditemukan, redirect ke /logink");
            navigate("/login");
            return;
        }
        

        if (user) {
            const targetRoute = roleRoutes[user?.role_id] || "/";
            //sudah redirect maka dihapus sessionnya
            sessionStorage.removeItem("redirectAfterLogin");
            console.log("User sudah login, redirect ke:", targetRoute);
            setLoading(false);
        }
        
    }, [isError, isLoading, user, roleRoutes, navigate]);

    useEffect(() => {
        if (!user || !privilegeId) return; // Pastikan user sudah ada sebelum cek akses

        axios
            .get(`${process.env.REACT_APP_API_URL}/checkprivilege/${privilegeId}`)
            .then((res) => {
                if (!res.data.access) {
                    console.log("Akses tidak diizinkan, redirect ke /no-access");
                    navigate("/no-access");
                }
            })
            .catch(() => {
                navigate("/no-access");
            })
            .finally(() => {
                setLoading(false);
            });

    }, [user, privilegeId, navigate]);

    return loading;
};

export default useAuthRedirect;

