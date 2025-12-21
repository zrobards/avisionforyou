/**
 * Email Template Rendering Utility
 * Replaces {{variable}} placeholders with actual values
 */

interface RenderResult {
  subject: string;
  html: string;
  text: string;
}

/**
 * Renders an email template by replacing variable placeholders
 */
export function renderTemplate(
  subject: string,
  htmlContent: string,
  textContent: string | null,
  variables: Record<string, any>
): RenderResult {
  let renderedSubject = subject;
  let renderedHtml = htmlContent;
  let renderedText = textContent || stripHtml(htmlContent);

  // Replace all {{variable}} placeholders
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    const stringValue = value?.toString() || "";
    
    renderedSubject = renderedSubject.replace(regex, stringValue);
    renderedHtml = renderedHtml.replace(regex, stringValue);
    renderedText = renderedText.replace(regex, stringValue);
  });

  return {
    subject: renderedSubject,
    html: wrapInEmailLayout(renderedHtml),
    text: renderedText,
  };
}

/**
 * Strips HTML tags from content to create plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Wraps HTML content in a responsive email layout
 */
function wrapInEmailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email from SeeZee Studio</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #333333;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .content {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    a {
      color: #dc2626;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
    .footer a {
      color: #666666;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #dc2626;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 16px 0;
    }
    .button:hover {
      background-color: #b91c1c;
      text-decoration: none;
    }
    p {
      margin: 0 0 16px 0;
    }
    ul, ol {
      margin: 0 0 16px 0;
      padding-left: 24px;
    }
    li {
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>
        SeeZee Studio<br>
        Louisville, KY<br>
        <a href="mailto:seezee.enterprises@gmail.com">seezee.enterprises@gmail.com</a> | (502) 435-2986
      </p>
      <p style="margin-top: 16px;">
        <a href="https://see-zee.com">see-zee.com</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Common variable mappings for convenience
 */
export function getCommonVariables(data: {
  user?: { name?: string | null };
  organization?: { name?: string | null };
  project?: { name?: string | null };
  invoice?: { number?: string; total?: number; dueDate?: Date };
}): Record<string, string> {
  const variables: Record<string, string> = {
    senderName: data.user?.name || "SeeZee Team",
    teamMember: data.user?.name || "SeeZee Team",
  };

  if (data.organization?.name) {
    variables.organizationName = data.organization.name;
    variables.clientName = data.organization.name;
  }

  if (data.project?.name) {
    variables.projectName = data.project.name;
  }

  if (data.invoice) {
    if (data.invoice.number) {
      variables.invoiceNumber = data.invoice.number;
    }
    if (data.invoice.total !== undefined) {
      variables.amount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(data.invoice.total);
    }
    if (data.invoice.dueDate) {
      variables.dueDate = data.invoice.dueDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  return variables;
}


