import React, { useEffect, useState } from "react";

import Sidebar from "./sidebarkaryawan";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const KaryawanTalentList = () => {
  const [talents, setTalents] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("name");
  const [sortColumn, setSortColumn] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const talentsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/talents`)
      .then((response) => setTalents(response.data))
      .catch((error) => console.error("Gagal mengambil data talents:", error));
  }, []);

  const handleSort = (column) => {
    const order = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(order);
  };

  const filteredTalents = talents.filter((t) => {
    const keyword = search.toLowerCase();
    if (filter === "name") return t.name.toLowerCase().includes(keyword);
    if (filter === "email") return t.email.toLowerCase().includes(keyword);
    if (filter === "category") return t.talent_category?.name?.toLowerCase().includes(keyword);
    if (filter === "status") return t.talent_status?.name?.toLowerCase().includes(keyword);
    return true;
  });

  const sortedTalents = [...filteredTalents].sort((a, b) => {
    let aValue = sortColumn === "category" ? a.talent_category?.name :
                 sortColumn === "status" ? a.talent_status?.name :
                 a[sortColumn];
    let bValue = sortColumn === "category" ? b.talent_category?.name :
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

  return (
    <>
      <Sidebar activeMenu={5} />
      <main className="app-main">
        <div className="app-content-header">
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-6"><h3>Data Talent</h3></div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-end">
                  <li className="breadcrumb-item"><a href="#">Home</a></li>
                  <li className="breadcrumb-item active">Talent</li>
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
                        <option value="status">Status</option>
                      </select>
                    </div>
                    <div style={{ width: "80%" }}>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Keyword Pencarian"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
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
                            { key: "name", label: "Fullname" },
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
                            <td>{talent.talent_category?.name || "-"}</td>
                            <td>{talent.talent_status?.name || "-"}</td>
                            <td>{talent.last_salary}</td>
                            <td>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => navigate(`/karyawan/porto-register/${talent.id}`)}
                              >
                                Tambah Portofolio
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="pagination">
                      {Array.from({ length: Math.ceil(filteredTalents.length / talentsPerPage) }).map((_, index) => (
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
    </>
  );
};

export default KaryawanTalentList;
