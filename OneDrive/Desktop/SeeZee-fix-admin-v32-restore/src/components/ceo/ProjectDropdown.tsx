"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

interface ProjectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  projects: Project[];
  label?: string;
}

export default function ProjectDropdown({
  value,
  onChange,
  projects,
  label,
}: ProjectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const selectedProject = projects.find((p) => p.id === value);
  const displayValue = selectedProject ? selectedProject.name : "No project";

  const handleSelect = (projectId: string) => {
    onChange(projectId);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-between text-left"
      >
        <span className={value ? "text-white" : "text-slate-400"}>
          {displayValue}
        </span>
        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-slate-700 rounded transition-colors"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-auto">
          <div className="py-1">
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-700 transition-colors ${
                !value ? "bg-purple-600/20 text-purple-300" : "text-slate-300"
              }`}
            >
              No project
            </button>
            {projects.length === 0 ? (
              <div className="px-4 py-2 text-sm text-slate-400 text-center">
                No projects available
              </div>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => handleSelect(project.id)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-700 transition-colors ${
                    value === project.id
                      ? "bg-purple-600/20 text-purple-300"
                      : "text-slate-300"
                  }`}
                >
                  {project.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}









