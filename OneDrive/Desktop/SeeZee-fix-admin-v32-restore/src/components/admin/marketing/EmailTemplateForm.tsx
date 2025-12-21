"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createEmailTemplate, updateEmailTemplate } from "@/server/actions/emailTemplates";
import { EmailCategory, EmailTemplate } from "@prisma/client";
import { Loader2, Save, X, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface EmailTemplateFormProps {
  template?: EmailTemplate;
  preset?: string;
}

const EMAIL_CATEGORIES: { value: EmailCategory; label: string }[] = [
  { value: "CLIENT_OUTREACH", label: "Client Outreach" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "INVOICE", label: "Invoice" },
  { value: "PROJECT_UPDATE", label: "Project Update" },
  { value: "MEETING_SCHEDULING", label: "Meeting Scheduling" },
  { value: "FOLLOW_UP", label: "Follow Up" },
  { value: "WELCOME", label: "Welcome Email" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

const PRESET_TEMPLATES: Record<string, Partial<EmailTemplate>> = {
  "Nonprofit Outreach": {
    name: "Nonprofit Outreach",
    category: "CLIENT_OUTREACH",
    subject: "Website Development Services for {{organizationName}}",
    htmlContent: `
      <p>Dear {{contactName}},</p>
      <p>I hope this email finds you well. I noticed that {{organizationName}} may benefit from a modern website to better serve your mission.</p>
      <p>We specialize in creating beautiful, accessible websites for nonprofits that help you connect with your community and donors more effectively.</p>
      <p>Would you be available for a brief call to discuss how we might help?</p>
      <p>Best regards,<br>{{senderName}}</p>
    `,
    variables: ["organizationName", "contactName", "senderName"],
  },
  "Welcome Email": {
    name: "Welcome Email",
    category: "WELCOME",
    subject: "Welcome to SeeZee Studio, {{clientName}}!",
    htmlContent: `
      <p>Hi {{clientName}},</p>
      <p>Welcome to SeeZee Studio! We're excited to start working on {{projectName}}.</p>
      <p>Here's what happens next:</p>
      <ul>
        <li>We'll schedule a kickoff meeting</li>
        <li>You'll receive access to your project dashboard</li>
        <li>Our team will begin the discovery process</li>
      </ul>
      <p>If you have any questions, feel free to reach out anytime.</p>
      <p>Best,<br>The SeeZee Team</p>
    `,
    variables: ["clientName", "projectName"],
  },
  "Invoice Sent": {
    name: "Invoice Sent",
    category: "INVOICE",
    subject: "Invoice #{{invoiceNumber}} from SeeZee Studio",
    htmlContent: `
      <p>Hi {{clientName}},</p>
      <p>Your invoice #{{invoiceNumber}} for {{projectName}} is ready for payment.</p>
      <p><strong>Amount Due:</strong> \${{amount}}</p>
      <p><strong>Due Date:</strong> {{dueDate}}</p>
      <p>You can view and pay your invoice by clicking the link below:</p>
      <p><a href="{{invoiceLink}}">View Invoice</a></p>
      <p>Thank you for your business!</p>
      <p>Best,<br>The SeeZee Team</p>
    `,
    variables: ["clientName", "invoiceNumber", "projectName", "amount", "dueDate", "invoiceLink"],
  },
  "Project Update": {
    name: "Project Update",
    category: "PROJECT_UPDATE",
    subject: "Update on {{projectName}}",
    htmlContent: `
      <p>Hi {{clientName}},</p>
      <p>I wanted to share an update on {{projectName}}.</p>
      <p>{{updateContent}}</p>
      <p>Next steps: {{nextSteps}}</p>
      <p>As always, feel free to reach out with any questions.</p>
      <p>Best,<br>{{senderName}}</p>
    `,
    variables: ["clientName", "projectName", "updateContent", "nextSteps", "senderName"],
  },
};

export function EmailTemplateForm({ template, preset }: EmailTemplateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: template?.name || "",
    category: (template?.category || preset ? PRESET_TEMPLATES[preset || ""]?.category || "CLIENT_OUTREACH" : "CLIENT_OUTREACH") as EmailCategory,
    subject: template?.subject || "",
    htmlContent: template?.htmlContent || "",
    textContent: template?.textContent || "",
    variables: template?.variables || [] as string[],
    active: template?.active ?? true,
  });

  const [variableInput, setVariableInput] = useState("");

  // Load preset if provided
  useEffect(() => {
    if (preset && PRESET_TEMPLATES[preset] && !template) {
      const presetData = PRESET_TEMPLATES[preset];
      setFormData((prev) => ({
        ...prev,
        name: presetData.name || prev.name,
        category: (presetData.category || prev.category) as EmailCategory,
        subject: presetData.subject || prev.subject,
        htmlContent: presetData.htmlContent || prev.htmlContent,
        variables: presetData.variables || prev.variables,
      }));
    }
  }, [preset, template]);

  const addVariable = () => {
    const varName = variableInput.trim();
    if (varName && !formData.variables.includes(varName)) {
      setFormData({
        ...formData,
        variables: [...formData.variables, varName],
      });
      setVariableInput("");
    }
  };

  const removeVariable = (varName: string) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((v) => v !== varName),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (template) {
        const result = await updateEmailTemplate(template.id, formData);
        if (result.success) {
          router.push("/admin/marketing/templates");
        } else {
          setError(result.error || "Failed to update template");
        }
      } else {
        const result = await createEmailTemplate(formData);
        if (result.success) {
          router.push("/admin/marketing/templates");
        } else {
          setError(result.error || "Failed to create template");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Welcome Email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as EmailCategory })}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {EMAIL_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Email Subject *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
            className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., Welcome to SeeZee Studio, {{clientName}}!"
          />
          <p className="text-xs text-slate-400 mt-1">
            Use {"{{variableName}}"} syntax for dynamic content
          </p>
        </div>

        {/* Variables */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Variables
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={variableInput}
              onChange={(e) => setVariableInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addVariable();
                }
              }}
              placeholder="Add variable name"
              className="flex-1 px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={addVariable}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.variables.map((variable) => (
              <span
                key={variable}
                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm"
              >
                {`{{${variable}}}`}
                <button
                  type="button"
                  onClick={() => removeVariable(variable)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* HTML Content */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            HTML Content *
          </label>
          <textarea
            value={formData.htmlContent}
            onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
            required
            rows={12}
            className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            placeholder="<p>Email content with {{variables}}...</p>"
          />
        </div>

        {/* Text Content (Optional) */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Plain Text Content (Optional)
          </label>
          <textarea
            value={formData.textContent}
            onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
            rows={8}
            className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            placeholder="Plain text version of the email"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="w-4 h-4 text-purple-600 bg-slate-800 border-white/10 rounded focus:ring-purple-500"
          />
          <label htmlFor="active" className="text-sm font-medium text-white">
            Template is active
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Link
          href="/admin/marketing/templates"
          className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {template ? "Update Template" : "Create Template"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}


