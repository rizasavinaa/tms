import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

import Sidebar from "./sidebarkaryawan";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import useAuthRedirect from "../features/authRedirect";
import Select from "react-select";
import { formatCurrency } from "../utils/format";
import api from "../api/api";

const KaryawanKontrakDetail = () => {
    useAuthRedirect(25);
    const { id } = useParams(); // ID kontrak
    const [activeTab, setActiveTab] = useState("detail");
    const [clients, setClients] = useState([]);
    const [talentId, setTalentId] = useState("");

    const [formData, setFormData] = useState({
        client_id: "",
        salary: "",
        start_date: "",
        end_date: "",
        description: "",
        file_link: "",
    });

    const [logData, setLogData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
    const fileInputRef = useRef(null);
    const [talent, setTalent] = useState({});

    const [isLocked, setIsLocked] = useState(false);
    const [lockedMessage, setLockedMessage] = useState("");

    useEffect(() => {
        const checkProof = async () => {
            try {
                const res = await api.get(`/contracts/${id}/editable`);
                setIsLocked(!res.data.editable); // kunci jika tidak editable
                setLockedMessage(res.data.message);
            } catch (error) {
                console.error("Gagal cek bukti kerja:", error);
            }
        };
        checkProof();
    }, [id]);


    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await api.get(`/clients`);
                let options = res.data.map(c => ({ value: c.id, label: c.name }));

                // Cek apakah opsi "other" sudah ada
                const otherOption = { value: "other", label: "🚫 Perusahaan tidak terdaftar" };
                const exists = options.find(opt => opt.value === "other");
                if (!exists) {
                    options = [otherOption, ...options]; // Tambah di urutan pertama
                }

                setClients(options);
            } catch (error) {
                console.error("Error fetch clients:", error);
            }
        };
        fetchClients();
    }, [id]);

    useEffect(() => {
        api.get(`/contracts/${id}`)
            .then(res => {
                const data = res.data;
                setFormData({
                    client_id: data.client_id === 0 ? "other" : data.client_id,
                    salary: data.salary,
                    start_date: data.start_date?.slice(0, 10) || "",
                    end_date: data.end_date?.slice(0, 10) || "",
                    description: data.description || "",
                    file_link: data.file_link,
                });
                setTalentId(data.talent_id);

                // ✅ Fetch talent berdasarkan talent_id dari porto
                if (data.talent_id) {
                    api.get(`/talents/${data.talent_id}`)
                        .then(res => setTalent(res.data))
                        .catch(error => console.error("Error fetch talent:", error));
                }
            }).catch(err => console.error("Error loading contract:", err));
    }, [id]);

    useEffect(() => {
        if (activeTab === "data") {
            setLoadingLogs(true);
            api.get(`/contracts-log?talent_work_history_id=${id}`)
                .then(res => {
                    setLogData(res.data);
                    setCurrentPage(1);
                }).catch(err => {
                    console.error("Error loading logs:", err);
                    setLogData([]);
                }).finally(() => setLoadingLogs(false));
        }
    }, [activeTab, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD
    //     const isActive = formData.end_date >= today;

    //     if (isActive) {
    //         if (formData.client_id === "other") {
    //             Swal.fire({
    //                 icon: "warning",
    //                 title: "Klien Tidak Valid",
    //                 text: "Kontrak ini bersifat aktif. Harap pilih perusahaan klien yang tersedia."
    //             });
    //             return;
    //         }

    //         // Cek kontrak aktif lain
    //         const check = await api.get(`/contracts-check-active?t=${talentId}&exclude=${id}`);
    //         if (check.data.isActive) {
    //             Swal.fire({
    //                 icon: "warning",
    //                 title: "Kontrak Aktif Ganda",
    //                 text: "Periksa kembali tanggal berakhir. Terdapat kontrak lain yang juga bersifat aktif untuk talent ini."
    //             });
    //             return;
    //         }
    //     } else {
    //         if (formData.client_id === "other" && !formData.description?.trim()) {
    //             Swal.fire({
    //                 icon: "warning",
    //                 title: "Deskripsi Wajib Diisi",
    //                 text: "Harap isi deskripsi jika memilih kontrak ini bersifat riwayat kerja dan perusahaan tidak terdaftar dalam sistem."
    //             });
    //             return;
    //         }
    //     }

    //     // Kirim form jika semua valid
    //     try {
    //         // await api.put(`/contracts/${id}`, formData);

    //         const payload = new FormData();
    //         payload.append("client_id", formData.client_id);
    //         payload.append("salary", formData.salary);
    //         payload.append("start_date", formData.start_date);
    //         payload.append("end_date", formData.end_date);
    //         payload.append("description", formData.description);

    //         // Hanya kirim file jika ada file baru
    //         if (formData.contract_file) {
    //             payload.append("contract_file", formData.contract_file);
    //         }

    //         await api.put(`/contracts/${id}`, payload, {
    //             headers: {
    //                 "Content-Type": "multipart/form-data"
    //             }
    //         });

    //         Swal.fire({
    //             icon: "success",
    //             title: "Berhasil",
    //             text: "Kontrak berhasil diperbarui"
    //         });
    //     } catch (error) {
    //         Swal.fire({
    //             icon: "error",
    //             title: "Gagal",
    //             text: "Terjadi kesalahan saat menyimpan"
    //         });
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // tampilkan loading

        const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD
        const isActive = formData.end_date >= today;
        const startDate = new Date(formData.start_date);
        const endDate = new Date(formData.end_date);

        try {
            if (formData.end_date && endDate < startDate) {
                setLoading(false);
                Swal.fire({
                    icon: "warning",
                    title: "Tanggal tidak valid",
                    text: "Tanggal berakhir tidak boleh lebih kecil dari tanggal mulai.",
                });
                return;
            }
            if (isActive) {
                if (formData.client_id === "other") {
                    Swal.fire({
                        icon: "warning",
                        title: "Klien Tidak Valid",
                        text: "Kontrak ini bersifat aktif. Harap pilih perusahaan klien yang tersedia."
                    });
                    setLoading(false);
                    return;
                }

                // Cek kontrak aktif lain
                const check = await api.get(`/contracts-check-active?t=${talentId}&exclude=${id}`);
                if (check.data.isActive) {
                    Swal.fire({
                        icon: "warning",
                        title: "Kontrak Aktif Ganda",
                        text: "Periksa kembali tanggal berakhir. Terdapat kontrak lain yang juga bersifat aktif untuk talent ini."
                    });
                    setLoading(false);
                    return;
                }
            } else {
                if (formData.client_id === "other" && !formData.description?.trim()) {
                    Swal.fire({
                        icon: "warning",
                        title: "Deskripsi Wajib Diisi",
                        text: "Harap isi deskripsi jika memilih kontrak ini bersifat riwayat kerja dan perusahaan tidak terdaftar dalam sistem."
                    });
                    setLoading(false);
                    return;
                }
            }

            if (isLocked) {
                Swal.fire({
                    icon: "warning",
                    title: "Terkunci",
                    text: lockedMessage || "Kontrak ini tidak bisa diedit."
                });
                return;
            }

            // Kirim form jika semua valid
            const payload = new FormData();
            payload.append("client_id", formData.client_id);
            payload.append("salary", formData.salary);
            payload.append("start_date", formData.start_date);
            payload.append("end_date", formData.end_date);
            payload.append("description", formData.description);

            if (formData.contract_file) {
                payload.append("contract_file", formData.contract_file);
            }

            await api.put(`/contracts/${id}`, payload, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: "Kontrak berhasil diperbarui"
            });

            // Reload data kontrak terbaru tanpa reload full page
            const res = await api.get(`/contracts/${id}`);
            const data = res.data;
            setFormData({
                client_id: data.client_id === 0 ? "other" : data.client_id,
                salary: data.salary,
                start_date: data.start_date?.slice(0, 10) || "",
                end_date: data.end_date?.slice(0, 10) || "",
                description: data.description || "",
                file_link: data.file_link,
            });
            setTalentId(data.talent_id);

            // Reset file input supaya kosong
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: "Terjadi kesalahan saat menyimpan"
            });
        } finally {
            setLoading(false); // sembunyikan loading
        }
    };

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

    const sortedData = [...logData].sort((a, b) => {
        const dir = sortConfig.direction === "asc" ? 1 : -1;
        if (a[sortConfig.key] < b[sortConfig.key]) return -1 * dir;
        if (a[sortConfig.key] > b[sortConfig.key]) return 1 * dir;
        return 0;
    });

    const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const totalPages = Math.ceil(logData.length / rowsPerPage);

    const renderChanges = (changes) => {
        try {
            const parsed = JSON.parse(changes);
            let result = "";

            if (parsed.action) result += `Aksi: ${parsed.action}\n`;
            if (parsed.fields && parsed.values) {
                result += `Field: ${parsed.fields.join(", ")}\nNilai Baru:\n`;
                for (const [k, v] of Object.entries(parsed.values)) {
                    result += `- ${k}: ${v}\n`;
                }
            }
            if (parsed.oldValues && parsed.newValues) {
                result += "Perubahan:\n";
                for (const key of Object.keys(parsed.newValues)) {
                    result += `- ${key}: ${parsed.oldValues[key] ?? "-"} → ${parsed.newValues[key] ?? "-"}\n`;
                }
            }

            return <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{result.trim()}</pre>;
        } catch {
            return <span>{changes}</span>;
        }
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, contract_file: e.target.files[0] }));
    };

    return (
        <React.Fragment>
            <Sidebar activeMenu={8} />
            <main className="app-main">
                <div className="app-content-header container-fluid">
                    <h3 className="mb-3">Rincian Kontrak Kerja</h3>
                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === "detail" ? "active" : ""}`} onClick={() => setActiveTab("detail")}>Detail</button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === "data" ? "active" : ""}`} onClick={() => setActiveTab("data")}>Riwayat Data</button>
                        </li>
                    </ul>

                    <div className="tab-content mt-3">
                        {activeTab === "detail" && (
                            <div className="card p-3">
                                <div className="mb-4 row">
                                    <div className="col-sm-12">
                                        <h5>
                                            {talent.name ? `${talent.name} - ${talent.talent_category?.name || ""}` : "Memuat..."}
                                        </h5>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3 row">
                                        <label className="col-sm-3 col-form-label">Perusahaan Klien</label>
                                        <div className="col-sm-9">
                                            <Select
                                                name="client_id"
                                                options={clients}
                                                value={clients.find(opt => opt.value === formData.client_id) || null}
                                                onChange={selected => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        client_id: selected ? selected.value : ""
                                                    }));
                                                }}
                                                disabled={isLocked}

                                            />

                                        </div>
                                    </div>
                                    <div className="mb-3 row">
                                        <label className="col-sm-3 col-form-label">Gaji</label>
                                        <div className="col-sm-9">
                                            <input name="salary" type="text" className="form-control"
                                                value={formatCurrency(formData.salary)}
                                                onChange={(e) => {
                                                    // Hanya ambil digit, simpan tanpa format ribuan ke state
                                                    const numericValue = e.target.value.replace(/[^\d]/g, "");
                                                    setFormData({ ...formData, salary: numericValue });
                                                }}
                                                disabled={isLocked}
                                                required />
                                        </div>
                                    </div>
                                    <div className="mb-3 row">
                                        <label className="col-sm-3 col-form-label">Tanggal Mulai</label>
                                        <div className="col-sm-9">
                                            <input type="date" name="start_date" className="form-control" value={formData.start_date} onChange={handleChange}
                                                disabled={isLocked}
                                                required />
                                        </div>
                                    </div>
                                    <div className="mb-3 row">
                                        <label className="col-sm-3 col-form-label">Tanggal Berakhir</label>
                                        <div className="col-sm-9">
                                            <input type="date" name="end_date" className="form-control" value={formData.end_date} onChange={handleChange}
                                                disabled={isLocked}
                                                required />
                                        </div>
                                    </div>
                                    <div className="mb-3 row">
                                        <label className="col-sm-3 col-form-label">Catatan</label>
                                        <div className="col-sm-9">
                                            <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} rows={3}
                                                disabled={isLocked} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label className="col-sm-3 col-form-label">Link File</label>
                                        <div className="col-sm-9">
                                            <a
                                                href={formData.file_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="form-control-plaintext text-break"
                                            >
                                                {formData.file_link}
                                            </a>

                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                accept="application/pdf"
                                                className="form-control"
                                                onChange={handleFileChange}
                                                disabled={isLocked}

                                            />
                                            <small className="text-muted d-block mt-1">
                                                ⚠️ Upload file baru akan <strong>menghapus file sebelumnya</strong> secara otomatis.
                                            </small>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label className="col-sm-3 col-form-label"></label>
                                        <div className="col-sm-9">
                                            <button type="submit" className="btn btn-success" disabled={isLocked}>Simpan</button>
                                            {isLocked ? (
                                                <small className="text-muted d-block mt-1">
                                                    ⚠️ {lockedMessage}
                                                </small>
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                    </div>

                                </form>
                            </div>
                        )}
                        {activeTab === "data" && (
                            <div className="card p-3">
                                {loadingLogs ? (
                                    <div className="text-center py-3">
                                        <div className="spinner-border text-primary" />
                                        <p className="mt-2">Mengambil data riwayat...</p>
                                    </div>
                                ) : (
                                    <>
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th onClick={() => handleSort("created_at")} style={{ cursor: "pointer" }}>Tanggal{getSortIndicator("created_at")}</th>
                                                    <th onClick={() => handleSort("user")} style={{ cursor: "pointer" }}>User{getSortIndicator("user")}</th>
                                                    <th onClick={() => handleSort("ip")} style={{ cursor: "pointer" }}>IP{getSortIndicator("ip")}</th>
                                                    <th>Perubahan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedData.map((log, i) => (
                                                    <tr key={i}>
                                                        <td>{new Date(log.created_at).toLocaleString("id-ID")}</td>
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

export default KaryawanKontrakDetail;
