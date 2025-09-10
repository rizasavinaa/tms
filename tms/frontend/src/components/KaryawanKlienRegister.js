import React, { useState, useEffect } from "react";

import Swal from "sweetalert2";
import Sidebar from "./sidebarkaryawan";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import useAuthRedirect from "../features/authRedirect";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const KaryawanKlienRegister = () => {
    useAuthRedirect(22);

    const [formData, setFormData] = useState({
        name: "",
        supervisor_name: "",
        email: "",
        joined_date: "",
        description: "",
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!formData.email) return;

        const timeout = setTimeout(() => {
            api.post(`/check-email`, { email: formData.email })
                .then((res) => {
                    if (!res.data.available) {
                        Swal.fire({
                            icon: "warning",
                            title: "Email sudah digunakan",
                            text: "Silakan gunakan email lain.",
                        });
                    }
                });
        }, 500);

        return () => clearTimeout(timeout);
    }, [formData.email]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post(`/check-email`, {
                email: formData.email,
            });

            if (!res.data.available) {
                setLoading(false);
                Swal.fire("Gagal", "Email sudah digunakan. Silakan ganti.", "error");
                return;
            }
        } catch (checkErr) {
            setLoading(false);
            Swal.fire("Error", "Gagal memeriksa email", "error");
            return;
        }

        try {
            await api.post(`/clients`, formData);
            // Swal.fire("Sukses", "Data klien berhasil disimpan", "success");
            setFormData({
                name: "",
                supervisor_name: "",
                email: "",
                joined_date: "",
                description: "",
            });
            sessionStorage.setItem("successMessage", "Registrasi klien berhasil!");
            navigate("/karyawan/klien"); // ganti sesuai rute halaman daftar klien kamu
            // setTimeout(() => window.location.reload(), 100);
        } catch (err) {
            Swal.fire("Error", "Gagal menyimpan data klien", "error");
        }

        setLoading(false);
    };

    return (
        <>
            <Sidebar activeMenu={7} />
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <h3 className="mb-3">Registrasi Klien</h3>
                        <div className="card p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3 row">
                                    <label className="col-sm-3 col-form-label">Nama Perusahaan</label>
                                    <div className="col-sm-9 w-50">
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3 row">
                                    <label className="col-sm-3 col-form-label">Nama Supervisor</label>
                                    <div className="col-sm-9 w-50">
                                        <input
                                            type="text"
                                            name="supervisor_name"
                                            className="form-control"
                                            value={formData.supervisor_name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3 row">
                                    <label className="col-sm-3 col-form-label">Email</label>
                                    <div className="col-sm-9 w-50">
                                        <input
                                            name="email"
                                            type="email"
                                            className="form-control"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3 row">
                                    <label className="col-sm-3 col-form-label">Tanggal Mulai Kerja Sama</label>
                                    <div className="col-sm-9 w-50">
                                        <input
                                            type="date"
                                            name="joined_date"
                                            className="form-control"
                                            value={formData.joined_date}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3 row">
                                    <label className="col-sm-3 col-form-label">Catatan</label>
                                    <div className="col-sm-9 w-50">
                                        <textarea
                                            name="description"
                                            className="form-control"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={3}
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
            </main>
            <Footer />
            <Jsfunction />
            {loading && (
                <div className="overlay-loading">
                    <div className="loading-content">
                        <div className="spinner-border text-light mb-3"></div>
                        <p>Memproses...</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default KaryawanKlienRegister;
