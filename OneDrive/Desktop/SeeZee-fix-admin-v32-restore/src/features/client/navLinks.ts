import { 
  Home, FolderOpen, BarChart3, MessageSquare, GitBranch, 
  Receipt, FileText, ListChecks, Settings, HelpCircle 
} from "lucide-react";

export const CLIENT_LINKS = [
  { href: "/client", label: "Overview", icon: Home },
  { href: "/client/projects", label: "Projects", icon: FolderOpen },
  { href: "/client/progress", label: "Progress", icon: BarChart3 },
  { href: "/client/messages", label: "Messages", icon: MessageSquare },
  { href: "/client/github", label: "GitHub Activity", icon: GitBranch },
  { href: "/client/invoices", label: "Invoices", icon: Receipt },
  { href: "/client/files", label: "Files & Assets", icon: FileText },
  { href: "/client/requests", label: "Requests", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/client/support", label: "Support", icon: HelpCircle },
] as const;
