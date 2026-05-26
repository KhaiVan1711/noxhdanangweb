import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Project } from "../types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Search,
  Building2,
  Eye,
  ZoomIn,
  ZoomOut,
  Compass,
  LocateFixed,
  Layers3,
  X,
  SlidersHorizontal,
  ChevronDown,
  Home,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface GisMapProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project | null) => void;
  onViewDetails: (id: string) => void;
}

type TileMode = "light" | "dark" | "satellite";
type TagFilter = "all" | "receiving" | "coming_soon" | "completed";
type SortMode = "default" | "price_asc" | "price_desc" | "name";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const DANANG_CENTER: [number, number] = [16.0544, 108.2022];

const TILE_CONFIGS: Record<TileMode, { url: string; attribution: string }> = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri",
  },
};

const TAG_META: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  receiving: {
    label: "Đang nhận hồ sơ",
    color: "#059669",
    bg: "bg-emerald-50 text-emerald-700",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  coming_soon: {
    label: "Sắp mở bán",
    color: "#2563eb",
    bg: "bg-blue-50 text-blue-700",
    icon: <Clock className="w-3 h-3" />,
  },
  completed: {
    label: "Đã bàn giao",
    color: "#d97706",
    bg: "bg-amber-50 text-amber-700",
    icon: <Home className="w-3 h-3" />,
  },
};

// ─── HOOKS ────────────────────────────────────────────────────────────────────

function useLeafletMap(containerRef: React.RefObject<HTMLDivElement>) {
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DANANG_CENTER,
      zoom: 12,
      zoomControl: false,
      attributionControl: true,
    });

    const cfg = TILE_CONFIGS.light;
    const tileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: 20,
    }).addTo(map);

    const markerLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    markerLayerRef.current = markerLayer;
    tileLayerRef.current = tileLayer;

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      tileLayerRef.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  return { mapRef, markerLayerRef, tileLayerRef, userMarkerRef };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function buildMarkerHtml(color: string, isSelected: boolean): string {
  return `
    <div style="
      width:${isSelected ? 40 : 34}px;
      height:${isSelected ? 40 : 34}px;
      border-radius:50%;
      background:white;
      border:3px solid ${color};
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 6px 20px rgba(0,0,0,${isSelected ? 0.35 : 0.2});
      position:relative;
      transition:all .25s cubic-bezier(.34,1.56,.64,1);
    ">
      ${isSelected ? `
        <div style="
          position:absolute;
          inset:-9px;
          border-radius:50%;
          border:2.5px solid ${color};
          opacity:.35;
          animation:ping 1.4s ease infinite;
        "></div>
      ` : ""}
      <div style="
        width:${isSelected ? 13 : 10}px;
        height:${isSelected ? 13 : 10}px;
        border-radius:50%;
        background:${color};
      "></div>
    </div>
  `;
}

function buildPopupHtml(proj: Project, color: string): string {
  const meta = TAG_META[proj.tag] ?? TAG_META.completed;
  return `
    <div style="
      min-width:240px;
      font-family:'Be Vietnam Pro',system-ui,sans-serif;
      padding:4px 2px;
    ">
      <div style="
        font-size:13.5px;
        font-weight:700;
        color:#0f172a;
        margin-bottom:5px;
        line-height:1.35;
      ">${proj.name}</div>

      <div style="
        display:flex;
        align-items:center;
        gap:5px;
        font-size:11.5px;
        color:#64748b;
        margin-bottom:12px;
      ">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        ${proj.location}
      </div>

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
      ">
        <div style="
          display:inline-flex;
          align-items:center;
          gap:5px;
          font-size:11px;
          padding:4px 10px;
          border-radius:999px;
          background:${color}18;
          color:${color};
          font-weight:600;
        ">${meta.label}</div>

        <div style="
          font-size:14px;
          font-weight:800;
          color:#0f172a;
          letter-spacing:-0.3px;
        ">${proj.price}</div>
      </div>
    </div>
  `;
}

