import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { Link } from "react-router-dom";
import { formatRupiah } from "../utils/format";
import { useSelector } from "react-redux";

const KaryawanKontrakListByTalent = ({ talentId }) => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role_id;
  const [kontrak, setKontrak] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("client_name"); // default filter kolom
  const [sortColumn, setSortColumn] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const kontrakPerPage = 10;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchKontrak();

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
        window.location.reload();
      });
      sessionStorage.removeItem("successMessage");
    }
  }, []);

  const fetchKontrak = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/contracts/talent/${talentId}`);
      setKontrak(res.data);
    } catch (error) {
      console.error("Gagal mengambil data kontrak kerja", error);
    } finally {
      setLoading(false);
    }
  };

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
        setLoading(true);
        await axios.delete(`${process.env.REACT_APP_API_URL}/workhistory/${id}`);
        setKontrak((prev) => prev.filter((k) => k.id !== id));
        Swal.fire("Dihapus!", "Kontrak berhasil dihapus.", "success");
      } catch (error) {
        const msg = error.response?.data?.message || "Terjadi kesalahan saat menghapus.";
        Swal.fire("Gagal", msg, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter data sesuai search dan filter kolom
  const filteredKontrak = kontrak.filter((k) => {
    const value = k[filter]?.toString().toLowerCase() || "";
    return value.includes(search.toLowerCase());
  });

  // Sorting
  const sortedKontrak = [...filteredKontrak].sort((a, b) => {
    let valueA = a[sortColumn];
    let valueB = b[sortColumn];
    if (typeof valueA === "string") valueA = valueA.toLowerCase();
    if (typeof valueB === "string") valueB = valueB.toLowerCase();
    if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
    if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination slice
  const indexOfLast = currentPage * kontrakPerPage;
  const indexOfFirst = indexOfLast - kontrakPerPage;
  const currentKontrak = sortedKontrak.slice(indexOfFirst, indexOfLast);

  return (
    <React.Fragment>
      <div className="row">
        <div className="col-sm-12">
          <div className="d-flex mb-3">
            <div className="me-2" style={{ width: "20%" }}>
              <select
                className="form-select form-select-sm me-2"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="id">ID</option>
                <option value="client_name">Nama Perusahaan</option>
                <option value="category">Posisi</option>
              </select>
            </div>
            <div className="me-2" style={{ width: "80%" }}>
              <input
                type="text"
                className="form-control form-control-sm me-2"
                placeholder="Cari..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="col-sm-12 mt-2">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                {[
                  { key: "id", label: "ID" },
                  { key: "client_name", label: "Nama Perusahaan" },
                  { key: "category", label: "Posisi" },
                  { key: "salary", label: "Gaji" },
                  { key: "start_date", label: "Tanggal Mulai" },
                  { key: "end_date", label: "Tanggal Berakhir" },
                ].map((col) => (
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
              {currentKontrak.map((k) => (
                <tr key={k.id}>
                  <td>{k.id}</td>
                  <td>{k.client_name}</td>
                  <td>{k.category}</td>
                  <td>{formatRupiah(k.salary)}</td>
                  <td>{new Date(k.start_date).toLocaleDateString("id-ID")}</td>
                  <td>{k.end_date ? new Date(k.end_date).toLocaleDateString("id-ID") : "-"}</td>
                  <td>
                    <a
                      href={`${k.file_link.replace("/upload/", "/upload/fl_attachment/")}`}
                      className="btn btn-sm btn-info me-1"
                      title="Download"
                      download
                    >
                      <i className="fas fa-download"></i>
                    </a>

                    <Link  to={role === 2 ? `/karyawan/kontrak/${k.id}` : `/pekerjakreatif/kontrak/${k.id}`} className="btn btn-secondary btn-sm me-1">
                      Lihat Detail
                    </Link>
                  </td>
                </tr>
              ))}
              {currentKontrak.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center">
                    Data kontrak tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination">
            {[...Array(Math.ceil(filteredKontrak.length / kontrakPerPage))].map((_, index) => (
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

export default KaryawanKontrakListByTalent;
