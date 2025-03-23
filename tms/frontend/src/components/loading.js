import React from "react";

const Loading = () => {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ 
        height: "100vh",  // 100% tinggi viewport
        width: "100vw",   // 100% lebar viewport
        position: "fixed", // Tetap di tengah saat scroll
        top: 0,
        left: 0,
        backgroundColor: "rgba(255, 255, 255, 0.8)", // Latar belakang semi transparan
        zIndex: 9999, // Pastikan berada di atas elemen lain
      }}
    >
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default Loading;
