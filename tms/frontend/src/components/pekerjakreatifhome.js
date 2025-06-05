import React, { useEffect, useState } from "react";
import Sidebar from "./sidebarpekerjakreatif";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import useAuthRedirect from "../features/authRedirect";
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";

const ReminderBox = ({ message }) => (
  <div className="alert alert-warning d-flex align-items-center p-3 mb-3" role="alert">
    <i className="fas fa-exclamation-triangle me-2"></i>
    <div><strong>{message}</strong></div>
  </div>
);

const Pekerjakreatifhome = () => {
  useAuthRedirect(18);

  const { user } = useSelector((state) => state.auth);
  const [showReminderPorto, setShowReminderPorto] = useState(false);
  const [showReminderBuktiKerja, setShowReminderBuktiKerja] = useState(false);
  const [showReminderBuktiKerjaLalu, setShowReminderBuktiKerjaLalu] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/reminderspk`);
        
        if (res.data.reminderPorto) setShowReminderPorto(true);
        if (res.data.reminderBuktiKerja) setShowReminderBuktiKerja(true);
        if (res.data.reminderBuktiKerjaLalu) setShowReminderBuktiKerjaLalu(true);
      } catch (error) {
        console.error("Gagal memuat reminder:", error);
      }
    };

    if (user?.talent_id) {
      fetchData();
    }
  }, [user]);


  return (
    <React.Fragment>
      <Sidebar />
      <main className="app-main">
        <div className="app-content-header">
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-6"><h3 className="mb-0">Reminder</h3></div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-end">
                  <li className="breadcrumb-item"><a href="#">Home</a></li>
                  <li className="breadcrumb-item active" aria-current="page">Dashboard</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="app-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-12">
                {showReminderPorto && (
                  <ReminderBox message="Segera lengkapi portofoliomu." />
                )}
                {showReminderBuktiKerjaLalu && (
                  <ReminderBox message="Segera registrasikan bukti kerjamu bulan yang terlewat." />
                )}
                {showReminderBuktiKerja && (
                  <ReminderBox message="Segera registrasikan bukti kerjamu bulan ini." />
                )}

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

export default Pekerjakreatifhome;
