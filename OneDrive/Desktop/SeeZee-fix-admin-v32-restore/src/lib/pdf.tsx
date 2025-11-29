import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #E53E3E',
    paddingBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E53E3E',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 10,
    color: '#666',
    marginBottom: 3,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 12,
    color: '#1A202C',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1 solid #E2E8F0',
    paddingBottom: 8,
    marginBottom: 8,
    backgroundColor: '#F7FAFC',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottom: '0.5 solid #E2E8F0',
  },
  tableCol: {
    fontSize: 10,
  },
  tableColHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4A5568',
    textTransform: 'uppercase',
  },
  description: {
    width: '50%',
  },
  quantity: {
    width: '15%',
    textAlign: 'center',
  },
  rate: {
    width: '15%',
    textAlign: 'right',
  },
  amount: {
    width: '20%',
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    borderTop: '2 solid #E2E8F0',
    paddingTop: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 12,
    color: '#4A5568',
    marginRight: 40,
    width: 100,
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 12,
    color: '#1A202C',
    width: 100,
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1.5 solid #E53E3E',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53E3E',
    marginRight: 40,
    width: 100,
    textAlign: 'right',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53E3E',
    width: 100,
    textAlign: 'right',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #E2E8F0',
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },
  statusBadge: {
    padding: '5 10',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
  },
  statusPaid: {
    backgroundColor: '#C6F6D5',
    color: '#22543D',
  },
  statusSent: {
    backgroundColor: '#BEE3F8',
    color: '#2C5282',
  },
  statusDraft: {
    backgroundColor: '#E2E8F0',
    color: '#4A5568',
  },
  statusOverdue: {
    backgroundColor: '#FED7D7',
    color: '#742A2A',
  },
  notes: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F7FAFC',
    borderLeft: '3 solid #E53E3E',
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  notesText: {
    fontSize: 10,
    color: '#666',
    lineHeight: 1.5,
  },
});

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  number: string;
  title: string;
  description?: string | null;
  status: string;
  createdAt: string;
  dueDate: string;
  paidAt?: string | null;
  amount: number;
  tax: number;
  total: number;
  currency: string;
  items: InvoiceItem[];
  organization?: {
    name: string;
    email?: string | null;
    address?: string | null;
  };
  project?: {
    name: string;
  };
}

// Invoice PDF Component
const InvoicePDF = ({ invoice }: { invoice: InvoiceData }) => {
  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return styles.statusPaid;
      case 'SENT':
        return styles.statusSent;
      case 'DRAFT':
        return styles.statusDraft;
      case 'OVERDUE':
        return styles.statusOverdue;
      default:
        return styles.statusDraft;
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Company Info */}
        <View style={styles.header}>
          <Text style={styles.companyName}>SeeZee Enterprises</Text>
          <Text style={styles.companyDetails}>Professional Web Development Services</Text>
          <Text style={styles.companyDetails}>seanpm1007@gmail.com</Text>
        </View>

        {/* Invoice Title and Number */}
        <View style={styles.section}>
          <Text style={styles.invoiceTitle}>INVOICE #{invoice.number}</Text>
          <View style={[styles.statusBadge, getStatusStyle(invoice.status)]}>
            <Text>{invoice.status}</Text>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Bill To</Text>
              <Text style={styles.value}>{invoice.organization?.name || 'N/A'}</Text>
              {invoice.organization?.email && (
                <Text style={[styles.value, { fontSize: 10, color: '#666' }]}>
                  {invoice.organization.email}
                </Text>
              )}
              {invoice.organization?.address && (
                <Text style={[styles.value, { fontSize: 10, color: '#666' }]}>
                  {invoice.organization.address}
                </Text>
              )}
            </View>
            <View style={{ textAlign: 'right' }}>
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.label}>Invoice Date</Text>
                <Text style={styles.value}>{formatDate(invoice.createdAt)}</Text>
              </View>
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.label}>Due Date</Text>
                <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
              </View>
              {invoice.paidAt && (
                <View>
                  <Text style={styles.label}>Paid On</Text>
                  <Text style={[styles.value, { color: '#22543D' }]}>
                    {formatDate(invoice.paidAt)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Project Info */}
        {invoice.project && (
          <View style={styles.section}>
            <Text style={styles.label}>Project</Text>
            <Text style={styles.value}>{invoice.project.name}</Text>
          </View>
        )}

        {/* Invoice Title and Description */}
        {invoice.title && (
          <View style={styles.section}>
            <Text style={styles.label}>Title</Text>
            <Text style={styles.value}>{invoice.title}</Text>
            {invoice.description && (
              <Text style={[styles.value, { fontSize: 10, color: '#666', marginTop: 5 }]}>
                {invoice.description}
              </Text>
            )}
          </View>
        )}

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableColHeader, styles.description]}>Description</Text>
            <Text style={[styles.tableColHeader, styles.quantity]}>Qty</Text>
            <Text style={[styles.tableColHeader, styles.rate]}>Rate</Text>
            <Text style={[styles.tableColHeader, styles.amount]}>Amount</Text>
          </View>
          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.description]}>{item.description}</Text>
              <Text style={[styles.tableCol, styles.quantity]}>{item.quantity}</Text>
              <Text style={[styles.tableCol, styles.rate]}>{formatCurrency(item.rate)}</Text>
              <Text style={[styles.tableCol, styles.amount]}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.amount)}</Text>
          </View>
          {invoice.tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.tax)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total)}</Text>
          </View>
        </View>

        {/* Payment Instructions */}
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Payment Information</Text>
          <Text style={styles.notesText}>
            {invoice.status === 'PAID'
              ? 'This invoice has been paid in full. Thank you for your business!'
              : 'Please make payment via the Stripe payment link provided in your email or contact us for alternative payment methods.'}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          <Text style={{ marginTop: 5 }}>
            For questions about this invoice, please contact us at seanpm1007@gmail.com
          </Text>
        </View>
      </Page>
    </Document>
  );
};

/**
 * Generate a PDF buffer for an invoice
 */
export async function generateInvoicePDF(invoice: InvoiceData): Promise<Buffer> {
  const doc = <InvoicePDF invoice={invoice} />;
  const asPdf = pdf(doc);
  const blob = await asPdf.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate a PDF and return as base64 string
 */
export async function generateInvoicePDFBase64(invoice: InvoiceData): Promise<string> {
  const buffer = await generateInvoicePDF(invoice);
  return buffer.toString('base64');
}

