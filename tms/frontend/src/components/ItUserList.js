import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import useAuthRedirect from "../features/authRedirect";
import Sidebar from "./sidebarit";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { Link } from "react-router-dom";

const ItUserList = () => {
    useAuthRedirect(3);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("email");
    const [sortColumn, setSortColumn] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/users`)
            .then(response => setUsers(response.data))
            .catch(error => console.error("Gagal mengambil data user:", error));

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

    const filteredUsers = users.filter(user => {
        if (filter === "email") return user.email.toLowerCase().includes(search.toLowerCase());
        if (filter === "fullname") return user.fullname.toLowerCase().includes(search.toLowerCase());
        if (filter === "role") return user.role && user.role.name.toLowerCase().includes(search.toLowerCase());
        return true;
    });


    const sortedUsers = [...filteredUsers].sort((a, b) => {
        let valueA = sortColumn === "role" ? (a.role ? a.role.name : "") : a[sortColumn];
        let valueB = sortColumn === "role" ? (b.role ? b.role.name : "") : b[sortColumn];

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

    const toggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        const action = newStatus === 1 ? "mengaktifkan" : "menonaktifkan";

        Swal.fire({
            title: `Yakin ingin ${action} user ini?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, lanjutkan!",
            cancelButtonText: "Batal",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.patch(`${process.env.REACT_APP_API_URL}/users/${userId}`, {
                        status: newStatus,
                    });

                    // Update state users tanpa perlu fetch ulang dari server
                    setUsers(users.map(user =>
                        user.id === userId ? { ...user, status: newStatus } : user
                    ));

                    Swal.fire("Berhasil!", `User berhasil ${action}.`, "success");
                } catch (error) {
                    Swal.fire("Gagal!", "Terjadi kesalahan saat mengubah status.", "error");
                    console.error("Gagal mengubah status user:", error);
                }
            }
        });
    };


    return (
        <React.Fragment>
            <Sidebar activeMenu={3} />
            <main className="app-main">
                {/*begin::App Content Header*/}
                <div className="app-content-header">
                    {/*begin::Container*/}
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6"><h3 className="mb-0">Data User</h3></div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-end">
                                    <li className="breadcrumb-item"><a href="#">Home</a></li>
                                    <li className="breadcrumb-item active" aria-current="page">Data User</li>
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
                                                <select className="form-select form-select-sm" value={filter} onChange={e => setFilter(e.target.value)}>
                                                    <option value="email">Email</option>
                                                    <option value="fullname">Nama Panjang</option>
                                                    <option value="role">Role</option>
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
                                                        { key: 'email', label: 'Email' },
                                                        { key: 'fullname', label: 'Nama Lengkap' },
                                                        { key: 'role', label: 'Role' },
                                                        { key: 'status', label: 'Status' },
                                                        { key: 'last_login', label: 'Terakhir Login' }
                                                    ].map(col => (
                                                        <th key={col.key} onClick={() => handleSort(col.key)} className="sortable" style={{ cursor: "pointer" }}>
                                                            {col.label} {sortColumn === col.key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                                                        </th>
                                                    ))}

                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentUsers.map((user, index) => (
                                                    <tr key={index}>
                                                        <td>{user.id}</td>
                                                        <td>{user.email}</td>
                                                        <td>{user.fullname}</td>
                                                        <td>{user.role ? user.role.name : "Tidak ada role"}</td>
                                                        <td>{user.status === 1 ? "Aktif" : "Nonaktif"}</td>
                                                        <td>
                                                            {user.last_login
                                                                ? new Date(user.last_login).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
                                                                : "Belum login"}
                                                        </td>
                                                        <td>
                                                            <a href={`/it/users/${user.id}`} className="btn btn-secondary btn-sm me-1">
                                                                Lihat Detail
                                                            </a>
                                                            <button
                                                                className={`btn btn-${user.status === 1 ? "danger" : "success"} btn-sm`}
                                                                onClick={() => toggleStatus(user.id, user.status)}
                                                            >
                                                                {user.status === 1 ? "Nonaktifkan" : "Aktifkan"}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="pagination">
                                            {[...Array(Math.ceil(filteredUsers.length / usersPerPage))].map((_, index) => (
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

export default ItUserList;