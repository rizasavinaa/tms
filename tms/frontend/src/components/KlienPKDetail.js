import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "./sidebarclient";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import useAuthRedirect from "../features/authRedirect";
import { useLocation } from "react-router-dom";
import KaryawanPortoListByTalent from "./KaryawanPortoListByTalent";
import { formatCurrency } from "../utils/format";
import KaryawanKontrakListByTalent from "./KaryawanKontrakListByTalent";


const KlienPKDetail = () => {
    useAuthRedirect(19);
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("detail");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        category_id: "",
        description: "",
        last_salary: "",
        bank_account: "",
        status_id: "",
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    };
    const query = useQuery();
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [logData, setLogData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
    const [statusDetail, setStatusDetail] = useState("-");
    const [clientName, setClientName] = useState("");

    useEffect(() => {
        const tabParam = query.get("tab");
        if (["detail", "portofolio", "kontrak", "riwayat"].includes(tabParam)) {
            setActiveTab(tabParam);
        }
        fetchTalent();
        fetchCategories();

        const successMessage = sessionStorage.getItem("successMessage");
        if (successMessage) {
            Swal.fire("Sukses", successMessage, "success");
            sessionStorage.removeItem("successMessage");
        }
    }, [id]);

    useEffect(() => {
        setLogData([]);         // Clear log data
        setLoadingLogs(true);   // Start loading

        const fetchLogs = async () => {
            try {
                let endpoint = "";
                if (activeTab === "riwayat") {
                    endpoint = `${process.env.REACT_APP_API_URL}/talents-log?talent_id=${id}`;
                }

                if (endpoint) {
                    const response = await axios.get(endpoint);
                    setLogData(response.data);
                    setCurrentPage(1);
                }
            } catch (error) {
                console.error("Error fetching logs:", error);
                setLogData([]);
            } finally {
                setLoadingLogs(false); // Stop loading
            }
        };

        fetchLogs();
    }, [activeTab, id]);

    const fetchTalent = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/talents/${id}`);
            const data = res.data;
            setFormData({
                name: data.name,
                email: data.email,
                category_id: data.category_id,
                description: data.description,
                last_salary: String(Math.floor(Number(data.last_salary) || 0)),
                bank_account: data.bank_account,
                status_id: data.status_id
            });

            // Simpan detail status (misal: Available, Hired, Blocked)
            setStatusDetail(data.talent_status?.name || "-");

            // Jika status Hired (2), ambil nama klien
            if (data.status_id === 2 && data.client_id) {
                const clientRes = await axios.get(`${process.env.REACT_APP_API_URL}/clients/${data.client_id}`);
                setClientName(clientRes.data.name);
            } else {
                setClientName(""); // Kosongkan jika bukan status 2
            }
        } catch (err) {
            console.error("Gagal mengambil data talent:", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/posisipks`);
            setCategories(res.data);
        } catch (err) {
            console.error("Gagal mengambil data kategori:", err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/talents/${id}`, formData);
            Swal.fire("Sukses", "Data berhasil diperbarui", "success");
        } catch (err) {
            Swal.fire("Error", "Gagal memperbarui data", "error");
        }
        setLoading(false);
    };

    const sortedData = [...logData].sort((a, b) => {
        const dir = sortConfig.direction === "asc" ? 1 : -1;
        if (a[sortConfig.key] < b[sortConfig.key]) return -1 * dir;
        if (a[sortConfig.key] > b[sortConfig.key]) return 1 * dir;
        return 0;
    });

    const paginatedData = sortedData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const totalPages = Math.ceil(logData.length / rowsPerPage);

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === "asc" ? " ▲" : " ▼";
    };


    const renderChanges = (changes) => {
        try {
            const parsed = JSON.parse(changes);

            if (typeof parsed === "string") {
                return <span>{parsed}</span>;
            }

            let result = "";

            if (parsed.action) {
                result += `Aksi: ${parsed.action}\n`;
            }

            if (parsed.fields && parsed.values) {
                result += `Field: ${parsed.fields.join(", ")}\n`;
                result += "Nilai Baru:\n";
                for (const [key, value] of Object.entries(parsed.values)) {
                    result += `- ${key}: ${value}\n`;
                }
            }

            if (parsed.oldValues && parsed.newValues) {
                result += "Perubahan:\n";
                for (const key of Object.keys(parsed.newValues)) {
                    const oldVal = parsed.oldValues[key];
                    const newVal = parsed.newValues[key];
                    result += `- ${key}: ${oldVal ?? "-"} → ${newVal ?? "-"}\n`;
                }
            }

            return <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{result.trim()}</pre>;
        } catch (e) {
            return <span>{changes}</span>;
        }
    };

    return (
        <React.Fragment>
            <Sidebar activeMenu={1} />
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <h3 className="mb-3">Detail Data Pekerja Kreatif</h3>
                        <ul className="nav nav-tabs">
                            {["detail", "portofolio"].map((tab) => (
                                <li className="nav-item" key={tab}>
                                    <button className={`nav-link ${activeTab === tab ? "active" : ""}`}
                                        onClick={() => setActiveTab(tab)}>
                                        {tab === "detail" ? "Detail" :
                                            "Portofolio"}
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <div className="tab-content mt-3">
                            {activeTab === "detail" && (
                                <div className="card p-3">
                                    <div className="row">
                                        <div className="col-md-9">
                                            <form onSubmit={handleSubmit}>
                                                <div className="mb-3 row">
                                                    <label className="col-sm-3 col-form-label">Nama</label>
                                                    <div className="col-sm-9">
                                                        <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} disabled/>
                                                    </div>
                                                </div>
                                                <div className="mb-3 row">
                                                    <label className="col-sm-3 col-form-label">Status</label>
                                                    <div className="col-sm-9">
                                                        {statusDetail}{formData.status_id === 2 && clientName ? ` - ${clientName}` : ""}
                                                    </div>
                                                </div>
                                                <div className="mb-3 row">
                                                    <label className="col-sm-3 col-form-label">Email</label>
                                                    <div className="col-sm-9">
                                                        <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} disabled />
                                                    </div>
                                                </div>
                                                <div className="mb-3 row">
                                                    <label className="col-sm-3 col-form-label">Posisi</label>
                                                    <div className="col-sm-9">
                                                        <select name="category_id" className="form-control" value={formData.category_id} onChange={handleChange} disabled>
                                                            <option value="">- Pilih Posisi -</option>
                                                            {categories.map((cat) => (
                                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="mb-3 row">
                                                    <label className="col-sm-3 col-form-label">Catatan</label>
                                                    <div className="col-sm-9">
                                                        <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} rows={3} disabled/>
                                                    </div>
                                                </div>
                                                <div className="mb-3 row">
                                                    <label className="col-sm-3 col-form-label">Gaji Minimal</label>
                                                    <div className="col-sm-9">
                                                        <input
                                                            type="text"
                                                            name="last_salary"
                                                            className="form-control"
                                                            value={formatCurrency(formData.last_salary)}
                                                            onChange={(e) => {
                                                                // Hanya ambil digit, simpan tanpa format ribuan ke state
                                                                const numericValue = e.target.value.replace(/[^\d]/g, "");
                                                                setFormData({ ...formData, last_salary: numericValue });
                                                            }}
                                                            disabled
                                                        />

                                                    </div>
                                                </div>
                                                <div className="mb-3 row">
                                                    <label className="col-sm-3 col-form-label">Rekening Bank</label>
                                                    <div className="col-sm-9">
                                                        <input type="text" name="bank_account" className="form-control" value={formData.bank_account} onChange={handleChange} placeholder="Nama Bank - Nomor Rekening" disabled />
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="offset-sm-3 col-sm-9">
                                                        <button type="submit" className="btn btn-success" disabled>Simpan</button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="col-md-3 d-flex flex-column align-items-end gap-2">
                                            {formData.status_id === 1 && (
                                                <a
                                                    href={`/karyawan/kontrak-register/${id}`}
                                                    className="btn btn-success"
                                                    style={{ whiteSpace: "nowrap" }}
                                                >
                                                    Rekrut
                                                </a>
                                            )}
                                           
                                        </div>

                                    </div>
                                </div>
                            )}
                            {activeTab === "portofolio" && (
                                <div className="card p-3">
                                    <KaryawanPortoListByTalent talentId={id} />
                                </div>
                            )}
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
        </React.Fragment>
    );
};

export default KlienPKDetail;
