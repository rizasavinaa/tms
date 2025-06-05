import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import useAuthRedirect from "../features/authRedirect";
import Sidebar from "./sidebarpekerjakreatif";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import PKPortofolioList from "./PKPortofolioList";

const PKPortofolioListMaster = () => {
    useAuthRedirect(16);
    const { user } = useSelector((state) => state.auth);
    const id = user?.talent_id;

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        //console.log("haloo", id);
    }, [id]);

    // Render loading atau kosong saat id belum siap
    if (!id) {
        return (
            <React.Fragment>
                <Sidebar activeMenu={2} />
                <main className="app-main">
                    <div className="app-content-header">
                        <div className="container-fluid">
                            <h5>Memuat data...</h5>
                        </div>
                    </div>
                </main>
                <Footer />
                <Jsfunction />
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <Sidebar activeMenu={2} />
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6"><h3>Data Portofolio</h3></div>
                        </div>
                        <div className="app-content">
                            <div className="container-fluid">
                                <div className="row"></div>
                                <PKPortofolioList talentId={id} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <Jsfunction />
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

export default PKPortofolioListMaster;