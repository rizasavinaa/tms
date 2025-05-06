import React from "react";
import { useNavigate } from "react-router-dom";

const SelectTalentPage = () => {
  const navigate = useNavigate();

  // Function to navigate to the "porto-register" page with talentId
  const handleRedirect = (talentId) => {
    navigate(`/karyawan/porto-register/${talentId}`);
  };

  return (
    <div className="container mt-5">
      <h2>Pilih Pekerja Kreatif untuk Mengupload Portofolio</h2>
      <div className="mt-4">
        <button
          onClick={() => handleRedirect(1)} // Ganti dengan talentId yang sesuai
          className="btn btn-primary mr-2"
        >
          Pilih Talent 1
        </button>
        <button
          onClick={() => handleRedirect(2)} // Ganti dengan talentId yang sesuai
          className="btn btn-primary"
        >
          Pilih Talent 2
        </button>
      </div>
    </div>
  );
};

export default SelectTalentPage;
