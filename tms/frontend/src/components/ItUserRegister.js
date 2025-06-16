import React, { useState, useEffect } from "react";

import Swal from "sweetalert2";
import useAuthRedirect from "../features/authRedirect";
import Sidebar from "./sidebarit";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const ItUserRegister = () => {  // 🔹 Nama komponen harus huruf besar di awal
  useAuthRedirect(4);

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [statusAwal, setStatusAwal] = useState("aktif"); // Default: Aktif
  const [emailPassword, setEmailPassword] = useState("ya"); // Default: Ya
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/roles`)
      .then(response => setRoles(response.data))
      .catch(error => console.error("Error fetching roles:", error));
  }, []);

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   api.post(`/users`, {
  //     email,
  //     fullname,
  //     role_id: selectedRole,
  //   })
  //   .then(() => alert("Registrasi berhasil!"))
  //   .catch(error => console.error("Registrasi gagal:", error));
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); // Aktifkan overlay loading

    api.post(`/users`, {
      email,
      fullname,
      role_id: selectedRole,
      emailPassword: emailPassword,
      status: statusAwal === "aktif" ? 1 : 0,
    })
      .then(() => {
        sessionStorage.setItem("successMessage", "Registrasi berhasil!");
        navigate("/it/users");
        // setTimeout(() => {
        //   window.location.reload(); // Paksa reload setelah navigasi
        // }, 100);
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
      <Sidebar activeMenu={4} />
      {/*begin::App Main*/}
      <main className="app-main">
        {/*begin::App Content Header*/}
        <div className="app-content-header">
          {/*begin::Container*/}
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-6"><h3 className="mb-0">Registrasi User</h3></div>
            </div>
            <div className="container mt-4">
              <div className="card p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">Email</label>
                    <div className="col-sm-9 w-50">
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">Role</label>
                    <div className="col-sm-9 w-50">
                      <select
                        className="form-control"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        required
                      >
                        <option value="">Pilih Role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">Nama Panjang</label>
                    <div className="col-sm-9 w-50">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nama Panjang"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">Status Awal</label>
                    <div className="col-sm-9 w-50 d-flex align-items-center">
                      <div className="form-check me-3">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="statusAwal"
                          value="aktif"
                          checked={statusAwal === "aktif"}
                          onChange={() => setStatusAwal("aktif")}
                        />
                        <label className="form-check-label">Aktif</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="statusAwal"
                          value="nonaktif"
                          checked={statusAwal === "nonaktif"}
                          onChange={() => setStatusAwal("nonaktif")}
                        />
                        <label className="form-check-label">Nonaktif</label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">Kirim email set password</label>
                    <div className="col-sm-9 w-50 d-flex align-items-center">
                      <div className="form-check me-3">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="emailPassword"
                          value="ya"
                          checked={emailPassword === "ya"}
                          onChange={() => setEmailPassword("ya")}
                        />
                        <label className="form-check-label">Ya</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="emailPassword"
                          value="tidak"
                          checked={emailPassword === "tidak"}
                          onChange={() => setEmailPassword("tidak")}
                        />
                        <label className="form-check-label">Tidak</label>
                      </div>
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

export default ItUserRegister;  
