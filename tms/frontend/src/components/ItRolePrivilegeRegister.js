import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import useAuthRedirect from "../features/authRedirect";
import Sidebar from "./sidebarit";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { useNavigate } from "react-router-dom";
import Loading from "./loading";

const ItRolePrivilegeRegister = () => {
    useAuthRedirect(8);
    const navigate = useNavigate();

    const [roles, setRoles] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/roles`)
      .then(response => setRoles(response.data))
      .catch(error => console.error("Error fetching roles:", error));
  }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        axios.post(`${process.env.REACT_APP_API_URL}/role-priv`, {
            role_id: selectedRoleId,
            name,
            description
        })
        .then(() => {
            sessionStorage.setItem("successMessage", "Hak Akses berhasil ditambahkan!");
            navigate("/it/hak-akses");
            // setTimeout(() => {
            //     window.location.reload(); // Paksa reload setelah navigasi
            // }, 100);
        })
        .catch(error => {
            console.error("Gagal menambahkan hak akses:", error);
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: error.response?.data?.message || "Terjadi kesalahan saat menambahkan hak akses.",
            });
        })
        .finally(() => setLoading(false));
    };

    return (
        <React.Fragment>
            <Sidebar activeMenu={8} />
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6"><h3 className="mb-0">Registrasi Hak Akses</h3></div>
                        </div>
                        <div className="container mt-4">
                            <div className="card p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3 row">
                                        <label className="col-sm-3 col-form-label">Pilih Role</label>
                                        <div className="col-sm-9 w-50">
                                            <select
                                                className="form-select"
                                                value={selectedRoleId}
                                                onChange={(e) => setSelectedRoleId(e.target.value)}
                                                required
                                            >
                                                <option value="">-- Pilih Role --</option>
                                                {roles.map((role) => (
                                                    <option key={role.id} value={role.id}>{role.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3 row">
                                        <label className="col-sm-3 col-form-label">Nama Hak Akses</label>
                                        <div className="col-sm-9 w-50">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Contoh: Melihat laporan"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3 row">
                                        <label className="col-sm-3 col-form-label">Deskripsi</label>
                                        <div className="col-sm-9 w-50">
                                            <textarea
                                                className="form-control"
                                                placeholder="Penjelasan tentang hak akses"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={3}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3 row">
                                        <div className="col-sm-3"></div>
                                        <div className="col-sm-9 w-50">
                                            <button type="submit" className="btn btn-success">Simpan</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Jsfunction />
            <Footer />

            {loading && <Loading />}
        </React.Fragment>
    );
};

export default ItRolePrivilegeRegister;
