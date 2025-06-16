import React, { useEffect, useState } from "react";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import useAuthRedirect from "../features/authRedirect";
import Sidebar from "./sidebarkaryawan";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function KaryawanReportRetensi() {
    useAuthRedirect(27);
    const [data, setData] = useState([]);
    const [filterKey, setFilterKey] = useState("id");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Pagination & sorting states
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [sortKey, setSortKey] = useState("id");
    const [sortOrder, setSortOrder] = useState("desc");
    const [from, setFrom] = useState(0);
    const [to, setTo] = useState(0);


    // Fetch data from API
    async function fetchData() {
        setLoading(true);
        try {
            const params = {
                filterKey,
                search,
                page,
                limit,
                sortKey,
                sortOrder,
            };
            const res = await api.get(`/laporan-retensi`, { params });
            setData(res.data.data || []);
            setTotal(res.data.total || 0);
            const start = (page - 1) * limit + 1;
            const end = Math.min(start + limit - 1, res.data.total || 0);
            setFrom(start);
            setTo(end);
        } catch (error) {
            console.error("Error fetching retention report:", error);
            setData([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchData();
        }, 500); // debounce 500ms

        return () => clearTimeout(timeout);
    }, [search, filterKey, page, sortKey, sortOrder]);


    // Export to Excel
    const exportExcel = () => {
        const worksheetData = data.map((item) => ({
            "ID Kontrak": item.id,
            "Nama Perusahaan": item.client?.name || "-",
            "Nama Pekerja Kreatif": item.talent?.name || "-",
            Posisi: item.category || "-",
            "Tanggal Mulai Kontrak": item.start_date,
            "Tanggal Berakhir Kontrak": item.end_date,
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Retensi");
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        const blob = new Blob([excelBuffer], {
            type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
        saveAs(blob, "laporan_retensi.xlsx");
    };

    // Handle sorting on column header click
    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    // Render pagination
    const totalPages = Math.ceil(total / limit);
    const renderPagination = () => (
        <div className="d-flex justify-content-between align-items-center mt-3">
            <div>Page {page} of {totalPages}</div>
            <div>
                <button
                    className="btn btn-sm btn-secondary me-2"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                    Prev
                </button>
                <button
                    className="btn btn-sm btn-secondary"
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                >
                    Next
                </button>
            </div>
        </div>
    );


    return (
        <React.Fragment>
            {/* Overlay Loading */}
            {loading && (
                <div className="overlay-loading">
                    <div className="loading-content">
                        <div className="spinner-border text-light mb-3"></div>
                        <p>Memproses...</p>
                    </div>
                </div>
            )}
            <Sidebar activeMenu={9} />
            {/*begin::App Main*/}
            <main className="app-main">
                <div className="container-fluid p-3">
                    <h2>Laporan Retensi</h2>

                    {/* Filter */}
                    <div className="row mb-3 align-items-end">
                        <div className="col-md-3">
                            <label htmlFor="filterKey" className="form-label">
                                Cari Berdasarkan
                            </label>
                            <select
                                id="filterKey"
                                className="form-select"
                                value={filterKey}
                                onChange={(e) => setFilterKey(e.target.value)}
                            >
                                <option value="id">ID</option>
                                <option value="client_name">Nama Perusahaan</option>
                                <option value="talent_name">Nama Pekerja Kreatif</option>
                                <option value="category">Posisi</option>
                            </select>
                        </div>
                        <div className="col-md-7">
                            <label htmlFor="searchInput" className="form-label">
                                Kata Kunci
                            </label>
                            <input
                                id="searchInput"
                                type="text"
                                className="form-control"
                                placeholder="Keyword pencarian"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="col-md-2 d-flex justify-content-end">
                            <button className="btn btn-success" onClick={exportExcel}>
                                Download .xls
                            </button>
                        </div>
                    </div>


                    {/* Table */}
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover table-sm">
                            <thead className="table-light">
                                <tr>
                                    <th
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleSort("id")}
                                    >
                                        ID Kontrak {sortKey === "id" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                                    </th>
                                    <th
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleSort("client.name")}
                                    >
                                        Nama Perusahaan {sortKey === "client.name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                                    </th>
                                    <th
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleSort("talent.name")}
                                    >
                                        Nama Pekerja Kreatif {sortKey === "talent.name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                                    </th>
                                    <th
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleSort("category")}
                                    >
                                        Posisi {sortKey === "category" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                                    </th>
                                    <th
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleSort("start_date")}
                                    >
                                        Tanggal Mulai {sortKey === "start_date" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                                    </th>
                                    <th
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleSort("end_date")}
                                    >
                                        Tanggal Berakhir {sortKey === "end_date" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                                    </th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center">
                                            Tidak ada data
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td>{item.client?.name || "-"}</td>
                                            <td>{item.talent?.name || "-"}</td>
                                            <td>{item.category || "-"}</td>
                                            <td>{new Date(item.start_date).toLocaleDateString('id-ID')}</td>
                                            <td>{new Date(item.end_date).toLocaleDateString('id-ID')}</td>
                                            <td>
                                                <Link to={`/karyawan/kontrak/${item.id}`} className="btn btn-secondary btn-sm">
                                                    Lihat Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}

                    {renderPagination()}

                </div>
            </main>
            <Jsfunction />
            <Footer />
            
        </React.Fragment>
    );
}
