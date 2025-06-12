import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./sidebarclient";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { useNavigate } from "react-router-dom";
import useAuthRedirect from "../features/authRedirect";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

const KlienPKList = () => {
    useAuthRedirect(19);
    const { user } = useSelector((state) => state.auth);
    const id = user?.client_id;
    const [talents, setTalents] = useState([]);
    const [totalTalents, setTotalTalents] = useState(0);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("name");
    const [sortColumn, setSortColumn] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const talentsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !user.client_id) return; // ⬅️ tambahkan guard clause

        setLoading(true);
        axios.get(`${process.env.REACT_APP_API_URL}/talents/recruited/${user.client_id}`, {
            params: {
                search,
                filter,
                sortColumn,
                sortOrder,
                page: currentPage,
                limit: talentsPerPage
            }
        })
            .then((response) => {
                setTalents(response.data.data);
                setTotalTalents(response.data.total);
            })
            .catch((error) => console.error("Gagal mengambil data talents:", error))
            .finally(() => setLoading(false));
    }, [user, search, filter, sortColumn, sortOrder, currentPage]);



    const handleSort = (column) => {
        const order = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortOrder(order);
    };

    const filteredTalents = talents.filter((t) => {
        const keyword = search.toLowerCase();
        if (filter === "name") return t.name.toLowerCase().includes(keyword);
        if (filter === "email") return t.email.toLowerCase().includes(keyword);
        if (filter === "category") return t.category.toLowerCase().includes(keyword);
        if (filter === "status") return t.status.toLowerCase().includes(keyword);
        return true;
    });

    const sortedTalents = [...filteredTalents].sort((a, b) => {
        let aValue = sortColumn === "category" ? a.category :
            sortColumn === "status" ? a.talent_status?.name :
                a[sortColumn];
        let bValue = sortColumn === "category" ? b.category :
            sortColumn === "status" ? b.talent_status?.name :
                b[sortColumn];

        if (typeof aValue === "string") aValue = aValue.toLowerCase();
        if (typeof bValue === "string") bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    const indexOfLastTalent = currentPage * talentsPerPage;
    const indexOfFirstTalent = indexOfLastTalent - talentsPerPage;
    const currentTalents = sortedTalents.slice(indexOfFirstTalent, indexOfLastTalent);

    const formatRupiah = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleExportExcel = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/export-talents/recruited`, {
        params: {
            search,
            filter,
            sortColumn,
            sortOrder,
            client_id: user?.client_id, // tambahkan ini jika filtering per klien
        },
        responseType: 'blob',
    })
        .then(response => {
            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(blob, "data_talent.xlsx");
        })
        .catch(error => {
            console.error("Error exporting Excel:", error);
            Swal.fire({
                icon: "error",
                title: "Gagal Download",
                text: "Terjadi kesalahan saat mengekspor file.",
            });
        });
};



    return (
        <React.Fragment>
            <Sidebar activeMenu={1} />
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6"><h3>Data Pekerja Kreatif Terekrut</h3></div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-end">
                                    <li className="breadcrumb-item"><a href="#">Home</a></li>
                                    <li className="breadcrumb-item active">Data Pekerja Kreatif Terekrut</li>
                                </ol>
                            </div>
                        </div>
                        <div className="app-content">
                            <div className="container-fluid">
                                <div className="row mb-3">
                                    <div className="col-sm-12 d-flex">
                                        <div className="me-2" style={{ width: "20%" }}>
                                            <select className="form-select form-select-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
                                                <option value="name">Nama</option>
                                                <option value="email">Email</option>
                                                <option value="category">Posisi</option>
                                                {/* <option value="status">Status</option> */}
                                            </select>
                                        </div>
                                        <div className="me-2" style={{ width: "60%" }}>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Keyword Pencarian"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="me-2" style={{ width: "20%" }}>
                                            <button className="btn btn-primary btn-sm" onClick={handleExportExcel}>
                                                Download .xls
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <table className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    {[
                                                        { key: "id", label: "ID" },
                                                        { key: "email", label: "Email" },
                                                        { key: "name", label: "Nama" },
                                                        { key: "category", label: "Posisi" },
                                                        { key: "status", label: "Status" },
                                                        { key: "last_salary", label: "Gaji Terakhir" },
                                                    ].map(col => (
                                                        <th key={col.key} onClick={() => handleSort(col.key)} style={{ cursor: "pointer" }}>
                                                            {col.label} {sortColumn === col.key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                                                        </th>
                                                    ))}
                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentTalents.map((talent, index) => (
                                                    <tr key={index}>
                                                        <td>{talent.id}</td>
                                                        <td>{talent.email}</td>
                                                        <td>{talent.name}</td>
                                                        <td>{talent.category || "-"}</td>
                                                        <td>{talent.status || "-"}</td>
                                                        <td>{formatRupiah(talent.last_salary)}</td>
                                                        <td>
                                                            <a
                                                                href={`/client/pk/${talent.id}`}
                                                                className="btn btn-secondary btn-sm me-1"
                                                            >
                                                                Lihat Detail
                                                            </a>

                                                            <a
                                                                href={`/client/pk/${talent.id}?tab=portofolio`}
                                                                className="btn btn-success btn-sm"
                                                            >
                                                                Portofolio
                                                            </a>

                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="pagination">
                                            {Array.from({ length: Math.ceil(totalTalents / talentsPerPage) }).map((_, index) => (
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

export default KlienPKList;
