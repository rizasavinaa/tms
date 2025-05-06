import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import useAuthRedirect from "../features/authRedirect";
import Sidebar from "./sidebarkaryawan";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { useNavigate } from "react-router-dom";

const KaryawanPosisiRegister = () => {
    useAuthRedirect(15);
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);


    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true); // Aktifkan overlay loading

        axios.post(`${process.env.REACT_APP_API_URL}/posisipks`, {
            name,
            description
        })
            .then(() => {
                sessionStorage.setItem("successMessage", "Registrasi berhasil!");
                navigate("/karyawan/posisi-pk");
                setTimeout(() => {
                    window.location.reload(); // Paksa reload setelah navigasi
                }, 100);
            })
            .catch(error => {
                console.error("Registrasi gagal:", error);
                let errorMessage = "Terjadi kesalahan saat registrasi!";
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                }
                Swal.fire({
                    icon: "error",
                    title: "Registrasi Gagal",
                    text: errorMessage,
                });
            })
            .finally(() => setLoading(false)); // Matikan loading setelah selesai
    };

    return (
        <React.Fragment>
            <Sidebar activeMenu={5} />
            {/*begin::App Main*/}
            <main className="app-main">
                {/*begin::App Content Header*/}
                <div className="app-content-header">
                    {/*begin::Container*/}
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6"><h3 className="mb-0">Registrasi Posisi Pekerja Kreatif</h3></div>
                        </div>
                        <div className="container mt-4">
                            <div className="card p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3 row">
                                        <label className="col-sm-3 col-form-label">Nama Posisi</label>
                                        <div className="col-sm-9 w-50">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Nama Posisi Pekerja Kreatif"
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
                                                placeholder="Deskripsi Posisi Pekerja Kreatif"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={3} // atau bisa 4-5 kalau butuh lebih luas
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
                    {/*end::Container*/}
                </div>
                {/*end::App Content Header*/}
                {/*begin::App Content*/}
                <div className="app-content">
                    {/*begin::Container*/}
                    <div className="container-fluid">
                        {/*begin::Row*/}
                        <div className="row">
                            <div className="col-sm-12">
                            </div>
                        </div>
                        {/*end::Row*/}
                        {/*begin::Row*/}
                    </div>
                    {/*end::Container*/}
                </div>
                {/*end::App Content*/}
            </main>
            {/*end::App Main*/}
            <Jsfunction />
            <Footer />
            {/* Overlay Loading */}
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

export default KaryawanPosisiRegister;