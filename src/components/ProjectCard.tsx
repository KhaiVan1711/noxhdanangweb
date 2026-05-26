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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-[24px] border border-brand-border overflow-hidden shadow-premium hover:shadow-2xl transition-all duration-350 hover:-translate-y-1.5 group flex flex-col h-full"
    >
      {/* Card Image Area */}
      <div className="relative h-60 overflow-hidden m-3 rounded-[18px]">
        <img
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          src={project.image}
          referrerPolicy="no-referrer"
        />
        {/* Status Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-white">
          <span className="relative flex h-2.5 w-2.5">
            {project.tag !== "completed" && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getBadgeColor(project.tag)}`}></span>
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${getBadgeColor(project.tag)}`}></span>
          </span>
          <span className="font-sans text-xs font-semibold text-primary-dark tracking-wide">
            {project.status}
          </span>
        </div>
        
        {/* Gradient Overlay and Title */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-5 pt-16">
          <h3 className="font-sans font-bold text-white text-lg md:text-xl leading-snug drop-shadow-sm line-clamp-1">
            {project.name}
          </h3>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 pt-2 flex-grow flex flex-col justify-between">
        <div className="space-y-4">
          {/* Location Pin */}
          <div className="flex items-start gap-2.5 text-brand-muted hover:text-black transition-colors duration-200">
            <MapPin className="h-4.5 w-4.5 shrink-0 mt-0.5 text-blue-600" />
            <p className="font-sans text-sm leading-relaxed line-clamp-2">
              {project.location}
            </p>
          </div>

          {/* Quick info row */}
          <div className="flex flex-col gap-1 text-xs text-brand-muted border-t border-brand-border/60 pt-3">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-blue-800" />
              Chủ đầu tư: <span className="font-medium text-primary-dark truncate">{project.investor}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ClipboardCheck className="h-3.5 w-3.5 text-green-700" />
              Quy mô: <span className="font-medium text-slate-800 line-clamp-1">{project.scale}</span>
            </span>
          </div>
        </div>

        {/* Dynamic breakdown of price and construction stage */}
        <div className="grid grid-cols-2 gap-4 border-y border-brand-border/60 py-4 my-4">
          <div>
            <p className="font-sans text-[11px] text-brand-muted uppercase tracking-wider">
              {project.tag === "completed" ? "Trạng thái quỹ" : "Giá dự kiến"}
            </p>
            <p className="font-sans text-base font-bold text-primary-dark">
              {project.price}
              {project.tag !== "completed" && <span className="text-[11px] font-normal text-brand-muted"> /m²</span>}
            </p>
          </div>
          <div>
            <div className="flex justify-between items-end mb-1">
              <p className="font-sans text-[11px] text-brand-muted uppercase tracking-wider">
                Tiến độ thi công
              </p>
              <span className="font-sans text-xs text-primary-dark font-bold">
                {project.progress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${project.tag === 'completed' ? 'from-amber-500 to-amber-600' : 'from-primary-dark to-accent-cyan'} rounded-full`}
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(project.id)}
            className="flex-1 py-2.5 bg-primary-dark text-white rounded-xl text-xs font-semibold hover:bg-opacity-95 transition-all shadow-sm hover:shadow-md cursor-pointer block text-center"
          >
            Xem chi tiết
          </button>
          {onShowLoc && (
            <button
              onClick={() => onShowLoc(project)}
              className="px-3 bg-slate-100 hover:bg-slate-200 text-primary-dark rounded-xl transition-colors flex items-center justify-center border border-slate-200"
              title="Định vị trên bản đồ GIS"
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
