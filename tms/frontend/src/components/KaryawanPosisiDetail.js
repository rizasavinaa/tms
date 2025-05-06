import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import useAuthRedirect from "../features/authRedirect";
import Sidebar from "./sidebarkaryawan";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { Link } from "react-router-dom";

const KaryawanPosisiDetail = () => {
    useAuthRedirect(14);
    const { id } = useParams();
    const [posisipk, setPosisiPK] = useState(null);
    const [activeTab, setActiveTab] = useState("detail");
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [loading, setLoading] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const [logData, setLogData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/posisipks/${id}`)
            .then(response => {
                setPosisiPK(response.data);
                setFormData({
                    name: response.data.name,
                    description: response.data.description,
                });
            })
            .catch(error => console.error("Error fetching posisipk data:", error));
    }, [id]);

    useEffect(() => {
        setLogData([]);         // Clear log data
        setLoadingLogs(true);   // Start loading

        const fetchLogs = async () => {
            try {
                let endpoint = "";
                if (activeTab === "data") {
                    endpoint = `${process.env.REACT_APP_API_URL}/posisipk-log?talent_category_id=${id}`;
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        axios.put(`${process.env.REACT_APP_API_URL}/posisipks/${id}`, formData)
            .then(() => {
                Swal.fire("Sukses", "Data posisi pekerja kreatif berhasil diperbarui", "success");
            })
            .catch(error => {
                Swal.fire("Error", "Gagal memperbarui data posisi pekerja kreatif", "error");
                console.error("Update error:", error);
            })
            .finally(() => setLoading(false));
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
            <Sidebar activeMenu={4} />
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <h3 className="mb-3">Rincian Data Posisi Pekerja Kreatif</h3>
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
                            {activeTab === "detail" && (
                                <div className="card p-3">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row mb-3 align-items-center">
                                            <label className="col-sm-3 col-form-label">Nama</label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                        <div className="row mb-3 align-items-center">
                                            <label className="col-sm-3 col-form-label">Deskripsi</label>
                                            <div className="col-sm-9">
                                                <textarea className="form-control" name="description" value={formData.description} onChange={handleInputChange}
                                                    rows={3} // atau bisa 4-5 kalau butuh lebih luas
                                                    required
                                                />
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
                            {activeTab === "access" && (
                                <div className="card p-3">
                                    {loadingLogs ? (
                                        <div className="text-center py-3">
                                            <div className="spinner-border text-primary" posisipk="status" />
                                            <p className="mt-2">Mengambil data hak akses...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <table className="table table-bordered table-hover">
                                                <thead>
                                                    <tr>
                                                        <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
                                                           ID{getSortIndicator("id")}
                                                        </th>
                                                        <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                                                            Nama Posisi{getSortIndicator("name")}
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {paginatedData.map((log, index) => (
                                                        <tr key={index}>
                                                            <td>{log.id}</td>
                                                            <td>{log.name} : {log.description}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {/* Pagination Controls */}
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

                            {activeTab === "data" && (
                                <div className="card p-3">
                                    {loadingLogs ? (
                                        <div className="text-center py-3">
                                            <div className="spinner-border text-primary" posisipk="status" />
                                            <p className="mt-2">Mengambil data riwayat...</p>
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
                                                            <td>{new Date(log.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</td>
                                                            <td>{log.user}</td>
                                                            <td>{log.ip}</td>
                                                            <td>{renderChanges(log.changes)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {/* Pagination Controls */}
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
export default KaryawanPosisiDetail;