function parsePrice(price: string): number {
  const n = parseFloat(price.replace(/[^\d.]/g, ""));
  if (price.toLowerCase().includes("tỷ")) return n * 1_000_000_000;
  if (price.toLowerCase().includes("triệu")) return n * 1_000_000;
  return n;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function GisMap({
  projects,
  selectedProject,
  onSelectProject,
  onViewDetails,
}: GisMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<TagFilter>("all");
  const [tileMode, setTileMode] = useState<TileMode>("light");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // States for Mobile Optimizations
  const [activeMobileView, setActiveMobileView] = useState<"list" | "map">("map");
  const [mobileLegendOpen, setMobileLegendOpen] = useState(false);
  const [mobileTileMenuOpen, setMobileTileMenuOpen] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { mapRef, markerLayerRef, tileLayerRef, userMarkerRef } =
    useLeafletMap(mapContainerRef);

  // Switch to map view on mobile if a project is selected from outside
  useEffect(() => {
    if (selectedProject && window.innerWidth < 1024) {
      setActiveMobileView("map");
    }
  }, [selectedProject]);

  // Adjust Leaflet map sizing dynamically on mobile view toggling
  useEffect(() => {
    if (activeMobileView === "map" && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 150);
    }
  }, [activeMobileView]);

  const handleSelectProjectMobile = (proj: Project) => {
    onSelectProject(proj);
    if (window.innerWidth < 1024) {
      setActiveMobileView("map");
    }
  };

  // ── FILTERED + SORTED PROJECTS ──────────────────────────────────────────────

  const filteredProjects = useMemo(() => {
    let list = projects.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q);
      const matchTag = filterTag === "all" || p.tag === filterTag;
      return matchSearch && matchTag;
    });

    switch (sortMode) {
      case "price_asc":
        list = [...list].sort(
          (a, b) => parsePrice(a.price) - parsePrice(b.price)
        );
        break;
      case "price_desc":
        list = [...list].sort(
          (a, b) => parsePrice(b.price) - parsePrice(a.price)
        );
        break;
      case "name":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return list;
  }, [projects, searchQuery, filterTag, sortMode]);

  // ── TILE LAYER UPDATE ────────────────────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    const cfg = TILE_CONFIGS[tileMode];
    tileLayerRef.current = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: 20,
    }).addTo(map);
  }, [tileMode]);

  // ── MARKERS UPDATE ───────────────────────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const bounds: L.LatLngExpression[] = [];

    filteredProjects.forEach((proj) => {
      if (!proj.lat || !proj.lng) return;
      bounds.push([proj.lat, proj.lng]);

      const isSelected = selectedProject?.id === proj.id;
      const meta = TAG_META[proj.tag] ?? TAG_META.completed;
      const color = meta.color;

      const icon = L.divIcon({
        html: buildMarkerHtml(color, isSelected),
        className: "",
        iconSize: isSelected ? [40, 40] : [34, 34],
        iconAnchor: isSelected ? [20, 40] : [17, 34],
      });

      const marker = L.marker([proj.lat, proj.lng], { icon });
      marker.addTo(layer);
      marker.on("click", () => onSelectProject(proj));
      marker.bindPopup(buildPopupHtml(proj, color), {
        className: "gis-popup",
        maxWidth: 280,
      });

      if (isSelected) marker.openPopup();
    });

    if (!selectedProject && bounds.length > 0) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [60, 60] });
    }
  }, [filteredProjects, selectedProject]);

  // ── FLY TO SELECTED ──────────────────────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedProject?.lat || !selectedProject?.lng) return;
    map.flyTo([selectedProject.lat, selectedProject.lng], 15, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [selectedProject]);

  // ── MAP CONTROLS ─────────────────────────────────────────────────────────────

  const handleZoomIn = useCallback(() => mapRef.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => mapRef.current?.zoomOut(), []);
  const handleReset = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    if (selectedProject?.lat && selectedProject?.lng) {
      map.flyTo([selectedProject.lat, selectedProject.lng], 15, {
        duration: 1,
      });
    } else {
      map.flyTo(DANANG_CENTER, 12, { duration: 1 });
    }
  }, [selectedProject]);

  const handleLocateUser = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
        const m = L.circleMarker([coords.latitude, coords.longitude], {
          radius: 10,
          fillColor: "#2563eb",
          color: "#ffffff",
          weight: 3,
          fillOpacity: 1,
        })
          .addTo(map)
          .bindPopup("Vị trí của bạn");
        userMarkerRef.current = m;
        map.flyTo([coords.latitude, coords.longitude], 15, { duration: 1.2 });
      },
      () => alert("Không thể lấy vị trí GPS.")
    );
  }, []);

  // ── STAT COUNTS ──────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const receiving = projects.filter((p) => p.tag === "receiving").length;
    const coming = projects.filter((p) => p.tag === "coming_soon").length;
    const handed = projects.filter((p) => p.tag === "completed").length;
    return { receiving, coming, handed, total: projects.length };
  }, [projects]);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* LEAFLET POPUP GLOBAL STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
        .gis-popup .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.15) !important;
          border: 1px solid #e2e8f0;
          padding: 0;
        }
        .gis-popup .leaflet-popup-content {
          margin: 16px 18px !important;
        }
        .gis-popup .leaflet-popup-tip-container {
          display: none;
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: .4; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>

      <div
        style={{ fontFamily: "'Be Vietnam Pro', system-ui, sans-serif" }}
        className="grid grid-cols-1 lg:grid-cols-12 h-[580px] md:h-[740px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl relative"
      >
        {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
        <div className={`lg:col-span-4 flex flex-col border-r border-slate-100 bg-white overflow-hidden ${
          activeMobileView === "list" ? "flex h-full w-full" : "hidden lg:flex"
        }`}>

          {/* HEADER */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-200">
                  <Building2 className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-800 text-slate-900 tracking-tight font-extrabold">
                    GIS NOXH ĐÀ NẴNG
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Hệ thống bản đồ nhà ở xã hội
                  </div>
                </div>
              </div>
              <div className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                {stats.total} dự án
              </div>
            </div>

            {/* STATS ROW */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                {
                  label: "Nhận hồ sơ",
                  value: stats.receiving,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  label: "Sắp mở bán",
                  value: stats.coming,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  label: "Bàn giao",
                  value: stats.handed,
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`${s.bg} rounded-2xl px-3 py-2.5 text-center`}
                >
                  <div className={`text-lg font-extrabold ${s.color}`}>
                    {s.value}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* SEARCH */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, địa điểm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full pl-10 pr-10 py-2.5
                  rounded-2xl border border-slate-200
                  bg-white text-sm text-slate-700
                  placeholder:text-slate-400
                  outline-none
                  focus:border-blue-400 focus:ring-3 focus:ring-blue-500/10
                  transition-all
                "
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* FILTER ROW */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 flex-1 overflow-auto no-scrollbar">
                {(
                  [
                    { key: "all", label: "Tất cả" },
                    { key: "receiving", label: "Nhận hồ sơ" },
                    { key: "coming_soon", label: "Sắp mở" },
                    { key: "completed", label: "Bàn giao" },
                  ] as { key: TagFilter; label: string }[]
                ).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilterTag(f.key)}
                    className={`
                      px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all
                      ${
                        filterTag === f.key
                          ? f.key === "receiving"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : f.key === "coming_soon"
                            ? "bg-blue-600 text-white shadow-sm"
                            : f.key === "completed"
                            ? "bg-amber-500 text-white shadow-sm"
                            : "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }
                    `}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* SORT DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu((p) => !p)}
                  className="
                    flex items-center gap-1.5 px-3 py-1.5
                    rounded-xl border border-slate-200
                    text-[11px] font-semibold text-slate-600
                    hover:bg-slate-50 transition-all
                  "
                >
                  <TrendingUp className="w-3 h-3" />
                  Sắp xếp
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${showSortMenu ? "rotate-180" : ""}`}
                  />
                </button>

                {showSortMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                    {[
                      { key: "default", label: "Mặc định" },
                      { key: "name", label: "Tên A→Z" },
                      { key: "price_asc", label: "Giá tăng dần" },
                      { key: "price_desc", label: "Giá giảm dần" },
                    ].map((s) => (
                      <button
                        key={s.key}
                        onClick={() => {
                          setSortMode(s.key as SortMode);
                          setShowSortMenu(false);
                        }}
                        className={`
                          w-full text-left px-4 py-2.5 text-xs font-medium transition-colors
                          ${
                            sortMode === s.key
                              ? "bg-blue-50 text-blue-700"
                              : "text-slate-700 hover:bg-slate-50"
                          }
                        `}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PROJECT LIST */}
          <div className="flex-1 overflow-y-auto">
            {filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <Search className="w-10 h-10 opacity-30" />
                <div className="text-sm font-medium">
                  Không tìm thấy dự án phù hợp
                </div>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterTag("all");
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              filteredProjects.map((proj) => {
                const isSelected = selectedProject?.id === proj.id;
                const meta = TAG_META[proj.tag] ?? TAG_META.completed;

                return (
                  <div
                    key={proj.id}
                    onClick={() => handleSelectProjectMobile(proj)}
                    className={`
                      px-5 py-3.5
                      border-b border-slate-100
                      cursor-pointer
                      transition-all duration-150
                      hover:bg-slate-50
                      ${
                        isSelected
                          ? "bg-blue-50 border-l-[3px] border-l-blue-600"
                          : "border-l-[3px] border-l-transparent"
                      }
                    `}
                  >
                    <div className="flex gap-3 items-start">
                      {/* COLOR DOT */}
                      <div
                        className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: meta.color }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="text-[13px] font-semibold text-slate-900 line-clamp-1 leading-tight">
                            {proj.name}
                          </div>
                          <div className="text-xs font-bold text-blue-700 whitespace-nowrap">
                            {proj.price}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="line-clamp-1">{proj.location}</span>
                        </div>

                        <div
                          className={`
                            inline-flex items-center gap-1
                            px-2 py-0.5 rounded-full
                            text-[10px] font-semibold
                            ${meta.bg}
                          `}
                        >
                          {meta.icon}
                          {meta.label}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* SELECTED PROJECT FOOTER */}
          {selectedProject && (
            <div className="p-4 border-t border-slate-200 bg-gradient-to-t from-slate-50 to-white">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{
                    backgroundColor:
                      TAG_META[selectedProject.tag]?.color ?? "#64748b",
                  }}
                />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 line-clamp-1">
                    {selectedProject.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {selectedProject.location}
                  </div>
                  <div className="text-sm font-extrabold text-blue-700 mt-1">
                    {selectedProject.price}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onViewDetails(selectedProject.id)}
                className="
                  w-full h-10 rounded-2xl
                  bg-gradient-to-r from-slate-900 to-slate-800
                  text-white text-sm font-semibold
                  hover:opacity-90 active:scale-[.98]
                  transition-all
                  flex items-center justify-center gap-2
                  shadow-lg shadow-slate-900/20
                "
              >
                <Eye className="w-4 h-4" />
                Xem chi tiết dự án
              </button>
            </div>
          )}
        </div>

        {/* ── MAP PANEL ────────────────────────────────────────────────────── */}
        <div className={`lg:col-span-8 relative ${
          activeMobileView === "map" ? "block h-full w-full" : "hidden lg:block h-full w-full"
        }`}>
          <div ref={mapContainerRef} className="absolute inset-0 z-0" />

          {/* TILE SWITCHER (COLLAPSIBLE FOR MOBILE) */}
          <div className={`
            absolute top-4 left-4 z-[1000]
            bg-white/95 backdrop-blur-xl border border-slate-200 shadow-lg rounded-2xl transition-all duration-300
            ${mobileTileMenuOpen ? "p-3 block" : "p-0 w-11 h-11 flex items-center justify-center rounded-2xl shadow-md border-slate-200 hover:bg-slate-50 cursor-pointer lg:p-3 lg:w-auto lg:h-auto lg:rounded-2xl lg:shadow-lg"}
          `}
            onClick={() => {
              if (window.innerWidth < 1024 && !mobileTileMenuOpen) setMobileTileMenuOpen(true);
            }}
          >
            {(!mobileTileMenuOpen && window.innerWidth < 1024) ? (
              <div className="flex items-center justify-center text-slate-700 w-11 h-11" title="Đổi bản đồ">
                <Layers3 className="w-5 h-5" />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <Layers3 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Bản đồ
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMobileTileMenuOpen(false);
                    }}
                    className="lg:hidden text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex gap-1.5">
                  {(["light", "dark", "satellite"] as TileMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTileMode(m);
                        if (window.innerWidth < 1024) setMobileTileMenuOpen(false);
                      }}
                      className={`
                        px-3 py-1.5 rounded-xl text-[11px] font-semibold capitalize transition-all
                        ${
                          tileMode === m
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }
                      `}
                    >
                      {m === "light" ? "Sáng" : m === "dark" ? "Tối" : "Vệ tinh"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MAP CONTROLS */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            {[
              {
                icon: <ZoomIn className="w-4 h-4 text-slate-700" />,
                onClick: handleZoomIn,
                className: "bg-white hover:bg-slate-50 border border-slate-200",
              },
              {
                icon: <ZoomOut className="w-4 h-4 text-slate-700" />,
                onClick: handleZoomOut,
                className: "bg-white hover:bg-slate-50 border border-slate-200",
              },
              {
                icon: <Compass className="w-4 h-4 text-slate-700" />,
                onClick: handleReset,
                className: "bg-white hover:bg-slate-50 border border-slate-200",
              },
              {
                icon: <LocateFixed className="w-4 h-4 text-white" />,
                onClick: handleLocateUser,
                className:
                  "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200",
              },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                className={`
                  w-10 h-10 md:w-11 md:h-11 rounded-2xl shadow-md
                  flex items-center justify-center
                  transition-all active:scale-95
                  ${btn.className}
                `}
              >
                {btn.icon}
              </button>
            ))}
          </div>

          {/* LEGEND (COLLAPSIBLE FOR MOBILE) */}
          <div className={`
            absolute bottom-4 left-4 z-[1000]
            bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl rounded-2xl transition-all duration-300
            ${mobileLegendOpen ? "p-4 min-w-[200px] block" : "p-0 w-11 h-11 flex items-center justify-center rounded-2xl shadow-md border-slate-200 hover:bg-slate-50 cursor-pointer lg:p-4 lg:min-w-[200px] lg:w-auto lg:h-auto lg:rounded-2xl lg:shadow-xl"}
          `}
            onClick={() => {
              if (window.innerWidth < 1024 && !mobileLegendOpen) setMobileLegendOpen(true);
            }}
          >
            {(!mobileLegendOpen && window.innerWidth < 1024) ? (
              <div className="flex items-center justify-center text-slate-700 w-11 h-11" title="Chú thích">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Trạng thái
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMobileLegendOpen(false);
                    }}
                    className="lg:hidden text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(TAG_META).map(([key, m]) => (
                    <div key={key} className="flex items-center gap-2.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: m.color }}
                      />
                      <span className="text-[11px] font-medium text-slate-700">
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BRANDING */}
          <div className="hidden md:block absolute bottom-4 right-4 z-[1000] bg-white/90 backdrop-blur-xl border border-slate-200 shadow-md rounded-2xl px-4 py-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
              GIS NOXH ĐÀ NẴNG
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              OpenStreetMap · Leaflet
            </div>
          </div>

          {/* RESULT COUNT BADGE */}
          {filteredProjects.length !== projects.length && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000]">
              <div className="bg-slate-900/90 backdrop-blur text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                Đang hiển thị {filteredProjects.length} / {projects.length} dự án
              </div>
            </div>
          )}

          {/* SELECTED PROJECT MOBILE FLOATING CARD */}
          {selectedProject && (
            <div className="absolute bottom-4 left-4 right-4 z-[1001] bg-white border border-slate-200 shadow-2xl rounded-3xl p-4 flex flex-col gap-3 lg:hidden">
              <div className="flex justify-between items-start">
                <div className="flex gap-2.5 items-start">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
                    <Building2 className="w-5 h-5 text-blue-700" />
                  </div>
                  <div className="min-w-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${TAG_META[selectedProject.tag]?.bg || "bg-slate-100 text-slate-700"} mb-1`}>
                      {TAG_META[selectedProject.tag]?.icon}
                      {TAG_META[selectedProject.tag]?.label || selectedProject.status}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-tight line-clamp-1">
                      {selectedProject.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5 leading-none">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="line-clamp-1">{selectedProject.location}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectProject(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Giá bàn giao dự tính</span>
                  <span className="text-sm font-black text-blue-700">{selectedProject.price}</span>
                </div>

                <button
                  onClick={() => onViewDetails(selectedProject.id)}
                  className="px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl text-xs font-bold shadow-lg shadow-slate-900/10 hover:opacity-95 transition-all text-center flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> Chi tiết dự án
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MOBILE VIEW TOGGLE COCKPIT PILL */}
        {(!selectedProject || activeMobileView !== "map") && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1002] lg:hidden flex bg-slate-950/95 hover:bg-slate-900 border border-white/10 text-white rounded-full p-1 shadow-2xl backdrop-blur-md transition-all active:scale-[0.98]">
            <button
              onClick={() => setActiveMobileView("list")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMobileView === "list"
                  ? "bg-white text-slate-950 shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Danh sách
            </button>
            <button
              onClick={() => setActiveMobileView("map")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMobileView === "map"
                  ? "bg-white text-slate-950 shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Layers3 className="w-3.5 h-3.5" />
              Bản đồ
            </button>
          </div>
        )}
      </div>
    </>
  );
}