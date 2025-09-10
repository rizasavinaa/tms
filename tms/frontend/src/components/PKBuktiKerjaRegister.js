import React, { useState, useEffect } from "react";

import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./sidebarpekerjakreatif";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import useAuthRedirect from "../features/authRedirect";
import api from "../api/api";

const PKBuktiKerjaRegister = () => {
    useAuthRedirect(31);
    const { user } = useSelector((state) => state.auth);
    const role = user?.role_id;
    const talentId = user?.talent_id;
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [catatan, setCatatan] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!talentId) return; // Jangan fetch kalau talentId belum tersedia

        const fetchTalent = async () => {
            try {
                const res = await api.get(`/talents/${talentId}`);
                const data = res.data;

                if (data.status_id !== 2 || data.client_id === 0) {
                    Swal.fire({
                        icon: "warning",
                        title: "Akses Ditolak",
                        text: "Anda belum terikat kontrak dengan perusahaan manapun.",
                    }).then(() => {
                        navigate("/");
                    });
                }
            } catch (err) {
                console.error("Gagal mengambil data talent:", err);
                Swal.fire({
                    icon: "error",
                    title: "Gagal Mengambil Data",
                    text: "Terjadi kesalahan saat mengambil data pekerja kreatif.",
                }).then(() => {
                    navigate("/");
                });
            }
        };

        fetchTalent();
    }, [talentId, navigate]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!startDate || !endDate) {
            Swal.fire({
                icon: "warning",
                title: "Tanggal Mulai dan Selesai wajib diisi",
            });
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            Swal.fire({
                icon: "warning",
                title: "Tanggal Selesai tidak boleh lebih awal dari Tanggal Mulai",
            });
            return;
        }

        if (!file) {
            Swal.fire({
                icon: "warning",
                title: "File wajib diupload",
            });
            return;
        }

        setLoading(true);
        try {
            const checkRes = await api.post(`/workproofs/check-overlap`, {
                talent_id: talentId,
                start_date: startDate,
                end_date: endDate,
            });

            if (checkRes.data.overlap) {
                Swal.fire({
                    icon: "error",
                    title: "Periode tanggal beririsan",
                    text: checkRes.data.message || "Sudah ada bukti kerja dalam periode tersebut.",
                });
                setLoading(false);
                return;
            }

            if (!checkRes.data.contractValid) {
                Swal.fire({
                    icon: "error",
                    title: "Periode bukti kerja tidak sesuai kontrak",
                    text: checkRes.data.message || "Periode bukti kerja harus berada di dalam periode kontrak aktif.",
                });
                setLoading(false);
                return;
            }


            // ✅ Jika tidak overlap, lanjut submit
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", catatan);
            formData.append("start_date", startDate);
            formData.append("end_date", endDate);
            formData.append("file", file);
            formData.append("talent_id", talentId);

            await api.post(`/workproofs`, formData);

            sessionStorage.setItem("successMessage", "Registrasi bukti kerja berhasil!");
            if (role === 2) {
                navigate("/karyawan/bukti-kerja");
            } else if (role === 3) {
                navigate("/pekerjakreatif/bukti-kerja");
            }
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
            <Sidebar activeMenu={6} />
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
                            <div className="col-sm-6">
                                <h3 className="mb-0">Registrasi Bukti Kerja</h3>
                            </div>
                        </div>
                        <div className="container mt-4">
                            <div className="card p-4">
                                <form onSubmit={handleSubmit} encType="multipart/form-data">
                                    <div className="mb-3 row">
                                        <label className="col-sm-3 col-form-label">Nama File</label>
                                        <div className="col-sm-9 w-50">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3 row">
                                        <label className="col-sm-3 col-form-label">Catatan</label>
                                        <div className="col-sm-9 w-50">
                                            <textarea
                                                className="form-control"
                                                value={catatan}
                                                onChange={(e) => setCatatan(e.target.value)}
                                                rows={3}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3 row">
                                        <label className="col-sm-3 col-form-label">Tanggal Mulai Periode</label>
                                        <div className="col-sm-9 w-50">
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3 row">
                                        <label className="col-sm-3 col-form-label">Tanggal Berakhir Periode</label>
                                        <div className="col-sm-9 w-50">
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3 row">
                                        <label className="col-sm-3 col-form-label">Upload File (PDF/Image(JPG,PNG, etc))</label>
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
                                            <button type="submit" className="btn btn-success">
                                                Simpan
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Jsfunction />
            <Footer />
        </React.Fragment>
    );
};

export default PKBuktiKerjaRegister;
