import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import useAuthRedirect from "../features/authRedirect";
import Sidebar from "./sidebarit";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { Link } from "react-router-dom";

const ItRolePrivilegeList = () => {
    useAuthRedirect(7);
    const [roleprivs, setRolePrivs] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("name");
    const [sortColumn, setSortColumn] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const roleprivsPerPage = 10;

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/role-priv`)
            .then(response => setRolePrivs(response.data))
            .catch(error => console.error("Gagal mengambil data hak akses:", error));

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

    const filteredRolePrivs = roleprivs.filter(rolepriv => {
        const keyword = search.toLowerCase();
        if (filter === "name") return rolepriv.privilege?.name?.toLowerCase().includes(keyword);
        if (filter === "description") return rolepriv.privilege?.description?.toLowerCase().includes(keyword);
        if (filter === "role") return rolepriv.role?.name?.toLowerCase().includes(keyword);
        return true;
    });


    const sortedRolePrivs = [...filteredRolePrivs].sort((a, b) => {
        let valueA, valueB;

        if (sortColumn === "role") {
            valueA = a.role?.name?.toLowerCase() || "";
            valueB = b.role?.name?.toLowerCase() || "";
        } else if (sortColumn === "name") {
            valueA = a.privilege?.name?.toLowerCase() || "";
            valueB = b.privilege?.name?.toLowerCase() || "";
        } else {
            valueA = a[sortColumn];
            valueB = b[sortColumn];
        }

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });


    const indexOfLastRolePriv = currentPage * roleprivsPerPage;
    const indexOfFirstRolePriv = indexOfLastRolePriv - roleprivsPerPage;
    const currentRolePrivs = sortedRolePrivs.slice(indexOfFirstRolePriv, indexOfLastRolePriv);

    const deleteRolePriv = async (roleprivId) => {
        Swal.fire({
            title: "Yakin ingin menghapus hak akses ini?",
            text: "Tindakan ini tidak dapat dibatalkan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${process.env.REACT_APP_API_URL}/role-priv/${roleprivId}`);

                    // Update state roleprivs tanpa fetch ulang
                    setRolePrivs(roleprivs.filter(rolepriv => rolepriv.id !== roleprivId));

                    Swal.fire("Berhasil!", "Hak Akses berhasil dihapus.", "success");
                } catch (error) {
                    Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus hak akses.", "error");
                    console.error("Gagal menghapus rolepriv:", error);
                }
            }
        });
    };

    return (
        <React.Fragment>
            <Sidebar activeMenu={7} />
            <main className="app-main">
                {/*begin::App Content Header*/}
                <div className="app-content-header">
                    {/*begin::Container*/}
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6"><h3 className="mb-0">Data Hak Akses</h3></div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-end">
                                    <li className="breadcrumb-item"><a href="#">Home</a></li>
                                    <li className="breadcrumb-item active" aria-current="page">Data Hak Akses</li>
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
                                                    <option value="id">ID</option>
                                                    <option value="role">Role</option>
                                                    <option value="name">Hak Akses</option>
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
                                                        { key: 'role', label: 'Role' },
                                                        { key: 'name', label: 'Hak Akses' }
                                                    ].map(col => (
                                                        <th key={col.key} onClick={() => handleSort(col.key)} className="sortable" style={{ cursor: "pointer" }}>
                                                            {col.label} {sortColumn === col.key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                                                        </th>
                                                    ))}
                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentRolePrivs.map((rolepriv, index) => (
                                                    <tr key={index}>
                                                        <td>{rolepriv.id}</td>
                                                        <td>{rolepriv.role.name}</td>
                                                        <td>{rolepriv.privilege.name + " - " + rolepriv.privilege.description}</td>
                                                        <td>
                                                            <button onClick={() => deleteRolePriv(rolepriv.id)} className="btn btn-danger btn-sm me-1">
                                                                Delete
                                                            </button>

                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="pagination">
                                            {[...Array(Math.ceil(filteredRolePrivs.length / roleprivsPerPage))].map((_, index) => (
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
}

export default ItRolePrivilegeList;