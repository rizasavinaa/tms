import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Sidebar from "./sidebarpayroll";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import useAuthRedirect from "../features/authRedirect";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatCurrency } from "../utils/format";
import withReactContent from "sweetalert2-react-content";
import api from "../api/api";

const PayBuktiKerjaList = () => {
    useAuthRedirect(33);
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
    const MySwal = withReactContent(Swal);

    const validationStatusMap = {
        0: "New",
        1: "Validated",
        2: "Rejected",
    };

    const paymentStatusMap = {
        0: "Unpaid",
        1: "Paid",
    };

    const getFilterValue = (proof, filter) => {
        switch (filter) {
            case "client_name":
                return proof.client?.name?.toLowerCase() || "";
            case "talent_name":
                return proof.talent?.name?.toLowerCase() || "";
            case "category":
                return proof.talent_work_history?.category?.toLowerCase() || "";
            default:
                return (proof[filter]?.toString().toLowerCase()) || "";
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/workproofs`);
                const data = response?.data.data;
                if (Array.isArray(data)) {
                    setProofs(data);
                } else {
                    setProofs([]);
                    console.warn("Data bukti kerja bukan array:", data);
                }
            } catch (error) {
                console.error("Gagal mengambil data bukti kerja:", error);
                setProofs([]);
                Swal.fire({
                    icon: "error",
                    title: "Gagal",
                    text: "Gagal mengambil data bukti kerja",
                });
            }
        };
        fetchData();

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
    }, []);

    const handleSort = (column) => {
        const order = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortOrder(order);
    };

    // Filter data berdasarkan pencarian dan tanggal mulai & berakhir
    const filteredProofs = Array.isArray(proofs)
        ? proofs.filter((proof) => {
            const value = getFilterValue(proof, filter);
            const matchesSearch = value.includes(search.toLowerCase());

            // Filter tanggal mulai (jika diisi)
            const matchesStartDate =
                !filterStartDate || new Date(proof.start_date) >= new Date(filterStartDate);

            // Filter tanggal berakhir (jika diisi)
            const matchesEndDate =
                !filterEndDate || new Date(proof.end_date) <= new Date(filterEndDate);

            return matchesSearch && matchesStartDate && matchesEndDate;
        })
        : [];


    // Sortir data (aman untuk tanggal string)
    const getSortValue = (proof, sortColumn) => {
        switch (sortColumn) {
            case "client_name":
                return proof.client?.name?.toLowerCase() || "";
            case "talent_name":
                return proof.talent?.name?.toLowerCase() || "";
            case "category":
                return proof.talent_work_history?.category?.toLowerCase() || "";
            case "start_date":
            case "end_date":
                return new Date(proof[sortColumn]).getTime();
            default:
                return (proof[sortColumn]?.toString().toLowerCase()) || "";
        }
    };

    const sortedProofs = [...filteredProofs].sort((a, b) => {
        const valueA = getSortValue(a, sortColumn);
        const valueB = getSortValue(b, sortColumn);

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

    const handleExportExcel = async () => {
        setLoading(true);
        try {
            // Encode semua query params untuk URL
            const params = new URLSearchParams({
                // talent_id: id,
                startDate: filterStartDate || "",
                endDate: filterEndDate || "",
                filter,
                search,
                sortColumn,
                sortOrder,
            });

            const response = await api.get(`/report-bukti-kerja?${params.toString()}`, {
                responseType: 'blob', // penting supaya data diterima sebagai file
            });

            // Buat link download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'laporan_bukti_kerja.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: "Gagal mengekspor data ke Excel",
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentProcessed = async (proofId) => {
        const { value: date } = await Swal.fire({
            title: "Tanggal Pembayaran",
            html: `
      <input type="date" id="payment-date" 
        class="swal2-input" 
        style="max-width: 250px; margin-top: 10px;" />
    `,
            showCancelButton: true,
            confirmButtonText: "Proses Pembayaran",
            focusConfirm: false,
            preConfirm: () => {
                const inputDate = document.getElementById("payment-date").value;
                if (!inputDate) {
                    Swal.showValidationMessage("Tanggal pembayaran wajib diisi");
                }
                return inputDate;
            },
        });


        if (date) {
            setLoading(true);
            try {
                await api.patch(`/workproofs/paid/${proofId}`, {
                    payment_status: 1,
                    payment_date: date,
                });

                Swal.fire("Berhasil", "Status pembayaran telah diperbarui", "success").then(() => {
                    window.location.reload();
                });
            } catch (error) {
                console.error("Gagal update:", error);
                Swal.fire("Gagal", "Gagal memperbarui status pembayaran", "error");
            } finally {
                setLoading(false); // matikan loading
            }
        }
    };

    return (
        <React.Fragment>
            <Sidebar activeMenu={1} />
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6">
                                <h3>Bayarkan Gaji</h3>
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
                                                    <option value="talent_name">Nama Pekerja Kreatif</option>
                                                    <option value="category">Posisi</option>
                                                </select>
                                            </div>
                                            <div className="me-2" style={{ width: "20%" }}>
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
                                            {/* <div className="me-2">
                                                <button
                                                    className="btn btn-success btn-sm me-2"
                                                    onClick={handleExportExcel}
                                                >
                                                    Download .xls
                                                </button>
                                            </div> */}
                                        </div>
                                    </div>
                                    <div className="col-sm-12 mt-2">
                                        <table className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    {[
                                                        { key: "id", label: "ID" },
                                                        { key: "client_name", label: "Nama Perusahaan" },
                                                        { key: "talent_name", label: "Nama Pekerja Kreatif" },
                                                        { key: "category", label: "Posisi" },
                                                        { key: "salary", label: "Gaji" },
                                                        { key: "end_date", label: "Tanggal Akhir Periode" },
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
                                                    <th>Pembayaran</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentProofs.map((proof) => (
                                                    <tr key={proof.id}>
                                                        <td>{proof.id}</td>
                                                        <td>{proof.client.name || "-"}</td>
                                                        <td>{proof.talent.name + " (" + proof.talent.bank_account + ")" || "-"}</td>
                                                        <td>{proof.talent_work_history.category || "-"}</td>
                                                        <td>{formatCurrency(proof.talent_work_history.salary)}</td>
                                                        <td>{new Date(proof.end_date).toLocaleDateString("id-ID")}</td>
                                                        <td>
                                                            {proof.payment_status === 1 ? (
                                                                "Paid"
                                                            ) : (
                                                                <button
                                                                    onClick={() => handlePaymentProcessed(proof.id)}
                                                                    className="btn btn-secondary btn-sm me-1"
                                                                >
                                                                    Pembayaran Telah Diproses
                                                                </button>
                                                            )}

                                                        </td>
                                                    </tr>
                                                ))}
                                                {currentProofs.length === 0 && (
                                                    <tr>
                                                        <td colSpan={9} className="text-center">
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

export default PayBuktiKerjaList;
