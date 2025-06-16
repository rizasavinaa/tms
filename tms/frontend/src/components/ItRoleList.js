import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

import useAuthRedirect from "../features/authRedirect";
import Sidebar from "./sidebarit";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { Link } from "react-router-dom";
import api from "../api/api";

const ItRoleList = () => {
    useAuthRedirect(5);
    const [roles, setRoles] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("name");
    const [sortColumn, setSortColumn] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const rolesPerPage = 10;

    useEffect(() => {
        api.get(`/roles`)
            .then(response => setRoles(response.data))
            .catch(error => console.error("Gagal mengambil data role:", error));

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
                // jalankan reload atau navigasi di sini, setelah Swal hilang
                window.location.reload();
                // atau
                // navigate('/halaman-tujuan');
            }); 
            sessionStorage.removeItem("successMessage");
        }
    }, []);

    const handleSort = (column) => {
        const order = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortOrder(order);
    };

    const filteredRoles = roles.filter(role => {
        if (filter === "name") return role.name.toLowerCase().includes(search.toLowerCase());
        if (filter === "description") return role.description.toLowerCase().includes(search.toLowerCase());
        return true;
    });


    const sortedRoles = [...filteredRoles].sort((a, b) => {
        let valueA = sortColumn === "role" ? (a.role ? a.role.name : "") : a[sortColumn];
        let valueB = sortColumn === "role" ? (b.role ? b.role.name : "") : b[sortColumn];

        if (typeof valueA === "string") valueA = valueA.toLowerCase();
        if (typeof valueB === "string") valueB = valueB.toLowerCase();

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });


    const indexOfLastRole = currentPage * rolesPerPage;
    const indexOfFirstRole = indexOfLastRole - rolesPerPage;
    const currentRoles = sortedRoles.slice(indexOfFirstRole, indexOfLastRole);

    return (
        <React.Fragment>
            <Sidebar activeMenu={5} />
            <main className="app-main">
                {/*begin::App Content Header*/}
                <div className="app-content-header">
                    {/*begin::Container*/}
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6"><h3 className="mb-0">Data Role</h3></div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-end">
                                    <li className="breadcrumb-item"><a href="#">Home</a></li>
                                    <li className="breadcrumb-item active" aria-current="page">Data Role</li>
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
                                            <div className="me-2" style={{ width: "20%" }}>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={filter}
                                                    onChange={e => setFilter(e.target.value)}
                                                >
                                                    <option value="name">Nama Role</option>
                                                    <option value="description">Deskripsi</option>
                                                </select>
                                            </div>
                                            <div style={{ width: "80%" }}>
                                                <input type="text" className="form-control form-control-sm" placeholder="Keyword Pencarian" value={search} onChange={e => setSearch(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-12">
                                        <table className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    {[
                                                        { key: 'id', label: 'ID' },
                                                        { key: 'name', label: 'Nama Role' },
                                                        { key: 'description', label: 'Deskripsi' }
                                                    ].map(col => (
                                                        <th key={col.key} onClick={() => handleSort(col.key)} className="sortable" style={{ cursor: "pointer" }}>
                                                            {col.label} {sortColumn === col.key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                                                        </th>
                                                    ))}
                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentRoles.map((role, index) => (
                                                    <tr key={index}>
                                                        <td>{role.id}</td>
                                                        <td>{role.name}</td>
                                                        <td>{role.description}</td>
                                                        <td>
                                                            <a href={`/it/roles/${role.id}`} className="btn btn-secondary btn-sm me-1">
                                                                Lihat Detail
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="pagination">
                                            {[...Array(Math.ceil(filteredRoles.length / rolesPerPage))].map((_, index) => (
                                                <button key={index} className={`btn btn-sm ${currentPage === index + 1 ? "btn-primary" : "btn-light"}`} onClick={() => setCurrentPage(index + 1)}>
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

export default ItRoleList;