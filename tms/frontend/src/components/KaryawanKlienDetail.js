import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import useAuthRedirect from "../features/authRedirect";
import Sidebar from "./sidebarkaryawan";
import Footer from "./footer";
import Jsfunction from "./jsfunction";

const KaryawanKlienDetail = () => {
    useAuthRedirect(21);
    const { id } = useParams();
    const [client, setClient] = useState(null);
    const [activeTab, setActiveTab] = useState("detail");
    const [formData, setFormData] = useState({
        name: "",
        supervisor_name: "",
        email: "",
        joined_date: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [logData, setLogData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
    const [talents, setTalents] = useState([]);
    const [loadingTalents, setLoadingTalents] = useState(false);
    // --- state khusus tab PK ---
    const [filterPk, setFilterPk] = useState("name");      // kolom aktif utk search
    const [searchPk, setSearchPk] = useState("");          // kata kunci search
    const [sortColumnPk, setSortColumnPk] = useState("id");// kolom sort
    const [sortOrderPk, setSortOrderPk] = useState("asc"); // asc | desc
    const rowsPerPagePk = 10;
    const [currentPagePk, setCurrentPagePk] = useState(1);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/clients/${id}`)
            .then(res => {
                setClient(res.data);
                setFormData({
                    name: res.data.name || "",
                    supervisor_name: res.data.supervisor_name || "",
                    email: res.data.email || "",
                    joined_date: res.data.joined_date?.substring(0, 10) || "",
                    description: res.data.description || "",
                });
            })
            .catch(err => console.error("Error fetching client data:", err));
    }, [id]);

    useEffect(() => {
        if (activeTab !== "data") return;
        setLogData([]);
        setLoadingLogs(true);
        axios.get(`${process.env.REACT_APP_API_URL}/clients-log?client_id=${id}`)
            .then(res => {
                setLogData(res.data);
                setCurrentPage(1);
            })
            .catch(err => {
                console.error("Error fetching logs:", err);
                setLogData([]);
            })
            .finally(() => setLoadingLogs(false));
    }, [activeTab, id]);

    useEffect(() => {
        if (activeTab !== "pk" || !id) return;
        setTalents([]);
        setLoadingTalents(true);
        axios.get(`${process.env.REACT_APP_API_URL}/talents-clients/${id}`)
            .then(res => setTalents(res.data))
            .catch(err => {
                console.error("Error fetching talents:", err);
                setTalents([]);
            })
            .finally(() => setLoadingTalents(false));
    }, [activeTab, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        axios.put(`${process.env.REACT_APP_API_URL}/clients/${id}`, formData)
            .then(() => {
                Swal.fire("Sukses", "Data client berhasil diperbarui", "success");
            })
            .catch(() => {
                Swal.fire("Gagal", "Tidak dapat menyimpan perubahan", "error");
            })
            .finally(() => setLoading(false));
    };

    // filter
    const filteredTalents = talents.filter(t => {
        const value = t[filterPk]?.toString().toLowerCase() || "";
        return value.includes(searchPk.toLowerCase());
    });

    // sort
    const sortedTalents = [...filteredTalents].sort((a, b) => {
        let va = a[sortColumnPk], vb = b[sortColumnPk];
        if (typeof va === "string") va = va.toLowerCase();
        if (typeof vb === "string") vb = vb.toLowerCase();
        if (va < vb) return sortOrderPk === "asc" ? -1 : 1;
        if (va > vb) return sortOrderPk === "asc" ? 1 : -1;
        return 0;
    });

    // paginate
    const totalPagesPk = Math.ceil(sortedTalents.length / rowsPerPagePk);
    const paginatedTalents = sortedTalents.slice(
        (currentPagePk - 1) * rowsPerPagePk,
        currentPagePk * rowsPerPagePk
    );

    const handleSortPk = (col) => {
        const order = sortColumnPk === col && sortOrderPk === "asc" ? "desc" : "asc";
        setSortColumnPk(col);
        setSortOrderPk(order);
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
        setSortConfig(prev => ({
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
            <Sidebar activeMenu={6} />
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <h3 className="mb-3">Rincian Data Perusahaan Klien</h3>
                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === "detail" ? "active" : ""}`} onClick={() => setActiveTab("detail")}>
                                    Detail
                                </button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === "pk" ? "active" : ""}`} onClick={() => setActiveTab("pk")}>
                                    Pekerja Kreatif Aktif
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
                                        <div className="mb-3 row">
                                            <label className="col-sm-3 col-form-label">Nama Perusahaan</label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-sm-3 col-form-label">Nama Supervisor</label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" name="supervisor_name" value={formData.supervisor_name} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-sm-3 col-form-label">Email</label>
                                            <div className="col-sm-9">
                                                <input type="email" className="form-control" value={formData.email} disabled />
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-sm-3 col-form-label">Tanggal Mulai Kerja Sama</label>
                                            <div className="col-sm-9">
                                                <input type="date" className="form-control" name="joined_date" value={formData.joined_date} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-sm-3 col-form-label">Catatan</label>
                                            <div className="col-sm-9">
                                                <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} rows={3} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="offset-sm-3 col-sm-9">
                                                <button type="submit" className="btn btn-success">Simpan</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === "pk" && (
                                <div className="card p-3">
                                    {loadingTalents ? (
                                        <div className="text-center py-3">
                                            <div className="spinner-border text-primary" role="status"></div>
                                            <p className="mt-2">Mengambil data pekerja kreatif...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* search & filter */}
                                            <div className="d-flex mb-3">
                                                <div className="me-2" style={{ width: "20%" }}>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={filterPk}
                                                        onChange={e => {
                                                            setFilterPk(e.target.value);
                                                            setCurrentPagePk(1);
                                                        }}
                                                    >
                                                        <option value="id">ID</option>
                                                        <option value="name">Nama</option>
                                                        {/* <option value="email">Email</option>
                                                        <option value="position">Posisi</option> */}
                                                    </select>
                                                </div>
                                                <div style={{ width: "80%" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Keyword Pencarian"
                                                        value={searchPk}
                                                        onChange={e => {
                                                            setSearchPk(e.target.value);
                                                            setCurrentPagePk(1);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* table */}
                                            <div className="table-responsive">
                                                <table className="table table-bordered table-striped">
                                                    <thead>
                                                        <tr>
                                                            {[
                                                                { key: "id", label: "ID" },
                                                                { key: "name", label: "Nama" },
                                                                { key: "email", label: "Email" },
                                                                { key: "position", label: "Posisi" },
                                                                { key: "status", label: "Status" },
                                                            ].map(col => (
                                                                <th
                                                                    key={col.key}
                                                                    onClick={() => handleSortPk(col.key)}
                                                                    style={{ cursor: "pointer" }}
                                                                >
                                                                    {col.label} {sortColumnPk === col.key ? (sortOrderPk === "asc" ? "▲" : "▼") : ""}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paginatedTalents.length === 0 ? (
                                                            <tr><td colSpan={5} className="text-center">Tidak ada data.</td></tr>
                                                        ) : (
                                                            paginatedTalents.map(t => (
                                                                <tr key={t.id}>
                                                                    <td>{t.id}</td>
                                                                    <td>{t.name}</td>
                                                                    <td>{t.email}</td>
                                                                    <td>{t.position}</td>
                                                                    <td>{t.status}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* pagination */}
                                            {totalPagesPk > 1 && (
                                                <div className="pagination">
                                                    {[...Array(totalPagesPk)].map((_, idx) => (
                                                        <button
                                                            key={idx}
                                                            className={`btn btn-sm ${currentPagePk === idx + 1 ? "btn-primary" : "btn-light"}`}
                                                            onClick={() => setCurrentPagePk(idx + 1)}
                                                        >
                                                            {idx + 1}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === "data" && (
                                <div className="card p-3">
                                    {loadingLogs ? (
                                        <div className="text-center py-3">
                                            <div className="spinner-border text-primary" role="status"></div>
                                            <p className="mt-2">Mengambil data log...</p>
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

export default KaryawanKlienDetail;
