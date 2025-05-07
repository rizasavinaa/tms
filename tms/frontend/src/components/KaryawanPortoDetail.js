import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import useAuthRedirect from "../features/authRedirect";
import Sidebar from "./sidebarkaryawan";
import Footer from "./footer";
import Jsfunction from "./jsfunction";

const KaryawanPortoDetail = () => {
    useAuthRedirect(17);
    const { id } = useParams();
    const [porto, setPorto] = useState(null);
    const [formData, setFormData] = useState({ description: "" });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("detail");

    // Untuk log
    const [logData, setLogData] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/portopks/${id}`)
            .then(response => {
                setPorto(response.data);
                setFormData({ description: response.data.description || "" });
            })
            .catch(error => console.error("Gagal mengambil data portofolio", error));
    }, [id]);

    useEffect(() => {
        if (activeTab === "data") {
            setLogData([]);
            setLoadingLogs(true);
            axios.get(`${process.env.REACT_APP_API_URL}/portopk-log?talent_portofolio_id=${id}`)
                .then(response => setLogData(response.data))
                .catch(error => {
                    console.error("Gagal mengambil data log:", error);
                    setLogData([]);
                })
                .finally(() => setLoadingLogs(false));
        }
    }, [activeTab, id]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        axios.put(`${process.env.REACT_APP_API_URL}/portopks/${id}`, formData)
            .then(() => {
                Swal.fire("Sukses", "Deskripsi portofolio berhasil diperbarui", "success");
            })
            .catch(() => {
                Swal.fire("Error", "Gagal memperbarui deskripsi", "error");
            })
            .finally(() => setLoading(false));
    };

    const sortedData = [...logData].sort((a, b) => {
        const dir = sortConfig.direction === "asc" ? 1 : -1;
        if (a[sortConfig.key] < b[sortConfig.key]) return -1 * dir;
        if (a[sortConfig.key] > b[sortConfig.key]) return 1 * dir;
        return 0;
    });

    const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
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

            if (typeof parsed === "string") return <span>{parsed}</span>;

            let result = "";

            if (parsed.action) result += `Aksi: ${parsed.action}\n`;

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
        } catch {
            return <span>{changes}</span>;
        }
    };

    return (
        <React.Fragment>
            <Sidebar activeMenu={3} />
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <h3 className="mb-3">Detail Portofolio</h3>

                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === "detail" ? "active" : ""}`} onClick={() => setActiveTab("detail")}>
                                    Detail
                                </button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === "data" ? "active" : ""}`} onClick={() => setActiveTab("data")}>
                                    Riwayat Data
                                </button>
                            </li>
                        </ul>

                        <div className="tab-content mt-3">
                            {activeTab === "detail" && porto && (
                                <div className="card p-3">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">Nama</label>
                                            <input className="form-control" value={porto.name} disabled />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Deskripsi</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                rows={4}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Link File</label>
                                            <a href={porto.file_link} target="_blank" rel="noopener noreferrer" className="form-control-plaintext">
                                                {porto.file_link}
                                            </a>
                                        </div>
                                        <button type="submit" className="btn btn-success">Simpan</button>
                                    </form>
                                </div>
                            )}

                            {activeTab === "data" && (
                                <div className="card p-3">
                                    {loadingLogs ? (
                                        <div className="text-center py-3">
                                            <div className="spinner-border text-primary" />
                                            <p className="mt-2">Mengambil riwayat data...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <table className="table table-bordered table-hover">
                                                <thead>
                                                    <tr>
                                                        <th onClick={() => handleSort("created_at")} style={{ cursor: "pointer" }}>
                                                            Tanggal & Waktu{getSortIndicator("created_at")}
                                                        </th>
                                                        <th onClick={() => handleSort("user")} style={{ cursor: "pointer" }}>
                                                            User{getSortIndicator("user")}
                                                        </th>
                                                        <th onClick={() => handleSort("ip")} style={{ cursor: "pointer" }}>
                                                            IP{getSortIndicator("ip")}
                                                        </th>
                                                        <th>Perubahan</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedData.map((log, index) => (
                                                        <tr key={index}>
                                                            <td>{new Date(log.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}</td>
                                                            <td>{log.user}</td>
                                                            <td>{log.ip}</td>
                                                            <td>{renderChanges(log.changes)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span>Halaman {currentPage} dari {totalPages}</span>
                                                <div>
                                                    <button className="btn btn-secondary me-2" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Prev</button>
                                                    <button className="btn btn-secondary" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Jsfunction />
            <Footer />
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

export default KaryawanPortoDetail;
