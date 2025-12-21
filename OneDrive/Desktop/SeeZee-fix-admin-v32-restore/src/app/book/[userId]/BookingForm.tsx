"use client";

import { useState } from "react";
import { Calendar, Clock, User, Mail, MessageSquare, Check, Loader2 } from "lucide-react";

interface BookingFormProps {
  userId: string;
  userName: string;
}

const MEETING_DURATIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

export function BookingForm({ userId, userName }: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    duration: 30,
    date: "",
    time: "",
    name: "",
    email: "",
    purpose: "",
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, date: e.target.value, time: "" });
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.time || !formData.name || !formData.email) {
      return;
    }

    setLoading(true);
    try {
      const startTime = new Date(`${formData.date}T${formData.time}:00`);
      const endTime = new Date(startTime.getTime() + formData.duration * 60000);

      const response = await fetch("/api/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          clientName: formData.name,
          clientEmail: formData.email,
          purpose: formData.purpose || "Consultation",
        }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        alert("Failed to book meeting. Please try again.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to book meeting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Get maximum date (2 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Meeting Booked!</h3>
        <p className="text-slate-400 mb-4">
          You'll receive a confirmation email at {formData.email}
        </p>
        <div className="bg-slate-800/50 rounded-lg p-4 text-left">
          <p className="text-white font-medium">
            {new Date(`${formData.date}T${formData.time}`).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-slate-400">
            {formData.time} • {formData.duration} minutes with {userName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Duration */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Meeting Duration
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {MEETING_DURATIONS.map((duration) => (
              <button
                key={duration.value}
                onClick={() => {
                  setFormData({ ...formData, duration: duration.value });
                  setStep(2);
                }}
                className={`p-4 rounded-xl border transition-all text-center ${
                  formData.duration === duration.value
                    ? "border-cyan-500 bg-cyan-500/10 text-white"
                    : "border-white/10 hover:border-white/30 text-slate-300 hover:text-white"
                }`}
              >
                <p className="font-medium">{duration.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Select Date & Time
          </h3>
          
          {/* Date Picker */}
          <input
            type="date"
            value={formData.date}
            onChange={handleDateChange}
            min={minDate}
            max={maxDateStr}
            className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
          />

          {/* Time Slots */}
          {formData.date && (
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  onClick={() => {
                    setFormData({ ...formData, time });
                    setStep(3);
                  }}
                  className={`p-2 rounded-lg text-sm transition-all ${
                    formData.time === time
                      ? "bg-cyan-500 text-white"
                      : "bg-slate-800/50 border border-white/10 text-slate-300 hover:border-cyan-500/50 hover:text-white"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setStep(1)}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Step 3: Contact Info */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <User className="w-4 h-4" />
            Your Information
          </h3>

          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <textarea
                placeholder="What would you like to discuss? (optional)"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                rows={3}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Meeting Details</p>
            <p className="text-white font-medium">
              {new Date(`${formData.date}T${formData.time}`).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-slate-400 text-sm">
              {formData.time} • {formData.duration} minutes
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 px-4 py-3 border border-white/10 text-slate-300 rounded-lg hover:bg-white/5 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.email || loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Booking...
                </>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-colors ${
              s === step ? "bg-cyan-500" : s < step ? "bg-cyan-500/50" : "bg-slate-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

