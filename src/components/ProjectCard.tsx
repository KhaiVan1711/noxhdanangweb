import { motion } from "motion/react";
import { Project } from "../types";
import { MapPin, Phone, Building2, Calendar, ClipboardCheck } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onViewDetails: (id: string) => void;
  onShowLoc?: (project: Project) => void;
}

export function ProjectCard({ project, onViewDetails, onShowLoc }: ProjectCardProps) {
  const getBadgeColor = (tag: string) => {
    switch (tag) {
      case "receiving":
        return "bg-green-500";
      case "coming_soon":
        return "bg-blue-500";
      case "completed":
        return "bg-amber-600";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col h-full"
    >
      {/* Card Image Area */}
      <div className="relative h-56 overflow-hidden m-2 rounded-xl">
        <img
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
          src={project.image}
          referrerPolicy="no-referrer"
        />
        {/* Status Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-slate-100">
          <span className="relative flex h-2 w-2">
            <span className={`relative inline-flex rounded-full h-2 w-2 ${getBadgeColor(project.tag)}`}></span>
          </span>
          <span className="font-sans text-[10px] font-bold text-slate-800 tracking-wide uppercase">
            {project.status}
          </span>
        </div>
        
        {/* Deep Slate Dark Overlay and Title */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent p-4 pt-12">
          <h3 className="font-sans font-bold text-white text-md leading-snug drop-shadow-sm line-clamp-1">
            {project.name}
          </h3>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 pt-1.5 flex-grow flex flex-col justify-between">
        <div className="space-y-3">
          {/* Location Pin */}
          <div className="flex items-start gap-2 text-slate-600 hover:text-black transition-colors duration-200">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#00355f]" />
            <p className="font-sans text-xs leading-normal line-clamp-2">
              {project.location}
            </p>
          </div>

          {/* Quick info row */}
          <div className="flex flex-col gap-1 text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#00355f]" />
              Chủ đầu tư: <span className="font-semibold text-slate-800 truncate">{project.investor}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ClipboardCheck className="h-3.5 w-3.5 text-slate-600" />
              Quy mô: <span className="font-semibold text-slate-800 line-clamp-1">{project.scale}</span>
            </span>
          </div>
        </div>

        {/* Dynamic breakdown of price and construction stage */}
        <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-3 my-3">
          <div>
            <p className="font-sans text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {project.tag === "completed" ? "Trạng thái quỹ" : "Giá dự kiến"}
            </p>
            <p className="font-sans text-sm font-extrabold text-[#00355f]">
              {project.price}
              {project.tag !== "completed" && <span className="text-[10px] font-medium text-slate-400"> /m²</span>}
            </p>
          </div>
          <div>
            <div className="flex justify-between items-end mb-1">
              <p className="font-sans text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Tiến độ thi công
              </p>
              <span className="font-sans text-xs text-[#00355f] font-extrabold">
                {project.progress}%
              </span>
            </div>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${project.tag === 'completed' ? 'bg-amber-600' : 'bg-[#00355f]'} rounded-full`}
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(project.id)}
            className="flex-1 py-2 bg-[#00355f] text-white rounded-lg text-xs font-semibold hover:bg-opacity-95 transition-all cursor-pointer block text-center"
          >
            Xem chi tiết
          </button>
          {onShowLoc && (
            <button
              onClick={() => onShowLoc(project)}
              className="px-2.5 bg-slate-50 hover:bg-slate-100 text-[#00355f] rounded-lg transition-colors flex items-center justify-center border border-slate-150"
              title="Định vị trên bản đồ GIS"
            >
              <span className="material-symbols-outlined text-[16px]">map</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
