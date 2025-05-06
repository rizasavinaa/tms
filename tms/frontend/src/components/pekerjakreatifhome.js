import React, { useState, useEffect } from "react";
import Sidebar from "./sidebarpekerjakreatif";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import useAuthRedirect from "../features/authRedirect";

const Pekerjakreatifhome = () => {
  useAuthRedirect(3);
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

export default Pekerjakreatifhome;
