"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { X, Bold, Italic, List, ListOrdered, Link2, Undo, Redo, Variable } from "lucide-react";
import { motion } from "framer-motion";

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  htmlContent: string;
  textContent: string | null;
  variables: string[];
  active: boolean;
}

interface TemplateEditorProps {
  template: EmailTemplate | null;
  onClose: () => void;
  onSave: () => void;
}

const CATEGORIES = [
  { value: "CLIENT_OUTREACH", label: "Client Outreach" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "INVOICE", label: "Invoice" },
  { value: "PROJECT_UPDATE", label: "Project Update" },
  { value: "MEETING_SCHEDULING", label: "Meeting Scheduling" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "WELCOME", label: "Welcome" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

const COMMON_VARIABLES = [
  "clientName",
  "organizationName",
  "projectName",
  "amount",
  "dueDate",
  "meetingDate",
  "meetingTime",
  "teamMember",
  "senderName",
  "calendarLink",
  "paymentLink",
  "previewLink",
];

export function TemplateEditor({ template, onClose, onSave }: TemplateEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: template?.name || "",
    category: template?.category || "CLIENT_OUTREACH",
    subject: template?.subject || "",
    active: template?.active ?? true,
  });
  const [customVariables, setCustomVariables] = useState<string[]>(
    template?.variables.filter((v) => !COMMON_VARIABLES.includes(v)) || []
  );

  // Ensure editor only initializes on client after mount to prevent hpm error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: template?.htmlContent || "<p>Hi {{clientName}},</p><p></p><p>Best regards,<br>{{senderName}}<br>SeeZee Studio</p>",
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4",
      },
    },
    enableCoreExtensions: true,
  });

  // Update editor content when template changes
  useEffect(() => {
    if (editor && template?.htmlContent && isMounted) {
      editor.commands.setContent(template.htmlContent);
    }
  }, [editor, template?.htmlContent, isMounted]);

  const insertVariable = (variable: string) => {
    if (editor) {
      editor.chain().focus().insertContent(`{{${variable}}}`).run();
    }
  };

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = content.matchAll(regex);
    const variables = new Set<string>();
    for (const match of matches) {
      variables.add(match[1]);
    }
    return Array.from(variables);
  };

  const handleSubmit = async () => {
    if (!editor) return;
    setIsSubmitting(true);

    try {
      const htmlContent = editor.getHTML();
      const textContent = editor.getText();
      const variables = extractVariables(htmlContent + formData.subject);

      const payload = {
        ...formData,
        htmlContent,
        textContent,
        variables,
      };

      const url = template ? `/api/templates/${template.id}` : "/api/templates";
      const method = template ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSave();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save template");
      }
    } catch (error) {
      console.error("Failed to save template:", error);
      alert("Failed to save template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestSend = async () => {
    const email = prompt("Enter email address for test send:");
    if (!email) return;

    try {
      const res = await fetch(`/api/templates/${template?.id}/test-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email }),
      });
      if (res.ok) {
        alert("Test email sent!");
      } else {
        alert("Failed to send test email");
      }
    } catch (error) {
      console.error("Failed to send test:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-gray-700 bg-[#151b2e] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
        <h2 className="text-xl font-heading font-bold text-white">
          {template ? "Edit Template" : "Create Template"}
        </h2>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800 transition">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Cold Outreach - Nonprofits"
              className="w-full rounded-lg border-2 border-gray-700 bg-[#1a2235] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-lg border-2 border-gray-700 bg-[#1a2235] px-4 py-2.5 text-white focus:border-trinity-red focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject Line */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            Subject Line *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="e.g., {{organizationName}} - Website Proposal"
            className="w-full rounded-lg border-2 border-gray-700 bg-[#1a2235] px-4 py-2.5 text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Use {"{{variable}}"} syntax for personalization
          </p>
        </div>

        {/* Variables */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Insert Variable
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_VARIABLES.map((variable) => (
              <button
                key={variable}
                onClick={() => insertVariable(variable)}
                className="px-3 py-1.5 rounded-lg bg-[#1a2235] border border-gray-700 text-xs text-gray-400 hover:text-white hover:border-gray-600 transition"
              >
                <Variable className="w-3 h-3 inline mr-1" />
                {variable}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Toolbar */}
        <div className="flex items-center gap-1 p-2 rounded-lg bg-[#1a2235] border border-gray-700">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-700 transition ${
              editor?.isActive("bold") ? "bg-gray-700 text-white" : "text-gray-400"
            }`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-700 transition ${
              editor?.isActive("italic") ? "bg-gray-700 text-white" : "text-gray-400"
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-700 mx-1" />
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-700 transition ${
              editor?.isActive("bulletList") ? "bg-gray-700 text-white" : "text-gray-400"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-700 transition ${
              editor?.isActive("orderedList") ? "bg-gray-700 text-white" : "text-gray-400"
            }`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-700 mx-1" />
          <button
            onClick={() => {
              const url = prompt("Enter URL:");
              if (url) {
                editor?.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={`p-2 rounded hover:bg-gray-700 transition ${
              editor?.isActive("link") ? "bg-gray-700 text-white" : "text-gray-400"
            }`}
          >
            <Link2 className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-700 mx-1" />
          <button
            onClick={() => editor?.chain().focus().undo().run()}
            className="p-2 rounded hover:bg-gray-700 transition text-gray-400"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().redo().run()}
            className="p-2 rounded hover:bg-gray-700 transition text-gray-400"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Content */}
        <div className="rounded-lg border-2 border-gray-700 bg-[#1a2235] overflow-hidden">
          {isMounted && editor ? (
            <EditorContent editor={editor} />
          ) : (
            <div className="min-h-[300px] p-4 text-gray-500 flex items-center justify-center">
              Loading editor...
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded border-gray-700 bg-[#1a2235] text-trinity-red focus:ring-trinity-red"
              />
              Active
            </label>
            {template && (
              <button
                onClick={handleTestSend}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Send Test Email
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border-2 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name || !formData.subject}
              className="px-6 py-2 rounded-lg bg-trinity-red text-white font-medium hover:bg-trinity-maroon disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? "Saving..." : template ? "Update Template" : "Create Template"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TemplateEditor;






