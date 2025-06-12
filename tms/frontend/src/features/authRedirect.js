import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMe, setRedirected } from "./authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const useAuthRedirect = (privilegeId) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Ambil state dari Redux store
    const { user, isError, isLoading, hasRedirected } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);

    const roleRoutes = useMemo(() => ({
        1: "/it",
        2: "/karyawan",
        3: "/pekerjakreatif",
        4: "/client",
        5: "/payroll",
    }), []);

    // Cek token dan ambil user jika ada
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            dispatch(getMe());
        }
    }, [dispatch]);

    useEffect(() => {
    if (isLoading) return;

    const sessionHasRedirected = sessionStorage.getItem("hasRedirected") === "true";

    if (isError) {
        sessionStorage.setItem("redirectAfterLogin", location.pathname + location.search);
        navigate("/login");
        return;
    }

    if (!isLoading && !isError && user) {
        const savedRedirect = sessionStorage.getItem("redirectAfterLogin");

        if (!sessionHasRedirected && savedRedirect) {
            console.log("Redirecting to savedRedirect:", savedRedirect);
            navigate(savedRedirect, { replace: true });
            sessionStorage.removeItem("redirectAfterLogin");
            sessionStorage.setItem("hasRedirected", "true");
            dispatch(setRedirected(true));
        }
    }
    }, [isLoading, isError, user, navigate, dispatch, location]);


    useEffect(() => {
        if (!user || !privilegeId) return;

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

// import { useEffect, useState, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { getMe, setRedirected } from "./authSlice";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";

// const useAuthRedirect = (privilegeId) => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const location = useLocation();
    
//     // Ambil state dari Redux store
//     const { user, isError, isLoading, hasRedirected } = useSelector((state) => state.auth);
//     const [loading, setLoading] = useState(true);

//     const roleRoutes = useMemo(() => ({
//         1: "/it",
//         2: "/karyawan",
//         3: "/pekerjakreatif",
//         4: "/client",
//         5: "/payroll",
//     }), []);

//     // Cek token dan ambil user jika ada
//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         if (token) {
//             dispatch(getMe());
//         }
//     }, [dispatch]);

//     useEffect(() => {
//         if (isLoading) return;

//         const sessionHasRedirected = sessionStorage.getItem("hasRedirected") === "true";
//         // console.log("isError", isError);
//         // console.log("isLoading", isLoading);
//         // console.log("user", user);
//         // console.log("sessionHasRedirected", sessionHasRedirected);

//         if (isError) {
//             // Simpan halaman yang ingin dituju jika terjadi error
//             sessionStorage.setItem("redirectAfterLogin", location.pathname + location.search);
//             console.log("Simpan redirect ke:", location.pathname + location.search);
//             navigate("/login");
//             return;
//         }

//         if (!isLoading && !isError && user) {
//             // Pastikan tidak terjadi redirect jika sudah ada
//             if (!sessionHasRedirected) {
//                 const savedRedirect = sessionStorage.getItem("redirectAfterLogin");

//                 // Jika ada savedRedirect, arahkan ke halaman tersebut
//                 if (savedRedirect) {
//                     console.log("Redirecting to savedRedirect:", savedRedirect);
//                     navigate(savedRedirect, { replace: true }); // Gunakan replace untuk mencegah kembali ke halaman sebelumnya
//                     sessionStorage.removeItem("redirectAfterLogin");
//                     sessionStorage.setItem("hasRedirected", "true"); // Menyimpan status redirect di sessionStorage
//                     dispatch(setRedirected(true)); // Set hasRedirected menjadi true di Redux
//                 } else {
//                     // Redirect berdasarkan role jika tidak ada savedRedirect
//                     const targetRoute = roleRoutes[user?.role_id] || "/";
//                     console.log("Redirecting to targetRoute:", targetRoute);
//                     navigate(targetRoute, { replace: true }); // Gunakan replace di sini juga
//                     sessionStorage.setItem("hasRedirected", "true"); // Menyimpan status redirect di sessionStorage
//                     dispatch(setRedirected(true)); // Set hasRedirected menjadi true di Redux
//                 }
//             }
//         }
//     }, [isLoading, isError, user, roleRoutes, navigate, dispatch]);

//     useEffect(() => {
//         if (!user || !privilegeId) return;

//         axios
//             .get(`${process.env.REACT_APP_API_URL}/checkprivilege/${privilegeId}`)
//             .then((res) => {
//                 if (!res.data.access) {
//                     console.log("Akses tidak diizinkan, redirect ke /no-access");
//                     navigate("/no-access");
//                 }
//             })
//             .catch(() => {
//                 navigate("/no-access");
//             })
//             .finally(() => {
//                 setLoading(false);
//             });
//     }, [user, privilegeId, navigate]);

//     return loading;
// };

// export default useAuthRedirect;





