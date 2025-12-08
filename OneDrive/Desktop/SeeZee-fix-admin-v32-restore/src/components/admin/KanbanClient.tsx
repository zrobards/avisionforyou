"use client";

/**
 * Kanban Client Component with Real Data
 */

import { useState } from "react";
import { Kanban, type KanbanColumn, type KanbanItem } from "@/components/admin/Kanban";
import { updateLeadStatus } from "@/server/actions/pipeline";
import { convertLeadToProject } from "@/server/actions/leads";

interface KanbanClientProps {
  pipeline: any;
  projects: any[];
  invoices: any[];
}

export function KanbanClient({ pipeline, projects, invoices }: KanbanClientProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(() => {
    if (!pipeline) {
      return [];
    }

    // Create leads column from NEW and CONTACTED leads
    const leads = [...(pipeline.NEW || []), ...(pipeline.CONTACTED || [])];
    const leadsItems: KanbanItem[] = leads.map((lead: any) => ({
      id: `lead-${lead.id}`,
      title: lead.name || lead.company || "Unnamed Lead",
      description: lead.email,
      labels: [lead.status, lead.serviceType || "General"].filter(Boolean),
      assignee: lead.assignee ? { name: lead.assignee.name || lead.assignee.email } : undefined,
    }));

    // Create projects column
    const activeProjects = projects.filter((p: any) => 
      ['LEAD', 'PAID', 'IN_PROGRESS'].includes(p.status)
    );
    const projectItems: KanbanItem[] = activeProjects.map((project: any) => ({
      id: `project-${project.id}`,
      title: project.name,
      description: project.organization?.name || "",
      labels: [project.status],
      assignee: project.assignee ? { name: project.assignee.name || project.assignee.email } : undefined,
    }));

    // Create invoices column
    const pendingInvoices = invoices.filter((inv: any) => 
      ['DRAFT', 'SENT', 'OVERDUE'].includes(inv.status)
    );
    const invoiceItems: KanbanItem[] = pendingInvoices.map((invoice: any) => ({
      id: `invoice-${invoice.id}`,
      title: invoice.title || invoice.number,
      description: `${invoice.organization?.name || ''} - $${parseFloat(invoice.total).toLocaleString()}`,
      labels: [invoice.status],
    }));

    return [
      {
        id: "leads",
        title: `Leads (${leadsItems.length})`,
        color: "bg-blue-500",
        items: leadsItems,
      },
      {
        id: "projects",
        title: `Projects (${projectItems.length})`,
        color: "bg-yellow-500",
        items: projectItems,
      },
      {
        id: "invoices",
        title: `Invoices (${invoiceItems.length})`,
        color: "bg-green-500",
        items: invoiceItems,
      },
    ];
  });

  const handleItemMove = async (itemId: string, fromCol: string, toCol: string) => {
    // Extract entity type and ID
    const [entityType, entityId] = itemId.split('-');

    try {
      if (entityType === 'lead' && toCol === 'projects') {
        // Convert lead to project
        const result = await convertLeadToProject(entityId);
        if (result.success) {
          alert("Lead converted to project successfully");
          window.location.reload(); // Refresh to show updated data
        } else {
          alert(result.error || "Failed to convert lead");
        }
        return;
      }

      if (entityType === 'lead') {
        // Update lead status
        let newStatus = 'CONTACTED';
        if (fromCol === 'leads' && toCol === 'leads') {
          newStatus = 'CONTACTED';
        }
        
        const result = await updateLeadStatus(entityId, newStatus as any);
        if (result.success) {
          console.log("Lead status updated");
        } else {
          alert(result.error || "Failed to update lead");
        }
      }

      // Update local state
      setColumns((prev) => {
        const newColumns = [...prev];
        const sourceCol = newColumns.find((c) => c.id === fromCol);
        const targetCol = newColumns.find((c) => c.id === toCol);
        
        if (!sourceCol || !targetCol) return prev;
        
        const item = sourceCol.items.find((i) => i.id === itemId);
        if (!item) return prev;
        
        sourceCol.items = sourceCol.items.filter((i) => i.id !== itemId);
        targetCol.items.push(item);
        
        // Update column titles with counts
        sourceCol.title = `${sourceCol.title.split('(')[0].trim()} (${sourceCol.items.length})`;
        targetCol.title = `${targetCol.title.split('(')[0].trim()} (${targetCol.items.length})`;
        
        return newColumns;
      });
    } catch (error) {
      console.error("Failed to move item:", error);
      alert("An error occurred while updating the item");
    }
  };

  const handleAddItem = (colId: string) => {
    if (colId === 'leads') {
      window.location.href = '/admin/pipeline/leads';
    } else if (colId === 'projects') {
      window.location.href = '/admin/pipeline/projects';
    } else if (colId === 'invoices') {
      window.location.href = '/admin/pipeline/invoices';
    }
  };

  const handleItemClick = (item: KanbanItem) => {
    const [entityType, entityId] = item.id.split('-');
    if (entityType === 'lead') {
      window.location.href = `/admin/pipeline/leads`;
    } else if (entityType === 'project') {
      window.location.href = `/admin/pipeline/projects`;
    } else if (entityType === 'invoice') {
      window.location.href = `/admin/pipeline/invoices`;
    }
  };

  if (!pipeline) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>Failed to load pipeline data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Drag and drop items between columns to update their status. Drag a lead to Projects to convert it.
      </p>
      
      <Kanban
        columns={columns}
        onItemMove={handleItemMove}
        onAddItem={handleAddItem}
        onItemClick={handleItemClick}
      />
    </div>
  );
}
