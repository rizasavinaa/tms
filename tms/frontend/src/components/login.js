import React, { useState, useEffect, useMemo } from "react";
import useBodyClass from "./usebodyclass";
import Jsfunction from "./jsfunction";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoginUser, getMe } from "../features/authSlice";
import Loading from "./loading"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, isError, message  } = useSelector((state) => state.auth);

  // ✅ Gunakan useBodyClass tanpa kondisi agar tidak error
  useBodyClass(["login-page", "bg-body-secondary"]);

  const roleRoutes = useMemo(() => ({
    1: "/it",
    2: "/karyawan",
    3: "/pekerjakreatif",
    4: "/client",
    5: "/payroll",
  }), []);

  // 🔹 Ambil data user saat pertama kali halaman dimuat
  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  // 🔹 Redirect jika user sudah login
  // useEffect(() => {
    // if (user?.role_id) {
    //   const targetRoute = roleRoutes[user.role_id] || "/";
    //   if (window.location.pathname !== targetRoute) {
    //     console.log("User sudah login, redirect ke:", targetRoute);
    //     navigate(targetRoute, { replace: true });
    //     window.location.reload();  // 🔹 Paksa reload agar script halaman tujuan berjalan
    //   }
    // }
  // }, [user, roleRoutes, navigate]);

  useEffect(() => {
    if (isLoading) return; // Tunggu sampai data user selesai di-fetch

    if (user?.role_id) {
      const savedRedirect = sessionStorage.getItem("redirectAfterLogin");
      const defaultRoute = roleRoutes[user.role_id] || "/";
      const targetRoute = savedRedirect || defaultRoute;
    
      // Bersihkan sessionStorage agar tidak nyangkut
      sessionStorage.removeItem("redirectAfterLogin");
    
      // Cek apakah kita sudah berada di halaman yang sama
      if (window.location.pathname !== targetRoute) {
        console.log("User sudah login, redirect ke:", targetRoute);
        navigate(targetRoute, { replace: true });
        window.location.reload();  // optional, untuk force reload
      }
    }
}, [isLoading, user, roleRoutes, navigate]);


  const Auth = (e) => {
    e.preventDefault();
    dispatch(LoginUser({ email, password }));
  };

  // ✅ Cegah tampilan form login saat Redux masih loading
  if (isLoading) {
    return <Loading />; 
  }

  // ✅ Jika user sudah login, jangan render form login
  if (user) {
    return null;
  }


  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div className="login-box">
        <div className="login-logo">
          <img src="../../dist/assets/img/logopers.png" alt="Logo" className="col-2" />
          <p>Talent Management</p>
        </div>

        <div className="card">
          <div className="card-body login-card-body">
          {isError && <p className="text-danger text-center">{message}</p>}
            <form onSubmit={Auth}>
              <div className="input-group mb-3">
                <input type="email" className="form-control"  
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email" required />
                <div className="input-group-text"><span className="bi bi-envelope" /></div>
              </div>
              <div className="input-group mb-3">
                <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <div className="input-group-text" onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
                    <span className={showPassword ? "bi bi-eye-fill" : "bi bi-eye-slash-fill"} />
                </div>
              </div>

              <div className="row">
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    Login
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {user && <Jsfunction />}
    </div>
  );
}

export default Login;
