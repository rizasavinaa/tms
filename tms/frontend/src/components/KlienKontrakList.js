import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import useAuthRedirect from "../features/authRedirect";
import Sidebar from "./sidebarclient";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const KaryawanKontrakList = () => {
    useAuthRedirect(25);
    const { user } = useSelector((state) => state.auth);
    const id = user?.client_id;
    const [contracts, setContracts] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("id");
    const [sortColumn, setSortColumn] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user || !user.client_id) return; // ⬅️ tambahkan guard clause

        setLoading(true);
         axios.get(`${process.env.REACT_APP_API_URL}/talents-clients/${id}`)
            .then(response => setContracts(response.data))
            .catch(error => console.error("Gagal mengambil data kontrak", error))
            .finally(() => setLoading(false));
    }, [user]);

    const handleSort = (column) => {
        const order = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortOrder(order);
    };

    const filteredContracts = contracts.filter(item => {
        let value = "";
        if (filter === "client_name") {
            value = item.client?.name?.toLowerCase() || "";
        }
        else if (filter === "talent_name") {
            value = item.talent?.name?.toLowerCase() || "";
        }
        else {
            value = item[filter]?.toString().toLowerCase() || "";
        }
        return value.includes(search.toLowerCase());
    });

    const sortedContracts = [...filteredContracts].sort((a, b) => {
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];
        if (typeof valueA === "string") valueA = valueA.toLowerCase();
        if (typeof valueB === "string") valueB = valueB.toLowerCase();
        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    const indexOfLast = currentPage * perPage;
    const indexOfFirst = indexOfLast - perPage;
    const currentContracts = sortedContracts.slice(indexOfFirst, indexOfLast);

    return (
        <React.Fragment>
            <Sidebar activeMenu={3} />
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6"><h3>Data Kontrak Kerja</h3></div>
                        </div>
                        <div className="app-content">
                            <div className="container-fluid">
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
                                                    <option value="name">Nama Talent</option>
                                                    <option value="category">Posisi</option>
                                                </select>
                                            </div>
                                            <div className="me-2" style={{ width: "80%" }}>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="Cari..."
                                                    value={search}
                                                    onChange={e => setSearch(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-12 mt-2">
                                        <table className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    {[
                                                        { key: 'id', label: 'ID' },
                                                        { key: 'talent_name', label: 'Nama Talent' },
                                                        { key: 'category', label: 'Posisi' },
                                                        { key: 'start_date', label: 'Tanggal Mulai' },
                                                        { key: 'end_date', label: 'Tanggal Berakhir' }
                                                    ].map(col => (
                                                        <th key={col.key} onClick={() => handleSort(col.key)} className="sortable" style={{ cursor: "pointer" }}>
                                                            {col.label} {sortColumn === col.key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                                                        </th>
                                                    ))}
                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentContracts.map(item => (
                                                    <tr key={item.id}>
                                                        <td>{item.id}</td>
                                                        <td>{item.name}</td>
                                                        <td>{item.category}</td>
                                                        <td>{new Date(item.start_date).toLocaleDateString('id-ID')}</td>
                                                        <td>{new Date(item.end_date).toLocaleDateString('id-ID')}</td>
                                                        <td>
                                                            <a
                                                                href={`${item.file_link.replace("/upload/", "/upload/fl_attachment/")}`}
                                                                className="btn btn-sm btn-info me-1"
                                                                title="Download"
                                                                download
                                                            >
                                                                <i className="fas fa-download"></i>
                                                            </a>
                                                            {user?.role_id !== 4 && (
                                                            <Link to={`/karyawan/kontrak/${item.id}`} className="btn btn-secondary btn-sm">
                                                                Lihat Detail
                                                            </Link>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="pagination">
                                            {[...Array(Math.ceil(filteredContracts.length / perPage))].map((_, index) => (
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

export default KaryawanKontrakList;
