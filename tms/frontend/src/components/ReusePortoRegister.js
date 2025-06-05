import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const ReusePortoRegister = () => {
    const { user } = useSelector((state) => state.auth);
    const role = user?.role_id;
    const { talentId } = useParams();
    const navigate = useNavigate();
    const [talentName, setTalentName] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // Ambil nama pekerja kreatif berdasarkan ID
    useEffect(() => {
        const fetchTalent = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/talents/${talentId}`);
                setTalentName(response.data.name);
            } catch (error) {
                console.error("Gagal mengambil data talent:", error);
            }
        };
        fetchTalent();
    }, [talentId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("file", file);
        formData.append("talent_id", talentId); // Ambil dari URL

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/portopks`, formData);
            sessionStorage.setItem("successMessage", "Registrasi berhasil!");
            if (role === 2) {
                navigate("/karyawan/porto-pk");
            } else if (role === 3) {
                navigate("/pekerjakreatif/porto-pk");
            }
            // setTimeout(() => window.location.reload(), 100);
        } catch (error) {
            console.error("Registrasi gagal:", error);
            Swal.fire({
                icon: "error",
                title: "Registrasi Gagal",
                text: error.response?.data?.message || "Terjadi kesalahan saat registrasi!",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <React.Fragment>
            {loading && (
                <div className="overlay-loading">
                    <div className="loading-content">
                        <div className="spinner-border text-light mb-3"></div>
                        <p>Memproses...</p>
                    </div>
                </div>
            )}
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6"><h3 className="mb-0">Registrasi Portofolio</h3></div>
                        </div>
                        <div className="container mt-4">
                            <div className="card p-4">
                                <div className="mb-3 row">
                                    {talentName ? `Pekerja Kreatif - ${talentName}` : "Memuat..."}
                                </div>
                                <form onSubmit={handleSubmit} encType="multipart/form-data">
                                    <div className="mb-3 row">
                                        <label className="col-sm-3 col-form-label">Nama File</label>
                                        <div className="col-sm-9 w-50">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3 row">
                                        <label className="col-sm-3 col-form-label">Deskripsi</label>
                                        <div className="col-sm-9 w-50">
                                            <textarea
                                                className="form-control"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={3}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3 row">
                                        <label className="col-sm-3 col-form-label">Upload File (PDF/JPG)</label>
                                        <div className="col-sm-9 w-50">
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => setFile(e.target.files[0])}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3 row">
                                        <div className="col-sm-3"></div>
                                        <div className="col-sm-9 w-50">
                                            <button type="submit" className="btn btn-success">Simpan</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="app-content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12"></div>
                        </div>
                    </div>
                </div>
            </main>
        </React.Fragment>
    );
};

export default ReusePortoRegister;
