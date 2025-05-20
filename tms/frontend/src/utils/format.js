// src/utils/format.js
export const formatCurrency = (value) => {
    if (!value) return "";
    const numeric = typeof value === "string" ? value.replace(/[^\d]/g, "") : value;
    return Number(numeric).toLocaleString("id-ID");
};
