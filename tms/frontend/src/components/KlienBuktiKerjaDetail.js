import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Sidebar from "./sidebarclient";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import useAuthRedirect from "../features/authRedirect";
import Swal from "sweetalert2";
import api from "../api/api";


const KlienBuktiKerjaDetail = () => {
    useAuthRedirect(30);
    const { id } = useParams(); // workproof_id
    const [activeTab, setActiveTab] = useState("detail");
    const [data, setData] = useState(null);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [logData, setLogData] = useState([]);
    const [loadingData, setLoadingData] = useState(true);      // saat ambil data awal
    const [loadingSubmit, setLoadingSubmit] = useState(false); // saat submit validasi
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
    const rowsPerPage = 10;
    const [isDisabled, setIsDisabled] = useState(false);

    const validationStatusMap = {
        0: "New",
        1: "Validated",
        2: "Rejected",
    };

    const paymentStatusMap = {
        0: "Unpaid",
        1: "Paid",
    };


    const [formData, setFormData] = useState({
        start_date: "",
        end_date: "",
        description: "",
        file: null,
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoadingData(true);
        try {
            const res = await api.get(`/workproofs/${id}`);
            const wp = res.data;
            setData(wp);
            setFormData({
                start_date: wp.start_date?.split("T")[0] || "",
                end_date: wp.end_date?.split("T")[0] || "",
                description: wp.description || "",
                file: null,
            });
            setIsDisabled(wp.validation_status === 1);
            // if (wp.validation_status === 1) {
            //     Swal.fire({
            //         icon: 'info',
            //         title: 'Sudah Divalidasi',
            //         text: 'Data ini telah divalidasi dan tidak bisa diubah lagi.',
            //     });
            // }
        } catch (err) {
            console.error("Gagal mengambil data:", err);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        setLogData([]);         // Clear log data
        setLoadingLogs(true);   // Start loading

        const fetchLogs = async () => {
            try {
                let endpoint = "";
                if (activeTab === "riwayat") {
                    endpoint = `/workproofs-log?talent_work_proof_id=${id}`;
                }

                if (endpoint) {
                    const response = await api.get(endpoint);
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

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "file") {
            setFormData((prev) => ({ ...prev, file: files[0] }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi: status harus dipilih (1 atau 2)
        if (![1, 2].includes(formData.validation_status)) {
            Swal.fire({
                icon: "warning",
                title: "Status Validasi Diperlukan",
                text: "Silakan pilih apakah bukti kerja diterima atau ditolak.",
            });
            return;
        }

        // Validasi: pesan harus diisi untuk semua status
        if (!formData.validation_message?.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Pesan Validasi Diperlukan",
                text: "Silakan isi pesan validasi terlebih dahulu.",
            });
            return;
        }
        setLoadingSubmit(true); // aktifkan loading sebelum request

        try {
            const { data } = await api.put(`/workproofs/validate/${id}`, {
                validation_status: formData.validation_status,
                validation_message: formData.validation_message,
            });

            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: "Validasi bukti kerja berhasil disimpan.",
                showConfirmButton: false,
                timer: 1500,
                willClose: () => {
                    window.location.reload();
                }
            });

        } catch (error) {
            console.error("Gagal validasi:", error);

            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: error.response?.data?.message || "Terjadi kesalahan saat menyimpan validasi.",
            });

        } finally {
            setLoadingSubmit(false); // nonaktifkan loading setelah request selesai
        }

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
    if (loadingData || !data) return null;

    return (
        <React.Fragment>
            <Sidebar activeMenu={2} />
            {loadingSubmit && (
                <div className="overlay-loading">
                    <div className="loading-content">
                        <div className="spinner-border text-light mb-3"></div>
                        <p>Memproses...</p>
                    </div>
                </div>
            )}
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <h3 className="mb-3">Detail Bukti Kerja</h3>

                        <ul className="nav nav-tabs mb-3">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === "detail" ? "active" : ""}`}
                                    onClick={() => setActiveTab("detail")}
                                >
                                    Detail
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === "riwayat" ? "active" : ""}`}
                                    onClick={() => setActiveTab("riwayat")}
                                >
                                    Riwayat Data
                                </button>
                            </li>
                        </ul>

                        {activeTab === "detail" && (
                            <div className="card p-3">
                                <div className="row">
                                    {/* Kolom Kiri: Data Detail */}
                                    <div className="col-md-9">
                                        <div className="mb-3 row">
                                            <label className="col-sm-3 col-form-label">Nama Perusahaan</label>
                                            <div className="col-sm-9">
                                                <p className="form-control-plaintext">{data.client.name || "-"}</p>
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-sm-3 col-form-label">Gaji</label>
                                            <div className="col-sm-9">
                                                <p className="form-control-plaintext">
                                                    {data.salary ? `Rp ${Number(data.salary).toLocaleString("id-ID")}` : "-"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-sm-3 col-form-label">Status Validasi</label>
                                            <div className="col-sm-9">
                                                {validationStatusMap[data.validation_status] || "Unknown"}
                                            </div>
                                        </div>
                                        {data.validation_status !== 0 && (
                                            <div className="mb-3 row">
                                                <label className="col-sm-3 col-form-label">Pesan Validasi dari SPV Klien</label>
                                                <div className="col-sm-9">
                                                    <p className="form-control-plaintext">{data.validation_message || "-"}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="mb-3 row">
                                            <label className="col-sm-3 col-form-label">Status Pembayaran</label>
                                            <div className="col-sm-9">
                                                {paymentStatusMap[data.payment_status] || "Unknown"}
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-sm-3 col-form-label">Tanggal Mulai</label>
                                            <div className="col-sm-9">
                                                <p className="form-control-plaintext">{formData.start_date || "-"}</p>
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-sm-3 col-form-label">Tanggal Berakhir</label>
                                            <div className="col-sm-9">
                                                <p className="form-control-plaintext">{formData.end_date || "-"}</p>
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-sm-3 col-form-label">Catatan</label>
                                            <div className="col-sm-9">
                                                <p className="form-control-plaintext">{formData.description || "-"}</p>
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-sm-3 col-form-label">File</label>
                                            <div className="col-sm-9">
                                                {data.file_link ? (
                                                    <a href={data.file_link} target="_blank" rel="noreferrer">{data.file_link}</a>
                                                ) : (
                                                    <span className="text-muted">Tidak ada file</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Kolom Kanan: Validasi */}
                                    {data.validation_status === 0 ? (
                                        <div className="col-md-3 border-start">
                                            <div className="mb-3">
                                                <label className="form-label">Status Validasi</label>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className={`btn btn-outline-success btn-sm w-100 ${formData.validation_status === 1 ? "active" : ""}`}
                                                        onClick={() => setFormData({ ...formData, validation_status: 1 })}
                                                    >
                                                        Valid
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`btn btn-outline-danger btn-sm w-100 ${formData.validation_status === 2 ? "active" : ""}`}
                                                        onClick={() => setFormData({ ...formData, validation_status: 2 })}
                                                    >
                                                        Tolak
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Pesan Validasi</label>
                                                <textarea
                                                    name="validation_message"
                                                    className="form-control"
                                                    rows="4"
                                                    value={formData.validation_message || ""}
                                                    onChange={handleChange}
                                                    required
                                                ></textarea>
                                            </div>

                                            <button type="submit" className="btn btn-success w-100" onClick={handleSubmit}>Simpan</button>
                                        </div>
                                    ) : (
                                        <div className="col-md-3 border-start">
                                            <div className="mb-3">
                                                <label className="form-label">Status Validasi</label>
                                                <p className="form-control-plaintext">
                                                    {data.validation_status === 1 ? "Valid" : data.validation_status === 2 ? "Ditolak" : "-"}
                                                </p>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Pesan Validasi</label>
                                                <p className="form-control-plaintext">
                                                    {data.validation_message || "-"}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "riwayat" && (
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
            <Jsfunction />
        </React.Fragment>
    );
};

export default KlienBuktiKerjaDetail;
