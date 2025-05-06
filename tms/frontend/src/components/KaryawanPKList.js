import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import useAuthRedirect from "../features/authRedirect";
import Sidebar from "./sidebarkaryawan";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import { Link } from "react-router-dom";

const KaryawanPKList = () => {
    useAuthRedirect(14);
};
export default KaryawanPKList;