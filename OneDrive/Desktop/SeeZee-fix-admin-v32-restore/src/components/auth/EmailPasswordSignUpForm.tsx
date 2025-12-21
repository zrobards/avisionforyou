"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupSchema } from "@/lib/auth/validation";
import { Input } from "@/components/ui/Input";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { UsernameInput } from "./UsernameInput";
import { useToast } from "@/stores/useToast";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

function SignUpFormContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tosAccepted) {
      showToast("Please accept the Terms of Service", "error");
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // Validate form data - include tosAccepted in the validation object
      const dataToValidate = {
        ...formData,
        tosAccepted,
      };
      const validated = signupSchema.parse(dataToValidate);

      // Get reCAPTCHA token
      if (!executeRecaptcha) {
        throw new Error("reCAPTCHA not loaded");
      }
      const recaptchaToken = await executeRecaptcha("signup");

      // Submit to API
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validated,
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's an email or username duplicate error
        if (response.status === 409) {
          if (data.error.includes("email")) {
            setErrors({ email: data.error });
          } else if (data.error.includes("username")) {
            setErrors({ username: data.error });
          } else {
            showToast(data.error || "Failed to sign up", "error");
          }
          return;
        }
        throw new Error(data.error || "Failed to sign up");
      }

      showToast("Account created! Please check your email to verify.", "success");
      router.push("/verify-email");
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        showToast(error.message || "Failed to sign up", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <UsernameInput
        value={formData.username}
        onChange={(value) => setFormData({ ...formData, username: value })}
        error={errors.username}
      />

      <Input
        type="email"
        label="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        placeholder="you@example.com"
        required
      />

      <div className="space-y-2">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            label="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <PasswordStrengthIndicator password={formData.password} />
      </div>

      <div className="relative">
        <Input
          type={showConfirmPassword ? "text" : "password"}
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={errors.confirmPassword}
          placeholder="••••••••"
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
        >
          {showConfirmPassword ? "Hide" : "Show"}
        </button>
      </div>

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="tos"
          checked={tosAccepted}
          onChange={(e) => setTosAccepted(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-gray-600 bg-bus-navy-light text-bus-red focus:ring-2 focus:ring-bus-red"
        />
        <label htmlFor="tos" className="text-sm text-gray-400">
          I agree to the{" "}
          <a href="/legal/terms-of-service" target="_blank" className="text-bus-red hover:text-bus-red-light underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/legal/privacy-policy" target="_blank" className="text-bus-red hover:text-bus-red-light underline">
            Privacy Policy
          </a>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-white text-bus-navy rounded-lg hover:bg-gray-100 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}

export function EmailPasswordSignUpForm() {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  if (!recaptchaSiteKey) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
        reCAPTCHA is not configured. Please add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to your environment variables.
      </div>
    );
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
      <SignUpFormContent />
    </GoogleReCaptchaProvider>
  );
}




