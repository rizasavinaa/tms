import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import useAuthRedirect from "../features/authRedirect";
import Sidebar from "./sidebarpekerjakreatif";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { useNavigate, useParams } from "react-router-dom";
import ReusePortoRegister from "./ReusePortoRegister";

const PKPortofolioRegister = () => {
    useAuthRedirect(17);
    return (
        <React.Fragment>
            <Sidebar activeMenu={3} />
            <ReusePortoRegister/>
            <Jsfunction />
            <Footer />
        </React.Fragment>
    );
};

export default PKPortofolioRegister;