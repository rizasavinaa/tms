import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const NoAccess = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    
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
            
                <h1 style={{ fontSize: "24px" }}>🚫 Akses Ditolak!</h1>
                <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                <button 
                    onClick={() => navigate("/")} 
                    style={{
                        backgroundColor: "#007bff", 
                        color: "#fff", 
                        border: "none", 
                        padding: "10px 20px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "16px",
                        marginTop: "10px"
                    }}>
                    Kembali ke Home
                </button>
        </div>
    );
};

export default NoAccess;
