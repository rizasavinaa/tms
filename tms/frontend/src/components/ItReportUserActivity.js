import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import useAuthRedirect from "../features/authRedirect";
import Sidebar from "./sidebarit";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { Link } from "react-router-dom";

const ItReportUserActivity = () => {
    useAuthRedirect(5);
    const [logs, setLogs] = useState([]);
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        userName: "",
        email: "",
        keyword: "",
        searchType: "fullname", // default search type
        page: 1,
        limit: 10,
        sortBy: "createdAt", // default sort column
        sortOrder: "desc" // default sort order
    });
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchLogs = async () => {
        setLoading(true);
    
        // Filter params: hanya kirim yang tidak kosong/null
        const params = Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== "" && v !== null)
        );
    
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/laporan-aktivitas-user`, {
                params,
            });
            setLogs(res.data.data || []); // fallback kalau kosong
            setTotalPages(res.data.totalPages || 1);
        } catch (error) {
            console.error("Fetch logs error:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        // Validasi tanggal: pastikan startDate tidak lebih besar dari endDate
        if (filters.startDate && filters.endDate && new Date(filters.startDate) > new Date(filters.endDate)) {
            Swal.fire({
                icon: "error",
                title: "Tanggal Salah",
                text: "Tanggal Awal tidak boleh lebih besar dari Tanggal Akhir!",
            });
            // Resetkan tanggal agar pengguna bisa memperbaikinya
            setFilters(prev => ({
                ...prev,
                startDate: "", // Reset start date
                endDate: "" // Reset end date
            }));
            return; // Stop eksekusi lebih lanjut jika tanggal tidak valid
        }
    
        fetchLogs(); // Fetch logs setelah validasi tanggal
    }, [filters]); // Terus memantau perubahan pada filters
    
    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
            page: 1,
        });
    };

    const handleExportExcel = () => {
        const params = Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== "" && v !== null)
        );
    
        axios.get(`${process.env.REACT_APP_API_URL}/export-laporan-aktivitas-user`, {
            params,
            responseType: 'blob', // penting untuk file biner
        })
        .then(response => {
            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(blob, "laporan_aktivitas_user.xlsx");
        })
        .catch(error => {
            console.error("Error exporting Excel:", error);
            Swal.fire({
                icon: "error",
                title: "Gagal Download",
                text: "Terjadi kesalahan saat mengekspor file.",
            });
        });
    };
    
    // const handleSearch = () => {
    //     // Validasi tanggal: pastikan startDate tidak lebih besar dari endDate
    //     if (filters.startDate && filters.endDate && new Date(filters.startDate) > new Date(filters.endDate)) {
    //         Swal.fire({
    //             icon: "error",
    //             title: "Tanggal Salah",
    //             text: "Tanggal Awal tidak boleh lebih besar dari Tanggal Akhir!",
    //         });
    //         return;
    //     }

    //     const params = Object.fromEntries(
    //         Object.entries(filters).filter(([_, v]) => v !== "" && v !== null)
    //     );

    //     axios.get(`${process.env.REACT_APP_API_URL}/laporan-aktivitas-user`, { params })
    //         .then(response => {
    //             //setActivityData(response.data);
    //         })
    //         .catch(error => {
    //             console.error("Error fetching user activity:", error);
    //         });
    // };

    const handleSort = (column) => {
        // Jika kolom yang sama diklik, toggle urutan
        const newSortOrder = filters.sortBy === column && filters.sortOrder === "asc" ? "desc" : "asc";
        setFilters(prev => ({
            ...prev,
            sortBy: column,
            sortOrder: newSortOrder
        }));
    };

    // Function to render sort arrow based on column and sort order
    const renderSortArrow = (column) => {
        if (filters.sortBy === column) {
            return filters.sortOrder === "asc" ? "▲" : "▼"; // segitiga untuk ascending dan descending
        }
        return "";
    };

    const renderChangesAksi = (changes) => {
        try {
            const parsed = JSON.parse(changes);

            if (typeof parsed === "string") {
                return <span>{parsed}</span>;
            }

            let result = "";

            if (parsed.action) {
                result += `${parsed.action}\n`;
            }

            return result;
        } catch (e) {
            return <span>{changes}</span>;
        }

    }
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
            <Sidebar activeMenu={10} />
            <main className="app-main">
                {/*begin::App Content Header*/}
                <div className="app-content-header">
                    {/*begin::Container*/}
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6"><h3 className="mb-0">Laporan Aktivitas User</h3></div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-end">
                                    <li className="breadcrumb-item"><a href="#">Home</a></li>
                                    <li className="breadcrumb-item active" aria-current="page">Laporan Aktivitas User</li>
                                </ol>
                            </div>
                        </div>
                        <div className="app-content">
                            {/*begin::Container*/}
                            <div className="container-fluid">
                                {/*begin::Row*/}
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="d-flex mb-3">
                                            {/* Start and End Date */}
                                            <div className="me-2" style={{ width: "25%" }}>
                                                <label htmlFor="dateawal">Tanggal Awal</label>
                                                <input
                                                    id="dateawal"
                                                    type="date"
                                                    className="form-control form-control-sm"
                                                    name="startDate"
                                                    value={filters.startDate}
                                                    onChange={handleFilterChange}
                                                />
                                            </div>

                                            <div className="me-2 ms-5" style={{ width: "25%" }}>
                                                <label htmlFor="dateakhir">Tanggal Akhir</label>
                                                <input
                                                    id="dateakhir"
                                                    type="date"
                                                    className="form-control form-control-sm"
                                                    name="endDate"
                                                    value={filters.endDate}
                                                    onChange={handleFilterChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-12">
                                        <div className="d-flex mb-3">
                                            <div className="me-2" style={{ width: "15%" }}>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={filters.searchType}
                                                    onChange={e => handleFilterChange(e)}
                                                    name="searchType"
                                                >
                                                    <option value="fullname">Nama</option>
                                                    <option value="email">Email</option>
                                                    <option value="changes">Perubahan</option>
                                                </select>
                                            </div>
                                            <div style={{ width: "50%" }}>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="Keyword Pencarian"
                                                    name="keyword"
                                                    value={filters.keyword}
                                                    onChange={handleFilterChange}
                                                />
                                            </div>
                                            <div style={{ width: "30%" }} className="me-2 ms-3">
                                                {/* <button onClick={handleSearch} className="btn btn-primary">
                                                    Cari
                                                </button> */}

                                                <button className="btn btn-success ms-3" onClick={handleExportExcel}>
                                                    Download .xls
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-12">
                                        {loading ? (
                                            <div className="text-center">Loading...</div>
                                        ) : (
                                            <table className="table table-bordered table-striped">
                                                <thead>
                                                    <tr>
                                                        {/* <th onClick={() => handleSort("id")}>
                                                            ID {filters.sortBy === "id" ? (filters.sortOrder === "asc" ? "▲" : "▼") : ""}
                                                        </th> */}
                                                        <th onClick={() => handleSort("createdAt")}>
                                                            Tanggal {filters.sortBy === "createdAt" ? (filters.sortOrder === "asc" ? "▲" : "▼") : ""}
                                                        </th>
                                                        <th onClick={() => handleSort("fullname")}>
                                                            Nama {filters.sortBy === "fullname" ? (filters.sortOrder === "asc" ? "▲" : "▼") : ""}
                                                        </th>
                                                        <th onClick={() => handleSort("email")}>
                                                            Email {filters.sortBy === "email" ? (filters.sortOrder === "asc" ? "▲" : "▼") : ""}
                                                        </th>
                                                        <th onClick={() => handleSort("ip")}>
                                                            IP {filters.sortBy === "ip" ? (filters.sortOrder === "asc" ? "▲" : "▼") : ""}
                                                        </th>
                                                        <th>Hak Akses</th>
                                                        <th>Perubahan</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {Array.isArray(logs) && logs.length > 0 ? (
                                                        logs.map((log, index) => (
                                                            <tr key={index}>
                                                                {/* <td>{log.id}</td> */}
                                                                <td>{new Date(log.createdAt).toLocaleString("id-ID")}</td>
                                                                <td>{log.fullname || "-"}</td>
                                                                <td>{log.email || "-"}</td>
                                                                <td>{log.ip || "-"}</td>
                                                                <td>{renderChangesAksi(log.changes)}</td>
                                                                <td>{renderChanges(log.changes)}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                    <tr>
                                                        <td colSpan="7" className="text-center">
                                                            Tidak ada data
                                                        </td>
                                                    </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        )}
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <div>Page {filters.page} of {totalPages}</div>
                                            <div>
                                                <button
                                                    className="btn btn-sm btn-secondary me-2"
                                                    disabled={filters.page === 1}
                                                    onClick={() => handlePageChange(filters.page - 1)}
                                                >
                                                    Prev
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    disabled={filters.page === totalPages}
                                                    onClick={() => handlePageChange(filters.page + 1)}
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Jsfunction />
            <Footer />
        </React.Fragment>
    );
}

export default ItReportUserActivity;
