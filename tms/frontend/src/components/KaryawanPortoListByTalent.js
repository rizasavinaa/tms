import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { Link } from "react-router-dom";

const KaryawanPortoListByTalent = ({ talentId }) => {

    const [portos, setPortos] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("name");
    const [sortColumn, setSortColumn] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const portoPerPage = 10;
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/portopks/talent/${talentId}`)
            .then(response => setPortos(response.data))
            .catch(error => console.error("Gagal mengambil data portofolio", error));

        const successMessage = sessionStorage.getItem("successMessage");
        if (successMessage) {
            Swal.fire("Sukses", successMessage, "success");
            sessionStorage.removeItem("successMessage");
        }
    }, []);

    const handleSort = (column) => {
        const order = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortOrder(order);
    };

    const handleDelete = async (id) => {
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
                setLoading(true); // ⬅️ Aktifkan overlay
                await axios.delete(`${process.env.REACT_APP_API_URL}/portopks/${id}`);
                setPortos(prev => prev.filter(p => p.id !== id));
                Swal.fire("Dihapus!", "Portofolio berhasil dihapus.", "success");
            } catch (error) {
                const msg = error.response?.data?.message || "Terjadi kesalahan saat menghapus.";
                Swal.fire("Gagal", msg, "error");
            } finally {
                setLoading(false); // ⬅️ Matikan overlay
            }
        }
    };



    const filteredPortos = portos.filter(porto => {
        const value = porto[filter]?.toString().toLowerCase() || "";
        return value.includes(search.toLowerCase());
    });

    const sortedPortos = [...filteredPortos].sort((a, b) => {
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];
        if (typeof valueA === "string") valueA = valueA.toLowerCase();
        if (typeof valueB === "string") valueB = valueB.toLowerCase();
        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    const indexOfLast = currentPage * portoPerPage;
    const indexOfFirst = indexOfLast - portoPerPage;
    const currentPortos = sortedPortos.slice(indexOfFirst, indexOfLast);

    return (
        <React.Fragment>

            <div className="row">
                <div className="col-sm-12">
                    <div className="d-flex mb-3">
                        <div className="me-2" style={{ width: "20%" }}>
                            <select
                                className="form-select form-select-sm me-2"
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                            >
                                <option value="id">ID</option>
                                <option value="name">Nama File</option>
                                <option value="description">Deskripsi</option>
                            </select>
                        </div>
                        <div className="me-2" style={{ width: "60%" }}>
                            <input
                                type="text"
                                className="form-control form-control-sm me-2"
                                placeholder="Cari..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />

                        </div>
                        <div className="me-2" style={{ width: "20%" }}>
                            <Link to={`/karyawan/porto-register/${talentId}`} className="btn btn-success btn-sm">
                                Tambah Portofolio
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="col-sm-12 mt-2">
                    <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                {[
                                    { key: 'id', label: 'ID' },
                                    { key: 'name', label: 'Nama File' },
                                    { key: 'description', label: 'Deskripsi' },
                                    { key: 'createdAt', label: 'Tanggal Upload' }
                                ].map(col => (
                                    <th key={col.key} onClick={() => handleSort(col.key)} className="sortable" style={{ cursor: "pointer" }}>
                                        {col.label} {sortColumn === col.key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                                    </th>
                                ))}
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPortos.map(porto => (
                                <tr key={porto.id}>
                                    <td>{porto.id}</td>
                                    <td>{porto.name}</td>
                                    <td>{porto.description}</td>
                                    <td>{new Date(porto.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</td>
                                    <td>
                                        <a
                                            href={`${porto.file_link.replace("/upload/", "/upload/fl_attachment/")}`}
                                            className="btn btn-sm btn-info me-1"
                                            title="Download"
                                            download
                                        >
                                            <i className="fas fa-download"></i>
                                        </a>

                                        <a href={`/karyawan/porto-pk/${porto.id}`} className="btn btn-secondary btn-sm me-1">Lihat Detail</a>
                                        <button onClick={() => handleDelete(porto.id)} className="btn btn-danger btn-sm">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                        {[...Array(Math.ceil(filteredPortos.length / portoPerPage))].map((_, index) => (
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

export default KaryawanPortoListByTalent;

