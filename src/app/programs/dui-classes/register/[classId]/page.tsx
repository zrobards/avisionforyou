"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface DUIClass {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  price: number;
}

export default function DUIRegisterPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = use(params);
  const router = useRouter();
  const [classInfo, setClassInfo] = useState<DUIClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetch(`/api/dui-classes/${classId}`)
      .then(r => r.json())
      .then(data => {
        setClassInfo(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Class not found");
        setLoading(false);
      });
  }, [classId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/dui-classes/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          ...form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Redirect to Square checkout
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        router.push("/programs/dui-classes/success");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!classInfo) {
    return <div className="p-8 text-center text-red-600">{error || "Class not found"}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Register for Class</h1>
      <p className="text-gray-600 mb-8">Complete your registration below</p>

      {/* Class Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="font-semibold text-lg">{classInfo.title}</h2>
        <p className="text-gray-600 mt-2">
          {new Date(classInfo.date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })} • {classInfo.startTime} - {classInfo.endTime}
        </p>
        <p className="text-gray-600">{classInfo.location}</p>
        <p className="text-2xl font-bold mt-3">${(classInfo.price / 100).toFixed(2)}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name *</label>
            <input
              type="text"
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name *</label>
            <input
              type="text"
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {submitting ? "Processing..." : `Pay $${(classInfo.price / 100).toFixed(2)} & Register`}
        </button>

        <p className="text-sm text-gray-500 text-center">
          You'll be redirected to our secure payment processor
        </p>
      </form>
    </div>
  );
}
