import React, { useEffect, useState } from "react";

import Select from "react-select";
import Swal from "sweetalert2";
import Sidebar from "./sidebarkaryawan";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { useParams, useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/format";
import useAuthRedirect from "../features/authRedirect";
import api from "../api/api";

const KaryawanKontrakRiwayatRegister = () => {
    useAuthRedirect(26);
    const { id } = useParams(); // ID talent
    const [talent, setTalent] = useState({});
    const [clients, setClients] = useState([]);
    const [formData, setFormData] = useState({
        client_id: null,
        salary: "",
        start_date: "",
        end_date: "",
        description: "",
        contract_file: null,
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTalent = async () => {
            try {
                const res = await api.get(`/talents/${id}`);
                setTalent(res.data);
            } catch (error) {
                console.error("Error fetch talent:", error);
            }
        };
        const fetchClients = async () => {
            try {
                const res = await api.get(`/clients`);
                let options = res.data.map(c => ({ value: c.id, label: c.name }));

                // Cek apakah opsi "other" sudah ada
                const otherOption = { value: "other", label: "🚫 Perusahaan tidak terdaftar" };
                const exists = options.find(opt => opt.value === "other");
                if (!exists) {
                    options = [otherOption, ...options]; // Tambah di urutan pertama
                }

                setClients(options);
            } catch (error) {
                console.error("Error fetch clients:", error);
            }
        };
        fetchTalent();
        fetchClients();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, contract_file: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);

            if (formData.end_date && endDate < startDate) {
                setLoading(false);
                Swal.fire({
                    icon: "warning",
                    title: "Tanggal tidak valid",
                    text: "Tanggal berakhir tidak boleh lebih kecil dari tanggal mulai.",
                });
                return;
            }
            if (formData.end_date && endDate > today) {
                setLoading(false);
                Swal.fire({
                    icon: "warning",
                    title: "Tanggal tidak valid",
                    text: "Tanggal berakhir tidak boleh sama atau lebih dari hari ini karena ini adalah riwayat kerja.",
                });
                return;
            }
            if (formData.client_id === "other" && (!formData.description || formData.description.trim().length < 5)) {
                setLoading(false);
                return Swal.fire({
                    icon: "warning",
                    title: "Catatan wajib diisi",
                    text: "Karena perusahaan tidak tersedia, mohon isi nama perusahaan dan deskripsinya di bagian catatan.",
                });
            }

            const payload = new FormData();
            payload.append("client_id", formData.client_id);
            payload.append("salary", formData.salary);
            payload.append("start_date", formData.start_date);
            payload.append("end_date", formData.end_date);
            payload.append("description", formData.description);
            if (formData.contract_file) payload.append("contract_file", formData.contract_file);

            await api.post(`/contracts/${id}`, payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            sessionStorage.setItem("successMessage", "Registrasi berhasil!");
            navigate(`/karyawan/pk/${id}`);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: error.response?.data?.message || "Terjadi kesalahan saat menyimpan kontrak",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Sidebar activeMenu={3} />
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6">
                                <h3 className="mb-0">Registrasi Riwayat Kerja</h3>
                            </div>
                        </div>
                        <div className="container mt-4">
                            <div className="card p-4">
                                <div className="mb-4 row">
                                    <div className="col-sm-12">
                                        <h5>
                                            {talent.name ? `${talent.name} - ${talent.talent_category?.name || ""}` : "Memuat..."}
                                        </h5>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} encType="multipart/form-data">
                                    <div className="mb-3 row align-items-center">
                                        <label className="col-sm-3 col-form-label">Perusahaan</label>
                                        <div className="col-sm-9 w-50">
                                            <Select
                                                options={clients}
                                                onChange={opt => setFormData(prev => ({ ...prev, client_id: opt?.value || null }))}
                                                placeholder="- Pilih Klien -"
                                                value={clients.find(c => c.value === formData.client_id) || null}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3 row align-items-center">
                                        <label className="col-sm-3 col-form-label">Gaji</label>
                                        <div className="col-sm-9 w-50">
                                            <input
                                                type="text"
                                                name="salary"
                                                className="form-control"
                                                placeholder="Masukkan gaji"
                                                required
                                                value={formatCurrency(formData.salary)}
                                                onChange={(e) => {
                                                    const numericValue = e.target.value.replace(/[^\d]/g, "");
                                                    setFormData({ ...formData, salary: numericValue });
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3 row align-items-center">
                                        <label className="col-sm-3 col-form-label">Tanggal Mulai</label>
                                        <div className="col-sm-9 w-50">
                                            <input
                                                type="date"
                                                name="start_date"
                                                className="form-control"
                                                value={formData.start_date}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3 row align-items-center">
                                        <label className="col-sm-3 col-form-label">Tanggal Berakhir</label>
                                        <div className="col-sm-9 w-50">
                                            <input
                                                type="date"
                                                name="end_date"
                                                className="form-control"
                                                value={formData.end_date}
                                                onChange={handleChange}
                                                min={formData.start_date}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3 row align-items-start">
                                        <label className="col-sm-3 col-form-label">Catatan</label>
                                        <div className="col-sm-9 w-50">
                                            <textarea
                                                name="description"
                                                className="form-control"
                                                rows={3}
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Bila perusahaan tidak tersedia, mohon isi nama perusahaan di sini"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3 row align-items-center">
                                        <label className="col-sm-3 col-form-label">Upload File Kontrak (PDF)</label>
                                        <div className="col-sm-9 w-50">
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                className="form-control"
                                                onChange={handleFileChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3 row">
                                        <div className="col-sm-3"></div>
                                        <div className="col-sm-9 w-50">
                                            <button type="submit" className="btn btn-success">Simpan Kontrak</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
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

export default KaryawanKontrakRiwayatRegister;
