import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { Link } from "react-router-dom";
import Sidebar from "./sidebarkaryawan";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import useAuthRedirect from "../features/authRedirect";
import LoadingPage from "./loading"; // Import halaman loading
import api from "../api/api";

const KaryawanHome = () => {

  const loading = useAuthRedirect(13); // ID privilege untuk halaman IT

  const [stats, setStats] = useState({
    retensi: 0,
    available: 0,
    aktif: 0,
  });
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/karyawan-homepage`);
        setStats(res.data);
      } catch (err) {
        console.error('Gagal mengambil data dashboard:', err);
      }
    };

    fetchStats();
  }, []);

  if (loading) { return <LoadingPage />; }// Pakai halaman loading

  return (
    <React.Fragment>
      <Sidebar />
      {/*begin::App Main*/}
      <main className="app-main">
        {/*begin::App Content Header*/}
        <div className="app-content-header">
          {/*begin::Container*/}
          <div className="container-fluid">
            {/*begin::Row*/}
            <div className="row">
              <div className="col-sm-6"><h3 className="mb-0">Dashboard</h3></div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-end">
                  <li className="breadcrumb-item"><a href="#">Home</a></li>
                  <li className="breadcrumb-item active" aria-current="page">Dashboard</li>
                </ol>
              </div>
            </div>
            {/*end::Row*/}
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
              <div className="row">
                {/* Box 1 - Follow Up Retensi */}
                <div className="col-md-12 mb-3">
                  <div className="border p-3 d-flex align-items-center">
                    <div className="text-danger" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginRight: '1rem' }}>
                      {stats.retensi}
                    </div>
                    <div>
                      <h5 className="mb-1">Follow Up Retensi</h5>
                      <p className="mb-0 text-muted">Jumlah pekerja kreatif yang perlu dipastikan retensinya.</p>
                    </div>
                  </div>
                </div>

                {/* Box 2 - Available */}
                <div className="col-md-12 mb-3">
                  <div className="border p-3 d-flex align-items-center">
                    <div className="text-success" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginRight: '1rem' }}>
                      {stats.available}
                    </div>
                    <div>
                      <h5 className="mb-1">Pekerja Kreatif Available</h5>
                      <p className="mb-0 text-muted">Jumlah pekerja kreatif yang belum mendapatkan perusahaan.</p>
                    </div>
                  </div>
                </div>

                {/* Box 3 - Kontrak Aktif */}
                <div className="col-md-12 mb-3">
                  <div className="border p-3 d-flex align-items-center">
                    <div className="text-primary" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginRight: '1rem' }}>
                      {stats.aktif}
                    </div>
                    <div>
                      <h5 className="mb-1">Pekerja Kreatif dengan Kontrak Aktif</h5>
                      <p className="mb-0 text-muted">Jumlah pekerja kreatif yang sedang bekerja di perusahaan klien.</p>
                    </div>
                  </div>
                </div>
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
    </React.Fragment>
  );
};

export default KaryawanHome;
