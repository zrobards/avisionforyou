"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AddLeadModalProps {
  onClose: () => void;
}

export function AddLeadModal({ onClose }: AddLeadModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    websiteUrl: "",
    category: "",
    city: "",
    state: "",
    source: "MANUAL",
    internalNotes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          hasWebsite: !!formData.websiteUrl,
        }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create lead");
      }
    } catch (error) {
      console.error("Failed to create lead:", error);
      alert("Failed to create lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-gray-700 bg-[#0a0e1a] shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-[#0a0e1a] px-6 py-4">
            <h2 className="text-xl font-heading font-bold text-white">
              Add New Lead
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  placeholder="ABC Nonprofit"
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@nonprofit.org"
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="(502) 555-1234"
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, websiteUrl: e.target.value })
                  }
                  placeholder="https://nonprofit.org"
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white focus:border-trinity-red focus:outline-none"
                >
                  <option value="">Select category...</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Mental Health">Mental Health</option>
                  <option value="Education">Education</option>
                  <option value="Community">Community</option>
                  <option value="Youth Development">Youth Development</option>
                  <option value="Social Services">Social Services</option>
                  <option value="Arts & Culture">Arts & Culture</option>
                  <option value="Housing">Housing</option>
                  <option value="Food Security">Food Security</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Louisville"
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value.toUpperCase().slice(0, 2) })
                  }
                  placeholder="KY"
                  maxLength={2}
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none uppercase"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.internalNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, internalNotes: e.target.value })
                  }
                  placeholder="Any relevant notes..."
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg border-2 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-trinity-red text-white font-medium hover:bg-trinity-maroon disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? "Creating..." : "Add Lead"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default AddLeadModal;








