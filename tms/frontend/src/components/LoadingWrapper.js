import React, { useState, useEffect } from "react";
import Loading from "../components/loading";
import useAuthRedirect from "../features/authRedirect";

// Membungkus komponen yang membutuhkan loading
const LoadingWrapper = ({ children }) => {
    const [loading, setLoading] = useState(true); // State loading untuk menandakan status loading
    const redirectLoading = useAuthRedirect(3); // Hook verifikasi otentikasi

    useEffect(() => {
        if (redirectLoading === false) {
            setLoading(false); // Set loading ke false setelah pengecekan selesai
        }
    }, [redirectLoading]); // Pastikan hanya sekali ketika redirectLoading berubah

    if (loading) {
        return <Loading />; // Jika masih loading, tampilkan komponen Loading
    }

    return children; // Setelah loading selesai, tampilkan children (komponen utama)
};

export default LoadingWrapper;
