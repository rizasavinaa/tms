import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../features/authSlice";
import Sidebar from "./sidebarit";
import Footer from "./footer";
import Jsfunction from "./jsfunction";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isError } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      navigate("/");
      setTimeout(() => {
        window.location.reload(); // Paksa reload setelah navigasi
    }, 100);
    }
  }, [isError, navigate]);

  return (
    <React.Fragment>
        <Sidebar/>
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
        <Jsfunction/>
        <Footer/>
    </React.Fragment>
  );
};

export default Dashboard;