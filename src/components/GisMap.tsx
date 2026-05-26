import React, { useState, useEffect, useRef } from "react";
import { Project } from "../types";
import { MapPin, Search, Building2, Eye, ZoomIn, ZoomOut, Compass } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface GisMapProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onViewDetails: (id: string) => void;
}

export function GisMap({ projects, selectedProject, onSelectProject, onViewDetails }: GisMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string>("all");
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = filterTag === "all" || p.tag === filterTag;
    return matchesSearch && matchesTag;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Centered at Da Nang City Coordinates
    const map = L.map(mapContainerRef.current, {
      center: [16.0544, 108.2022],
      zoom: 12,
      zoomControl: false,
      attributionControl: true,
    });

    // Elegant CartoDB Voyager tile layer (Beautiful, clean light theme matching the app aesthetic - No API Key required)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markersGroupRef.current = markersGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersGroupRef.current = null;
    };
  }, []);

  // Update Markers when project lists or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    filteredProjects.forEach((proj) => {
      if (!proj.lat || !proj.lng) return;

      const isSelected = selectedProject?.id === proj.id;
      
      const pinColor = proj.tag === "receiving" ? "#10b981" : // Emerald green
                       proj.tag === "coming_soon" ? "#2563eb" : // Blue
                       "#d97706"; // Amber orange

      const ringColor = proj.tag === "receiving" ? "bg-emerald-500" :
                        proj.tag === "coming_soon" ? "bg-blue-500" :
                        "bg-amber-500";

      // Styled DivIcon with responsive custom styling & hover effects
      const customPinHtml = `
        <div class="relative flex items-center justify-center">
          ${isSelected ? `<div class="absolute -inset-2.5 animate-ping ${ringColor} rounded-full opacity-25"></div>` : ""}
          <div class="w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110" 
               style="border-color: ${pinColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.15)">
            <span class="material-symbols-outlined text-[17px] font-bold" style="color: ${pinColor}">location_on</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customPinHtml,
        className: "custom-div-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      // Bind precise click properties
      const marker = L.marker([proj.lat, proj.lng], { icon: customIcon })
        .addTo(markersGroup)
        .on("click", () => {
          onSelectProject(proj);
        });

      // Simple elegant Leaflet tooltip or bound details
      const popupContent = `
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 180px;">
          <h4 style="margin: 0 0 4px 0; font-size: 12px; font-weight: bold; color: #00355f; line-height: 1.3;">${proj.name}</h4>
          <p style="margin: 0 0 8px 0; font-size: 10px; color: #64748b; font-weight: 500;">${proj.location}</p>
          <div style="display: flex; justify-between: space-between; align-items: center; justify-content: space-between; font-size: 10px; font-weight: bold; background: #f8fafc; padding: 4px 8px; border-radius: 6px;">
            <span style="color: ${pinColor}">${proj.status}</span>
            <span style="color: #0f172a">${proj.price}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        className: "custom-leaflet-popup"
      });

      // If this marker is selected, auto open its popup
      if (isSelected) {
        marker.openPopup();
      }
    });
  }, [filteredProjects, selectedProject, onSelectProject]);

  // Pan to selected project when selected from parent or sidebar listing
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedProject || !selectedProject.lat || !selectedProject.lng) return;

    map.setView([selectedProject.lat, selectedProject.lng], 14, {
      animate: true,
      duration: 0.8,
    });
  }, [selectedProject]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetCamera = () => {
    if (selectedProject && selectedProject.lat && selectedProject.lng) {
      mapInstanceRef.current?.setView([selectedProject.lat, selectedProject.lng], 14, {
        animate: true,
        duration: 0.8
      });
    } else {
      mapInstanceRef.current?.setView([16.0544, 108.2022], 12, {
        animate: true,
        duration: 0.8
      });
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-3xl overflow-hidden shadow-premium grid grid-cols-1 lg:grid-cols-12 h-[680px]">
      
      {/* Search and Project List Sidebar */}
      <div className="lg:col-span-4 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2 mb-3 select-none">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">explore</span>
            ĐỊNH VỊ NOXH GIS ĐÀ NẴNG
          </h3>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm dự án trên bản đồ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 font-sans text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hidden select-none">
            <button
              onClick={() => setFilterTag("all")}
              className={`px-3 py-1.5 font-sans text-xs rounded-lg whitespace-nowrap transition-all ${
                filterTag === "all"
                  ? "bg-primary-dark text-white shadow-sm font-semibold"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              Tất cả ({projects.length})
            </button>
            <button
              onClick={() => setFilterTag("receiving")}
              className={`px-3 py-1.5 font-sans text-xs rounded-lg whitespace-nowrap transition-all ${
                filterTag === "receiving"
                  ? "bg-emerald-600 text-white shadow-sm font-semibold"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
              }`}
            >
              Đang nhận hồ sơ
            </button>
            <button
              onClick={() => setFilterTag("coming_soon")}
              className={`px-3 py-1.5 font-sans text-xs rounded-lg whitespace-nowrap transition-all ${
                filterTag === "coming_soon"
                  ? "bg-blue-600 text-white shadow-sm font-semibold"
                  : "bg-blue-50 hover:bg-blue-100 text-blue-800"
              }`}
            >
              Sắp mở bán
            </button>
          </div>
        </div>

        {/* Scrollable listing */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredProjects.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-sans text-xs">
              Không tìm thấy dự án phù hợp bản đồ.
            </div>
          ) : (
            filteredProjects.map((proj) => {
              const isSelected = selectedProject?.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    onSelectProject(proj);
                  }}
                  className={`p-4 transition-all duration-200 cursor-pointer text-left hover:bg-slate-50 border-l-4 ${
                    isSelected 
                      ? "border-blue-600 bg-blue-50/40" 
                      : "border-transparent"
                  }`}
                >
                  <p className="font-sans font-semibold text-xs text-slate-900 line-clamp-1 mb-1">
                    {proj.name}
                  </p>
                  <p className="font-sans text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                    {proj.location}
                  </p>
                  
                  <div className="flex justify-between items-center text-[10px]">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                      proj.tag === 'receiving' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      proj.tag === 'coming_soon' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}>
                      {proj.status}
                    </span>
                    <span className="font-sans font-bold text-primary-dark">
                      {proj.price}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Project Box Details Footer */}
        {selectedProject && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-left">
            <div className="flex items-start gap-2 mb-2">
              <Building2 className="h-4 w-4 text-blue-800 mt-0.5 shrink-0" />
              <div>
                <p className="font-sans font-bold text-xs text-slate-900 line-clamp-1">
                  {selectedProject.name}
                </p>
                <p className="font-sans text-[11px] text-slate-500 line-clamp-1">
                  Giá: <span className="font-bold text-blue-700">{selectedProject.price}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onViewDetails(selectedProject.id)}
                className="flex-1 py-1.5 bg-primary-dark hover:bg-opacity-95 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" /> Chi tiết dự án
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Real Live Leaflet OpenStreetMap Map Area (100% Free - Works Out of the Box for Everyone) */}
      <div className="lg:col-span-8 relative bg-slate-100 overflow-hidden flex items-center justify-center w-full h-full min-h-[450px] lg:min-h-0">
        
        {/* Leaflet map hook container */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0 select-text" />

        {/* Dynamic Zoom & Control Panel Overlay (Standard custom buttons on the top right) */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1.5 shadow-md">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-800 rounded-xl flex items-center justify-center transition-all border border-slate-200 active:scale-95 cursor-pointer font-bold"
            title="Phóng to"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-800 rounded-xl flex items-center justify-center transition-all border border-slate-200 active:scale-95 cursor-pointer font-bold"
            title="Thu nhỏ"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleResetCamera}
            className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center transition-all border border-slate-200 active:scale-95 cursor-pointer"
            title="Định vị trung tâm"
          >
            <Compass className="h-4 w-4" />
          </button>
        </div>

        {/* Info Label overlay for 100% Free Leaflet announcement */}
        <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200/50 flex items-center gap-2 select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-sans text-[10px] text-slate-700 font-bold uppercase tracking-wider">
            Bản đồ OpenStreetMap Miễn Phí
          </span>
        </div>

        {/* Legend block overlay for quick status identification */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/92 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-slate-200 text-left text-[10px] font-sans text-slate-700 space-y-1.5 select-none max-w-[200px]">
          <div className="font-extrabold text-[#00355f] mb-1 tracking-wider uppercase">TRẠNG THÁI DỰ ÁN</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#10b981] rounded-full inline-block"></span>
            <span>Đang nhận hồ sơ đăng ký</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#2563eb] rounded-full inline-block"></span>
            <span>Sắp sửa mở bán</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#d97706] rounded-full inline-block"></span>
            <span>Đã bàn giao căn hộ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
