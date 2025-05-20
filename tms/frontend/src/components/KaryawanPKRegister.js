import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "./sidebarkaryawan";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import useAuthRedirect from "../features/authRedirect";
import { useNavigate } from "react-router-dom";

const KaryawanPKRegister = () => {
    useAuthRedirect(20);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        category_id: "",
        description: "",
        last_salary: "",
        bank_account: "",
        joined_date: ""
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [fullname, setFullname] = useState("");
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");
    const [statusAwal, setStatusAwal] = useState("aktif");
    const [emailPassword, setEmailPassword] = useState("ya");

    // 🔽 Tambahkan di sini
    useEffect(() => {
        if (!formData.email) return;

        const timeout = setTimeout(() => {
            axios.post(`${process.env.REACT_APP_API_URL}/check-email`, { email: formData.email })
                .then((res) => {
                    if (!res.data.available) {
                        Swal.fire({
                            icon: "warning",
                            title: "Email sudah digunakan",
                            text: "Silakan gunakan email lain.",
                        });
                    }
                });
        }, 500); // Delay agar tidak terlalu sering request saat mengetik

        return () => clearTimeout(timeout); // Bersihkan timer jika user masih mengetik
    }, [formData.email]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/posisipks`);
            setCategories(res.data);
        } catch (err) {
            console.error("Gagal mengambil data kategori:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "last_salary") {
            const onlyNumber = value.replace(/\D/g, "");
            setFormData({
                ...formData,
                [name]: onlyNumber ? parseInt(onlyNumber) : "",
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const formatCurrency = (value) => {
        const number = parseInt(value);
        if (isNaN(number)) return "";
        return "Rp " + number.toLocaleString("id-ID");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 🔍 Cek email dulu sebelum submit
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/check-email`, {
                email: formData.email,
            });

            if (!res.data.available) {
                setLoading(false);
                Swal.fire("Gagal", "Email sudah digunakan. Silakan ganti.", "error");
                return; // ⛔ Hentikan submit
            }
        } catch (checkErr) {
            setLoading(false);
            Swal.fire("Error", "Gagal memeriksa email", "error");
            return;
        }

        // ✅ Jika email tersedia, lanjutkan
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/talents`, formData);
            Swal.fire("Sukses", "Data berhasil disimpan", "success");
            setFormData({
                name: "",
                email: "",
                category_id: "",
                description: "",
                last_salary: "",
                bank_account: "",
            });
            sessionStorage.setItem("successMessage", "Registrasi berhasil!");
            navigate("/karyawan/pk");
            setTimeout(() => window.location.reload(), 100);
        } catch (err) {
            Swal.fire("Error", "Gagal menyimpan data", "error");
        }

        setLoading(false);
    };


    return (
        <>
            <Sidebar activeMenu={2} />
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <h3 className="mb-3">Registrasi Pekerja Kreatif</h3>
                        <div className="card p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3 row">
                                    <label className="col-sm-3 col-form-label">Nama</label>
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
                                    <label className="col-sm-3 col-form-label">Posisi</label>
                                    <div className="col-sm-9 w-50">
                                        <select
                                            name="category_id"
                                            className="form-control"
                                            value={formData.category_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">- Pilih Posisi -</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-3 row">
                                    <label className="col-sm-3 col-form-label">Tanggal Bergabung</label>
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
                                    <label className="col-sm-3 col-form-label">Gaji</label>
                                    <div className="col-sm-9 w-50">
                                        <input
                                            type="text"
                                            name="last_salary"
                                            className="form-control"
                                            value={formatCurrency(formData.last_salary)}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3 row">
                                    <label className="col-sm-3 col-form-label">Rekening Bank</label>
                                    <div className="col-sm-9 w-50">
                                        <input
                                            type="text"
                                            name="bank_account"
                                            className="form-control"
                                            value={formData.bank_account}
                                            onChange={handleChange}
                                            placeholder="Nama Bank - Nomor Rekening"
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

export default KaryawanPKRegister;
