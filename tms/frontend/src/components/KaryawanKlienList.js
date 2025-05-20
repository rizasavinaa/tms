import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import useAuthRedirect from "../features/authRedirect";
import Sidebar from "./sidebarkaryawan";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { Link } from "react-router-dom";

const KaryawanKlienList = () => {
    useAuthRedirect(21);
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("name");
    const [sortColumn, setSortColumn] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const clientsPerPage = 10;

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/clients`)
            .then(response => setClients(response.data))
            .catch(error => console.error("Gagal mengambil data perusahaan klien", error));

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

    const filteredClients = clients.filter(client => {
        const value = client[filter]?.toString().toLowerCase() || "";
        return value.includes(search.toLowerCase());
    });

    const sortedClients = [...filteredClients].sort((a, b) => {
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];

        if (typeof valueA === "string") valueA = valueA.toLowerCase();
        if (typeof valueB === "string") valueB = valueB.toLowerCase();

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    const indexOfLastClient = currentPage * clientsPerPage;
    const indexOfFirstClient = indexOfLastClient - clientsPerPage;
    const currentClients = sortedClients.slice(indexOfFirstClient, indexOfLastClient);

    return (
        <React.Fragment>
            <Sidebar activeMenu={6} />
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6"><h3 className="mb-0">Data Perusahaan Klien</h3></div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-end">
                                    <li className="breadcrumb-item"><a href="#">Home</a></li>
                                    <li className="breadcrumb-item active">Data Perusahaan Klien</li>
                                </ol>
                            </div>
                        </div>
                        <div className="app-content">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="d-flex mb-3">
                                            <div className="me-2" style={{ width: "20%" }}>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={filter}
                                                    onChange={e => setFilter(e.target.value)}
                                                >
                                                    <option value="id">ID</option>
                                                    <option value="name">Nama Perusahaan</option>
                                                    <option value="supervisor_name">Nama Supervisor</option>
                                                    <option value="email">Email</option>
                                                </select>
                                            </div>
                                            <div style={{ width: "80%" }}>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="Keyword Pencarian"
                                                    value={search}
                                                    onChange={e => setSearch(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-sm-12">
                                        <table className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    {[
                                                        { key: "id", label: "ID" },
                                                        { key: "name", label: "Nama Perusahaan" },
                                                        { key: "supervisor_name", label: "Nama Supervisor" },
                                                        { key: "email", label: "Email" },
                                                        { key: "joined_date", label: "Tanggal Mulai Bekerjasama" }
                                                    ].map(col => (
                                                        <th
                                                            key={col.key}
                                                            onClick={() => handleSort(col.key)}
                                                            className="sortable"
                                                            style={{ cursor: "pointer" }}
                                                        >
                                                            {col.label} {sortColumn === col.key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                                                        </th>
                                                    ))}
                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentClients.map((client, index) => (
                                                    <tr key={index}>
                                                        <td>{client.id}</td>
                                                        <td>{client.name}</td>
                                                        <td>{client.supervisor_name}</td>
                                                        <td>{client.email}</td>
                                                        <td>{new Date(client.joined_date).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</td>
                                                        <td>
                                                            <a
                                                                href={`/karyawan/klien/${client.id}`}
                                                                className="btn btn-secondary btn-sm me-1"
                                                            >
                                                                Lihat Detail
                                                            </a>

                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="pagination">
                                            {[...Array(Math.ceil(filteredClients.length / clientsPerPage))].map((_, index) => (
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
        </React.Fragment>
    );
};

export default KaryawanKlienList;
