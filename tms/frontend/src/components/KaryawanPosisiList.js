import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import useAuthRedirect from "../features/authRedirect";
import Sidebar from "./sidebarkaryawan";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { Link } from "react-router-dom";

const KaryawanPosisiList = () => {
    useAuthRedirect(14);
    const [posisipks, setPosisiPks] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("name");
    const [sortColumn, setSortColumn] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const posisipksPerPage = 10;

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/posisipks`)
            .then(response => setPosisiPks(response.data))
            .catch(error => console.error("Gagal mengambil data posisi pekerja kreatif", error));

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

    const filteredPosisiPks = posisipks.filter(posisipk => {
        if (filter === "name") return posisipk.name.toLowerCase().includes(search.toLowerCase());
        if (filter === "description") return posisipk.description.toLowerCase().includes(search.toLowerCase());
        return true;
    });


    const sortedPosisiPks = [...filteredPosisiPks].sort((a, b) => {
        let valueA = sortColumn === "posisipk" ? (a.posisipk ? a.posisipk.name : "") : a[sortColumn];
        let valueB = sortColumn === "posisipk" ? (b.posisipk ? b.posisipk.name : "") : b[sortColumn];

        if (typeof valueA === "string") valueA = valueA.toLowerCase();
        if (typeof valueB === "string") valueB = valueB.toLowerCase();

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });


    const indexOfLastPosisiPk = currentPage * posisipksPerPage;
    const indexOfFirstPosisiPk = indexOfLastPosisiPk - posisipksPerPage;
    const currentPosisiPks = sortedPosisiPks.slice(indexOfFirstPosisiPk, indexOfLastPosisiPk);
    return (
        <React.Fragment>
            <Sidebar activeMenu={4} />
            <main className="app-main">
                {/*begin::App Content Header*/}
                <div className="app-content-header">
                    {/*begin::Container*/}
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6"><h3 className="mb-0">Data Posisi Pekerja Kreatif</h3></div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-end">
                                    <li className="breadcrumb-item"><a href="#">Home</a></li>
                                    <li className="breadcrumb-item active" aria-current="page">Data Posisi Pekerja Kreatif</li>
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
                                                    <option value="name">Name</option>
                                                    <option value="description">Description</option>
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
                                                        { key: 'name', label: 'Nama' }
                                                    ].map(col => (
                                                        <th key={col.key} onClick={() => handleSort(col.key)} className="sortable" style={{ cursor: "pointer" }}>
                                                            {col.label} {sortColumn === col.key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                                                        </th>
                                                    ))}
                                                    <th>Deskripsi</th>
                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentPosisiPks.map((posisipk, index) => (
                                                    <tr key={index}>
                                                        <td>{posisipk.id}</td>
                                                        <td>{posisipk.name}</td>
                                                        <td>{posisipk.description}</td>
                                                        <td>
                                                            <a href={`/karyawan/posisi-pk/${posisipk.id}`} className="btn btn-secondary btn-sm me-1">
                                                                Lihat Detail
                                                            </a>

                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="pagination">
                                            {[...Array(Math.ceil(filteredPosisiPks.length / posisipksPerPage))].map((_, index) => (
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
export default KaryawanPosisiList;