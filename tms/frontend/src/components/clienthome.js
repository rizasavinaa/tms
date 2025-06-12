import React, { useState, useEffect } from "react";
import Sidebar from "./sidebarclient";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import useAuthRedirect from "../features/authRedirect";
import axios from "axios";
import LoadingPage from "./loading";
import { useSelector } from "react-redux";

const Clienthome = () => {
  const loading = useAuthRedirect(19); // ID privilege untuk halaman IT
  const { user } = useSelector((state) => state.auth);
  const id = user?.client_id;
  const [stats, setStats] = useState({
    recruited: 0,
    newworkproof: 0,
  });
  useEffect(() => {
    if (!id) return; // pastikan client_id sudah tersedia

    const fetchStats = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/client-homepage?client_id=${id}`);
        setStats(res.data);
      } catch (err) {
        console.error('Gagal mengambil data dashboard:', err);
      }
    };

    fetchStats();
  }, [id]);


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
                {/* Box 1 jumlah yang direkrut */}
                <div className="col-md-12 mb-3">
                  <div className="border p-3 d-flex align-items-center">
                    <div className="text-primary" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginRight: '1rem' }}>
                      {stats.recruited}
                    </div>
                    <div>
                      <h5 className="mb-1">Pekerja Kreatif telah direkrut</h5>
                    </div>
                  </div>
                </div>
                {/* Box 2 jumlah bukt1 kerja new */}
                <div className="col-md-12 mb-3">
                  <div className="border p-3 d-flex align-items-center">
                    <div className="text-danger" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginRight: '1rem' }}>
                      {stats.newworkproof}
                    </div>
                    <div>
                      <h5 className="mb-1">Bukti Kerja belum dicek</h5>
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

export default Clienthome;
