"use client";

import { useState, useEffect } from "react";
import { Modal } from "./shared/Modal";
import { createClient, updateClient, deleteClient } from "@/server/actions/clients";
import { useRouter } from "next/navigation";
import { FiUser, FiMail, FiPhone, FiGlobe, FiMapPin } from "react-icons/fi";

interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
}

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  mode: "create" | "edit";
}

export function ClientModal({ isOpen, onClose, client, mode }: ClientModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    website: client?.website || "",
    address: client?.address || "",
    city: client?.city || "",
    state: client?.state || "",
    zip: client?.zip || "",
    country: client?.country || "",
  });

  // Reset form data when modal opens or client/mode changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: client?.name || "",
        email: client?.email || "",
        phone: client?.phone || "",
        website: client?.website || "",
        address: client?.address || "",
        city: client?.city || "",
        state: client?.state || "",
        zip: client?.zip || "",
        country: client?.country || "",
      });
      setError(null);
    }
  }, [isOpen, client, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let result;
    if (mode === "create") {
      result = await createClient(formData);
    } else if (client) {
      result = await updateClient(client.id, formData);
    }

    if (result?.success) {
      router.refresh();
      onClose();
    } else {
      setError(result?.error || "Failed to save client");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!client || !confirm("Are you sure you want to delete this client?")) return;

    setLoading(true);
    const result = await deleteClient(client.id);

    if (result.success) {
      router.refresh();
      onClose();
    } else {
      setError(result.error || "Failed to delete client");
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "New Client" : "Edit Client"}
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 rounded-lg border-2 border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              Delete Client
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 rounded-lg border-2 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="client-form"
              disabled={loading}
              className="px-6 py-2 rounded-lg border-2 border-trinity-red/50 bg-trinity-red text-white hover:bg-trinity-maroon transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : mode === "create" ? "Create Client" : "Save Changes"}
            </button>
          </div>
        </div>
      }
    >
      <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-heading font-semibold text-white mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <FiUser className="h-4 w-4 text-trinity-red" />
                Company Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <FiMail className="h-4 w-4 text-trinity-red" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <FiPhone className="h-4 w-4 text-trinity-red" />
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <FiGlobe className="h-4 w-4 text-trinity-red" />
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h3 className="text-lg font-heading font-semibold text-white mb-4">
            Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <FiMapPin className="h-4 w-4 text-trinity-red" />
                Street Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
















