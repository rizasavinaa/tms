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
    const [roles, setRoles] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);


    // Untuk log data
    const [logData, setLogData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/roles`)
            .then(response => setRoles(response.data))
            .catch(error => console.error("Error fetching roles:", error));
    }, []);
    
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

    useEffect(() => {
        setLogData([]);         // Clear log data
        setLoadingLogs(true);   // Start loading
    
        const fetchLogs = async () => {
            try {
                let endpoint = "";
                if (activeTab === "data") {
                    endpoint = `${process.env.REACT_APP_API_URL}/user-logdc?user_id=${id}`;
                } else if (activeTab === "activity") {
                    endpoint = `${process.env.REACT_APP_API_URL}/user-logac?user_id=${id}`;
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
        axios.put(`${process.env.REACT_APP_API_URL}/users/${id}`, formData)
            .then(() => {
                Swal.fire("Sukses", "Data user berhasil diperbarui", "success");
            })
            .catch(error => {
                Swal.fire("Error", "Gagal memperbarui data user", "error");
                console.error("Update error:", error);
            })
            .finally(() => setLoading(false));
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        setLoading(true);
        axios.post(`${process.env.REACT_APP_API_URL}/user-reset-password/${id}`)
            .then(() => {
                Swal.fire("Sukses", "Email reset password telah dikirim", "success");
            })
            .catch(error => {
                Swal.fire("Error", "Gagal mengirim email reset password", "error");
                console.error("Reset password error:", error);
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
                                            <option value="">-- Pilih Role --</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
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
                        {activeTab === "activity" && (
                            <div className="card p-3">
                                 {loadingLogs ? (
                                    <div className="text-center py-3">
                                        <div className="spinner-border text-primary" role="status" />
                                        <p className="mt-2">Mengambil data aktivitas...</p>
                                    </div>
                                ) : (
                                    <>
                                <table className="table table-bordered table-hover">
                                    <thead>
                                        <tr>
                                            <th onClick={() => handleSort("created_at")} style={{ cursor: "pointer" }}>
                                                Tanggal & Waktu{getSortIndicator("created_at")}
                                            </th>
                                            <th onClick={() => handleSort("ip")} style={{ cursor: "pointer" }}>
                                                IP{getSortIndicator("ip")}
                                            </th>
                                            <th>Hak Akses</th>
                                            <th>Perubahan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.map((log, index) => {
                                            let action = "Tidak diketahui";
                                            try {
                                                const parsed = JSON.parse(log.changes);
                                                action = parsed.action + " " + log.type + "_id " + log.pk || "Tidak diketahui";
                                            } catch {
                                                action = log.changes;
                                            }
                                            return (
                                                <tr key={index}>
                                                    <td>{new Date(log.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</td>
                                                    <td>{log.ip}</td>
                                                    <td>{action}</td>
                                                    <td>{renderChanges(log.changes)}</td>
                                                </tr>
                                            );
                                        })}
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
                                        <div className="spinner-border text-primary" role="status" />
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
            </main>
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

export default ItUserDetail;
