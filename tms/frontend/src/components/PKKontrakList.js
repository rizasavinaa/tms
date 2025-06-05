import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "./sidebarpekerjakreatif";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import useAuthRedirect from "../features/authRedirect";
import { useLocation } from "react-router-dom";
import KaryawanPortoListByTalent from "./KaryawanPortoListByTalent";
import { formatCurrency } from "../utils/format";
import KaryawanKontrakListByTalent from "./KaryawanKontrakListByTalent";
import { useSelector } from "react-redux";

const PKKontrakList = () => {
    useAuthRedirect(25);
    const { user } = useSelector((state) => state.auth);
    const id = user?.talent_id;

    const [loading, setLoading] = useState(false);
    console.log(id);

    useEffect(() => {
        if (!id) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [id]);
    return (
        <React.Fragment>
            <Sidebar activeMenu={4} />
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6"><h3>Data Kontrak Kerja</h3></div>
                        </div>
                        <div className="app-content">
                            <div className="container-fluid">
                                <div className="row"></div>
                                {!loading && id && (
                                    <KaryawanKontrakListByTalent talentId={id} />
                                )}

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
}
export default PKKontrakList;