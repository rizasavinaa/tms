import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "./sidebarit";
import Footer from "./footer";
import useAuthRedirect from "../features/authRedirect";

const ItUserDetail = () => {
    useAuthRedirect(3);
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("detail");
    const [formData, setFormData] = useState({ email: "", fullname: "", role_id: "", status: 1 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/users/${id}`)
            .then(response => {
                setUser(response.data);
                setFormData({
                    email: response.data.email,
                    fullname: response.data.fullname,
                    role_id: response.data.role_id,
                    status: response.data.status,
                });
            })
            .catch(error => console.error("Error fetching user data:", error));
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true); // Aktifkan overlay loading
        axios.put(`${process.env.REACT_APP_API_URL}/users/${id}`, formData)
            .then(() => {
                Swal.fire("Sukses", "Data user berhasil diperbarui", "success");
            })
            .catch(error => {
                Swal.fire("Error", "Gagal memperbarui data user", "error");
                console.error("Update error:", error);
            })
            .finally(() => setLoading(false)); // Matikan loading setelah selesai
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        setLoading(true); // Aktifkan overlay loading
        axios.post(`${process.env.REACT_APP_API_URL}/user-reset-password/${id}`)
            .then(() => {
                Swal.fire("Sukses", "Email reset password telah dikirim", "success");
            })
            .catch(error => {
                Swal.fire("Error", "Gagal mengirim email reset password", "error");
                console.error("Reset password error:", error);
            })
            .finally(() => setLoading(false)); // Matikan loading setelah selesai
    };

    if (!user) return <p>Loading...</p>;

    return (
        <React.Fragment>
            <Sidebar activeMenu={3} />
            <main className="app-main">
                <div className="container-fluid">
                    <h3 className="mb-3">Rincian Data User</h3>
                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === "detail" ? "active" : ""}`} onClick={() => setActiveTab("detail")}>
                                Detail
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === "activity" ? "active" : ""}`} onClick={() => setActiveTab("activity")}>
                                Riwayat Aktivitas
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === "data" ? "active" : ""}`} onClick={() => setActiveTab("data")}>
                                Riwayat Data
                            </button>
                        </li>
                    </ul>

                    <div className="tab-content mt-3">
                        {activeTab === "detail" && (
                            <div className="card p-3">
                                <form onSubmit={handleSubmit}>
                                    <div className="row mb-3 align-items-center">
                                        <label className="col-sm-3 col-form-label">Email</label>
                                        <div className="col-sm-9">
                                        <input type="email" className="form-control" name="email" value={formData.email} disabled />
                                        </div>
                                    </div>
                                    <div className="row mb-3 align-items-center">
                                        <label className="col-sm-3 col-form-label">Role</label>
                                        <div className="col-sm-9">
                                        <select className="form-select" name="role_id" value={formData.role_id} onChange={handleInputChange}>
                                            <option value="1">IT</option>
                                            <option value="2">Admin</option>
                                        </select>
                                        </div>
                                    </div>
                                    <div className="row mb-3 align-items-center">
                                        <label className="col-sm-3 col-form-label">Nama Panjang</label>
                                        <div className="col-sm-9">
                                        <input type="text" className="form-control" name="fullname" value={formData.fullname} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label className="col-sm-3 col-form-label">Status</label>
                                        <div className="col-sm-9 d-flex align-items-center">
                                        <div className="form-check me-3">
                                            <input className="form-check-input" type="radio" name="status" id="aktif" value="1" checked={formData.status === 1} onChange={handleInputChange} />
                                            <label className="form-check-label" htmlFor="aktif">Aktif</label>
                                        </div>
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" name="status" id="nonaktif" value="0" checked={formData.status === 0} onChange={handleInputChange} />
                                            <label className="form-check-label" htmlFor="nonaktif">Nonaktif</label>
                                        </div>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label className="col-sm-3 col-form-label">Reset Password</label>
                                        <div className="col-sm-9">
                                        <button type="button" className="btn btn-primary" onClick={handleResetPassword}>Kirim</button>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label className="col-sm-3 col-form-label"></label>
                                        <div className="col-sm-9">
                                        <button type="submit" className="btn btn-success">Simpan</button>
                                        </div>
                                    </div>
                                    </form>

                            </div>
                        )}
                        {activeTab === "activity" && <p>Riwayat aktivitas user...</p>}
                        {activeTab === "data" && <p>Riwayat perubahan data user...</p>}
                    </div>
                </div>
            </main>
            <Footer />
            {/* Overlay Loading */}
            {loading && (
            <div className="overlay-loading">
                <div className="loading-content">
                <div className="spinner-border text-light mb-3"></div>
                <p>Memproses...</p>
                </div>
            </div>
            )}
        </React.Fragment>
    );
};

export default ItUserDetail;
