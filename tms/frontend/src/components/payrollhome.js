import React, { useState, useEffect } from "react";
import Sidebar from "./sidebarpayroll";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import useAuthRedirect from "../features/authRedirect";
import LoadingPage from "./loading";
import { useSelector } from "react-redux";
import axios from "axios";

const Payrollhome = () => {
  const loading = useAuthRedirect(33); // ID privilege untuk halaman IT
  const [stats, setStats] = useState({
   unpaid: 0,
  });
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/payroll-homepage`);
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
                <div className="col-md-12 mb-3">
                  <div className="border p-3 d-flex align-items-center">
                    <div className="text-danger" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginRight: '1rem' }}>
                      {stats.unpaid}
                    </div>
                    <div>
                      <h5 className="mb-1">Pekerja Kreatif Belum Terbayar Gajinya</h5>
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

export default Payrollhome;
