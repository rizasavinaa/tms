import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./sidebarit";
import Footer from "./footer";
import Jsfunction from "./jsfunction";
import useAuthRedirect from "../features/authRedirect";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api/api";

const Ithome = () => {
  useAuthRedirect(1);
  const [chartData, setChartData] = useState([]);

  const COLORS = ["#0A2D5F", "#133F83"];
  useEffect(() => {
    api.get(`/user-summary`)
      .then((res) => {
        setChartData(res.data);
      })
      .catch((err) => {
        console.error("Gagal ambil data summary:", err);
      });
  }, []);

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
              <div className="col-sm-6"><h3 className="mb-0">Jumlah User dalam Sistem Saat Ini</h3></div>
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
          <div className="row justify-content-start">
            <div className="col-md-6">
              <div style={{ width: "100%", height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ value }) => value}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>ß
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
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

export default Ithome;
