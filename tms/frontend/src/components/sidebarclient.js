import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, reset } from "../features/authSlice";
import Swal from "sweetalert2";


function Sidebarclient() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const reduxUser = useSelector((state) => state.auth.user);
    const logout = () => {
        Swal.fire({
            title: "Yakin ingin logout?",
            text: "Anda harus login lagi untuk mengakses akun!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya, logout!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(LogOut()).then(() => {
                    dispatch(reset());
                    sessionStorage.removeItem("redirectAfterLogin"); // Hapus redirect lama
                    navigate("/login", { replace: true }); // 🔥 hindari kembali ke state lama
                });

            }
        });
    };

    return (
        <React.Fragment>
            {/*begin::Header*/}
            <nav className="app-header navbar navbar-expand bg-body">
                {/*begin::Container*/}
                <div className="container-fluid">
                    {/*begin::Start Navbar Links*/}
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <a className="nav-link" data-lte-toggle="sidebar" href="#" role="button">
                                <i className="bi bi-list" />
                            </a>
                        </li>
                        {/* <li class="nav-item d-none d-md-block"><a href="#" class="nav-link">Home</a></li>
        <li class="nav-item d-none d-md-block"><a href="#" class="nav-link">Contact</a></li> */}
                    </ul>
                    {/*end::Start Navbar Links*/}
                    {/*begin::End Navbar Links*/}
                    <ul className="navbar-nav ms-auto">
                        {/*begin::Fullscreen Toggle*/}
                        <li className="nav-item">
                            <a className="nav-link" href="#" data-lte-toggle="fullscreen">
                                <i data-lte-icon="maximize" className="bi bi-arrows-fullscreen" />
                                <i data-lte-icon="minimize" className="bi bi-fullscreen-exit" style={{ display: "none" }} />
                            </a>
                        </li>
                        {/*end::Fullscreen Toggle*/}

                        {/*begin::Logout Icon*/}
                        <li className="nav-item">
                            <a className="nav-link text-danger" href="#" onClick={logout} title="Logout">
                                <i className="bi bi-box-arrow-right"></i>
                            </a>
                        </li>
                        {/*end::Logout Icon*/}

                        {/*begin::User Name (Tanpa Dropdown)*/}
                        <li className="nav-item">
                            <span className="nav-link">Hi, {reduxUser ? reduxUser.fullname : "Loading..."}</span>
                        </li>
                        {/*end::User Name*/}
                    </ul>
                    {/*end::End Navbar Links*/}
                </div>
                {/*end::Container*/}
            </nav>
            {/*end::Header*/}
            {/*begin::Sidebar*/}
            <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
                {/*begin::Sidebar Brand*/}
                <div className="sidebar-brand">
                    {/*begin::Brand Link*/}
                    <a href="./index.html" className="brand-link">
                        {/*begin::Brand Image*/}
                        <img src="../../dist/assets/img/logopers.png" alt="Logo" className="brand-image" />
                        {/*end::Brand Image*/}
                        {/*begin::Brand Text*/}
                        <span className="brand-text fw-light">TMS</span>
                        {/*end::Brand Text*/}
                    </a>
                    {/*end::Brand Link*/}
                </div>
                {/*end::Sidebar Brand*/}
                {/*begin::Sidebar Wrapper*/}
                <div className="sidebar-wrapper">
                    <nav className="mt-2">
                        {/*begin::Sidebar Menu*/}
                        <ul className="nav sidebar-menu flex-column" data-lte-toggle="treeview" role="menu" data-accordion="false">
                            <li className="nav-item">
                                <a href="#" className="nav-link">
                                    <i className="nav-icon fa fa-solid fa-users" />
                                    <p>
                                        Pekerja Kreatif
                                    </p>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a href="#" className="nav-link">
                                    <i className="nav-icon fa fa-solid fa-circle-check" />
                                    <p>
                                        Bukti Kerja
                                    </p>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a href="#" className="nav-link">
                                    <i className="nav-icon fa fa-solid fa-handshake" />
                                    <p>
                                        Kontrak
                                    </p>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a href="#" className="nav-link">
                                    <i className="nav-icon fa fa-solid fa-file" />
                                    <p>
                                        Laporan Retensi Pekerja
                                    </p>
                                </a>
                            </li>
                        </ul>
                        {/*end::Sidebar Menu*/}
                    </nav>
                </div>
                {/*end::Sidebar Wrapper*/}
            </aside>
            {/*end::Sidebar*/}
        </React.Fragment>
    );
}

export default Sidebarclient;