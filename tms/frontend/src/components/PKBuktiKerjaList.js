import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Sidebar from "./sidebarpekerjakreatif";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import useAuthRedirect from "../features/authRedirect";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/api";

const PKBuktiKerjaList = () => {
    useAuthRedirect(30);
    const { user } = useSelector((state) => state.auth);
    const id = user?.talent_id;
    const [proofs, setProofs] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("id");
    const [sortColumn, setSortColumn] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const proofsPerPage = 10;
    const [loading, setLoading] = useState(false);

    // Filter tanggal mulai dan berakhir
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");

    const validationStatusMap = {
        0: "New",
        1: "Validated",
        2: "Rejected",
    };

    const paymentStatusMap = {
        0: "Unpaid",
        1: "Paid",
    };

    useEffect(() => {
        if (!id) return; // ⛔ Jangan jalan kalau id belum tersedia

        api
            .get(`/workproofs/talent/${id}`)
            .then((response) => setProofs(response.data.data))
            .catch((error) => console.error("Gagal mengambil data bukti kerja", error));

        const successMessage = sessionStorage.getItem("successMessage");
        if (successMessage) {
            Swal.fire({
                icon: "success",
                title: "Sukses",
                text: successMessage,
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
            }).then(() => {
                window.location.reload();
            });
            sessionStorage.removeItem("successMessage");
        }
    }, [id]);


    const handleSort = (column) => {
        const order = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortOrder(order);
    };

    const handleDelete = async (id, validationStatus) => {
        if (validationStatus !== 0) return;

        const confirm = await Swal.fire({
            title: "Yakin menghapus?",
            text: "Data yang dihapus tidak dapat dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Hapus",
            cancelButtonText: "Batal",
        });

        if (confirm.isConfirmed) {
            try {
                setLoading(true);
                await api.delete(`/workproofs/${id}`);
                setProofs((prev) => prev.filter((p) => p.id !== id));
                Swal.fire("Dihapus!", "Bukti kerja berhasil dihapus.", "success");
            } catch (error) {
                const msg = error.response?.data?.message || "Terjadi kesalahan saat menghapus.";
                Swal.fire("Gagal", msg, "error");
            } finally {
                setLoading(false);
            }
        }
    };

    // Filter data berdasarkan pencarian dan tanggal mulai & berakhir
    const filteredProofs = proofs.filter((proof) => {
        // Filter kolom search text
        const value = proof[filter]?.toString().toLowerCase() || "";
        const matchesSearch = value.includes(search.toLowerCase());

        // Filter tanggal mulai (jika diisi)
        const matchesStartDate =
            !filterStartDate || new Date(proof.start_date) >= new Date(filterStartDate);

        // Filter tanggal berakhir (jika diisi)
        const matchesEndDate =
            !filterEndDate || new Date(proof.end_date) <= new Date(filterEndDate);

        return matchesSearch && matchesStartDate && matchesEndDate;
    });

    // Sortir data (aman untuk tanggal string)
    const sortedProofs = [...filteredProofs].sort((a, b) => {
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];

        if (sortColumn === "start_date" || sortColumn === "end_date") {
            valueA = new Date(valueA).getTime();
            valueB = new Date(valueB).getTime();
        }

        if (typeof valueA === "string") valueA = valueA.toLowerCase();
        if (typeof valueB === "string") valueB = valueB.toLowerCase();

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    // Pagination
    const indexOfLast = currentPage * proofsPerPage;
    const indexOfFirst = indexOfLast - proofsPerPage;
    const currentProofs = sortedProofs.slice(indexOfFirst, indexOfLast);

    // Reset semua filter dan search
    const resetFilters = () => {
        setSearch("");
        setFilter("id");
        setFilterStartDate("");
        setFilterEndDate("");
        setSortColumn("id");
        setSortOrder("asc");
        setCurrentPage(1);
    };

    return (
        <React.Fragment>
            <Sidebar activeMenu={5} />
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6">
                                <h3>Data Bukti Kerja</h3>
                            </div>
                        </div>
                        <div className="app-content">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="d-flex mb-3 flex-wrap align-items-center">
                                            <div className="me-2" style={{ width: "15%" }}>
                                                <small className="invisible mb-1">Search</small>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={filter}
                                                    onChange={(e) => setFilter(e.target.value)}
                                                >
                                                    <option value="id">ID</option>
                                                    <option value="client_name">Nama Perusahaan</option>
                                                </select>
                                            </div>
                                            <div className="me-2" style={{ width: "25%" }}>
                                                <small className="invisible mb-1">Search</small>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="Cari..."
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                />
                                            </div>
                                            <div className="me-2" style={{ width: "20%" }}>
                                                <small className="text-muted">Periode Mulai</small>
                                                <input
                                                    type="date"
                                                    className="form-control form-control-sm"
                                                    placeholder="Tanggal Mulai"
                                                    value={filterStartDate}
                                                    onChange={(e) => setFilterStartDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="me-2" style={{ width: "20%" }}>
                                                <small className="text-muted">Periode Berakhir</small>
                                                <input
                                                    type="date"
                                                    className="form-control form-control-sm"
                                                    placeholder="Tanggal Berakhir"
                                                    value={filterEndDate}
                                                    onChange={(e) => setFilterEndDate(e.target.value)}
                                                />
                                            </div>


                                            <div className="me-2">
                                                <button className="btn btn-secondary btn-sm" onClick={resetFilters}>
                                                    Reset Filter
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-12 mt-2">
                                        <table className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    {[
                                                        { key: "id", label: "ID" },
                                                        { key: "client_name", label: "Nama Perusahaan" },
                                                        { key: "start_date", label: "Periode Mulai" },
                                                        { key: "end_date", label: "Periode Berakhir" },
                                                        { key: "validation_status", label: "Status Penilaian" },
                                                        { key: "payment_status", label: "Status Pembayaran" },
                                                    ].map((col) => (
                                                        <th
                                                            key={col.key}
                                                            onClick={() => handleSort(col.key)}
                                                            className="sortable"
                                                            style={{ cursor: "pointer" }}
                                                        >
                                                            {col.label}{" "}
                                                            {sortColumn === col.key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                                                        </th>
                                                    ))}
                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentProofs.map((proof) => (
                                                    <tr key={proof.id}>
                                                        <td>{proof.id}</td>
                                                        <td>{proof.client_name}</td>
                                                        <td>{new Date(proof.start_date).toLocaleDateString("id-ID")}</td>
                                                        <td>{new Date(proof.end_date).toLocaleDateString("id-ID")}</td>
                                                        <td>{validationStatusMap[proof.validation_status] || "Unknown"}</td>
                                                        <td>{paymentStatusMap[proof.payment_status] || "Unknown"}</td>
                                                        <td>
                                                            <a
                                                                href={`/pekerjakreatif/bukti-kerja/${proof.id}`}
                                                                className="btn btn-secondary btn-sm me-1"
                                                            >
                                                                Lihat Detail
                                                            </a>
                                                            {proof.validation_status === 0 && (
                                                                <button
                                                                    onClick={() => handleDelete(proof.id, proof.validation_status)}
                                                                    className="btn btn-danger btn-sm"
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {currentProofs.length === 0 && (
                                                    <tr>
                                                        <td colSpan={7} className="text-center">
                                                            Tidak ada data
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        <div className="pagination">
                                            {[...Array(Math.ceil(filteredProofs.length / proofsPerPage))].map((_, index) => (
                                                <button
                                                    key={index}
                                                    className={`btn btn-sm ${currentPage === index + 1 ? "btn-primary" : "btn-light"}`}
                                                    onClick={() => setCurrentPage(index + 1)}
                                                >
                                                    {index + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
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
        </React.Fragment>
    );
};

export default PKBuktiKerjaList;
