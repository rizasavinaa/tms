import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const NotFound = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    return (
        <div style={{ 
            display: "flex", 
            flexDirection: "column",
            justifyContent: "center", 
            alignItems: "center", 
            height: "100vh",  // Gunakan height 100vh agar selalu berada di tengah vertikal
            width: "100vw",   // Pastikan memenuhi lebar layar
            backgroundColor: "#f8f9fa" 
        }}>
            <h1>⚠️ 404 - Halaman Tidak Ditemukan</h1>
            <p>Oops! Halaman yang Anda cari tidak tersedia.</p>
            
            {user ? (
                <button onClick={() => navigate("/")} className="btn btn-primary">
                    🔙 Kembali ke Home
                </button>
            ) : (
                <button onClick={() => navigate("/")} className="btn btn-success">
                    🔐 Silakan Login
                </button>
            )}
        </div>
    );
};

export default NotFound;
