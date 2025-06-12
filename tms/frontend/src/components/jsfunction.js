import { useRef, useEffect } from "react";
import ApexCharts from "apexcharts";
import { OverlayScrollbars } from "overlayscrollbars";
import Sortable from "sortablejs";

const OverlayScrollbarsGlobal = window.OverlayScrollbarsGlobal;
// const Sortable = window.Sortable;

function loadScript(src, integrity = "", crossorigin = "anonymous") {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true); // Cegah pemuatan ulang

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    if (integrity) script.integrity = integrity;
    if (crossorigin) script.crossOrigin = crossorigin;

    script.onload = () => resolve(true);
    script.onerror = () => reject(false);
    document.body.appendChild(script);
  });
}

function initOverlayScrollbars() {
  const SELECTOR_SIDEBAR_WRAPPER = ".sidebar-wrapper";
  const Default = {
    scrollbarTheme: "os-theme-light",
    scrollbarAutoHide: "leave",
    scrollbarClickScroll: true,
  };

  const sidebarWrapper = document.querySelector(SELECTOR_SIDEBAR_WRAPPER);
  if (sidebarWrapper && typeof OverlayScrollbarsGlobal?.OverlayScrollbars !== "undefined") {
    OverlayScrollbarsGlobal.OverlayScrollbars(sidebarWrapper, {
      scrollbars: {
        theme: Default.scrollbarTheme,
        autoHide: Default.scrollbarAutoHide,
        clickScroll: Default.scrollbarClickScroll,
      },
    });
  }
}

function initSortable() {
  const connectedSortables = document.querySelectorAll(".connectedSortable");
  connectedSortables.forEach((connectedSortable) => {
    new Sortable(connectedSortable, {
      group: "shared",
      handle: ".card-header",
    });
  });

  document.querySelectorAll(".connectedSortable .card-header").forEach((cardHeader) => {
    cardHeader.style.cursor = "move";
  });
}

function initCharts() {
  const options = {
    series: [
      { name: "Digital Goods", data: [28, 48, 40, 19, 86, 27, 90] },
      { name: "Electronics", data: [65, 59, 80, 81, 56, 55, 40] },
    ],
    chart: { height: 300, type: "area", toolbar: { show: false } },
    legend: { show: false },
    colors: ["#0d6efd", "#20c997"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" },
    xaxis: {
      type: "datetime",
      categories: ["2023-01-01", "2023-02-01", "2023-03-01", "2023-04-01", "2023-05-01", "2023-06-01", "2023-07-01"],
    },
    tooltip: { x: { format: "MMMM yyyy" } },
  };

  const chart = new ApexCharts(document.querySelector("#revenue-chart"), options);
  chart.render();
}

function App() {
  const isScriptLoaded = useRef(false);

  useEffect(() => {
    if (isScriptLoaded.current) return;
    isScriptLoaded.current = true;

    async function loadAllScripts() {
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/overlayscrollbars@2.10.1/browser/overlayscrollbars.browser.es6.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js");
        await loadScript("/dist/js/adminlte.js");
        await loadScript("https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/apexcharts@3.37.1/dist/apexcharts.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jsvectormap/1.4.3/js/jsvectormap.min.js");
        window.jsVectorMap = window.jsVectorMap || window.jsvectormap || undefined;
        await loadScript("https://cdn.jsdelivr.net/npm/jsvectormap@1.5.3/dist/maps/world.js");


        console.log("Semua script telah dimuat.");

        // Jalankan inisialisasi setelah script selesai dimuat
        initOverlayScrollbars();
        initSortable();
        //initCharts();
      } catch (error) {
        console.error("Gagal memuat salah satu script eksternal.");
      }
    }

    loadAllScripts();
  }, []);

  return (
    ''
  );
}

export default App;


