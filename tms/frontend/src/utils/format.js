// src/utils/format.js
export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "";
  
  // Jika string, parse jadi float dulu (hapus koma jika ada)
  let numberValue = typeof value === "string"
    ? parseFloat(value.replace(/,/g, ""))
    : value;

  if (isNaN(numberValue)) return "";

  // Format jadi string dengan ribuan dan tanpa desimal
  return numberValue.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};


export const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
};
