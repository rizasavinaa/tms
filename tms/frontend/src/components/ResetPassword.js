import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [isValid, setIsValid] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState({ message: "", error: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${process.env.REACT_APP_API_URL}/verify-reset-token?token=${token}`)
      .then(() => setIsValid(true))
      .catch(() => setIsValid(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    if (password.length < 6) {
      setFeedback({ message: "", error: "Password minimal 6 karakter!" });
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setFeedback({ message: "", error: "Password dan konfirmasi harus sama!" });
      setLoading(false);
      return;
    }
  
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/reset-password`, {
            token,
            password,
            confPassword: confirmPassword, // Tambahkan ini!
          });
          setFeedback({ message: response.data.message, error: "" });
          setIsSuccess(true); // Jika sukses, ubah state ke true
        } catch (error) {
          console.log("🔥 Error response:", error.response);
          setFeedback({ message: "", error: error.response?.data?.msg || "Gagal reset password" });
        }
     
    setLoading(false);
  };
  
  return (
    <div style={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f8f9fa" 
    }}>
      <div className="card p-4 shadow" style={{ width: "350px" }}>
        <h3 className="text-center">Reset Password</h3>
  
        {isValid === null && <p className="text-center">Memverifikasi token...</p>}
        {isValid === false && <p className="text-danger text-center">Token tidak valid atau kedaluwarsa.</p>}
  
        {isValid && !isSuccess && ( 
          <form onSubmit={handleSubmit}>
            {/* Input Password */}
            <div className="form-group">
              <label>Password Baru</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="input-group-append">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
            </div>
        
            {/* Input Konfirmasi Password */}
            <div className="form-group mt-3">
              <label>Konfirmasi Password</label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <div className="input-group-append">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`fa ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
            </div>
        
            {feedback.error && <p className="text-danger text-center mt-2">{feedback.error}</p>}
        
            <button type="submit" className="btn btn-primary btn-block mt-3" disabled={loading}>
              {loading ? "Memproses..." : "Reset Password"}
            </button>
          </form>
        )}
  
        {/* Tombol Login Muncul Jika Berhasil */}
        {isSuccess && (
          <div className="text-center mt-3">
            <p className="text-success">{feedback.message}</p>
            <button onClick={() => navigate("/login")} className="btn btn-success">
              Masuk ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};  

export default ResetPassword;
