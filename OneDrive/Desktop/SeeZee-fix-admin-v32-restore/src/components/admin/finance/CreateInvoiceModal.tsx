"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Organization {
  id: string;
  name: string;
  stripeCustomerId: string | null;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

interface CreateInvoiceModalProps {
  organizations: Organization[];
  onClose: () => void;
}

export function CreateInvoiceModal({
  organizations,
  onClose,
}: CreateInvoiceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    organizationId: "",
    title: "",
    description: "",
    dueDate: "",
    invoiceType: "custom",
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, rate: 0 },
  ]);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, rate: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );
  const tax = 0; // Can be configured
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: items.map((item) => ({
            ...item,
            amount: item.quantity * item.rate,
          })),
          amount: subtotal,
          total,
          tax,
        }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Failed to create invoice:", error);
      alert("Failed to create invoice");
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
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-gray-700 bg-[#0a0e1a] shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-[#0a0e1a] px-6 py-4">
            <h2 className="text-xl font-heading font-bold text-white">
              Create Invoice
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Client Organization *
              </label>
              <select
                required
                value={formData.organizationId}
                onChange={(e) =>
                  setFormData({ ...formData, organizationId: e.target.value })
                }
                className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-3 text-white focus:border-trinity-red focus:outline-none"
              >
                <option value="">Select organization...</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Invoice Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Website Development Deposit"
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-3 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Invoice Type
                </label>
                <select
                  value={formData.invoiceType}
                  onChange={(e) =>
                    setFormData({ ...formData, invoiceType: e.target.value })
                  }
                  className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-3 text-white focus:border-trinity-red focus:outline-none"
                >
                  <option value="deposit">Deposit</option>
                  <option value="final">Final Payment</option>
                  <option value="subscription">Subscription</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-3 text-white focus:border-trinity-red focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Description
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Additional notes..."
                className="w-full rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-3 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none resize-none"
              />
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-400">
                  Line Items
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-sm text-trinity-red hover:text-trinity-maroon transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#151b2e] border border-gray-800"
                  >
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                      placeholder="Description"
                      className="flex-1 rounded-lg border border-gray-700 bg-[#1a2235] px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none"
                    />
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", parseInt(e.target.value) || 1)
                      }
                      className="w-20 rounded-lg border border-gray-700 bg-[#1a2235] px-3 py-2 text-sm text-white text-center focus:border-trinity-red focus:outline-none"
                    />
                    <span className="text-gray-500 text-sm">×</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={item.rate}
                        onChange={(e) =>
                          updateItem(index, "rate", parseFloat(e.target.value) || 0)
                        }
                        className="w-28 rounded-lg border border-gray-700 bg-[#1a2235] pl-7 pr-3 py-2 text-sm text-white focus:border-trinity-red focus:outline-none"
                      />
                    </div>
                    <span className="w-24 text-right text-sm text-white font-medium">
                      ${(item.quantity * item.rate).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="p-2 text-gray-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-800 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tax</span>
                <span className="text-white">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-800">
                <span className="text-white">Total</span>
                <span className="text-trinity-red">${total.toFixed(2)}</span>
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
                {isSubmitting ? "Creating..." : "Create Invoice"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CreateInvoiceModal;









