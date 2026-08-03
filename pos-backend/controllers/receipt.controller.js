const PDFDocument = require('pdfkit');
const db = require('../config/db');

exports.generateReceiptPDF = async (req, res) => {
    const { id } = req.params;

    try {
        // =========================
        // GET INVOICE
        // =========================
        const [invoiceRows] = await db.execute(
            `SELECT * FROM invoices WHERE id = ?`,
            [id]
        );

        if (!invoiceRows.length) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        const invoice = invoiceRows[0];

        // =========================
        // GET ITEMS
        // =========================
        const [items] = await db.execute(
            `SELECT ii.*, p.name
             FROM invoice_items ii
             JOIN products p ON ii.product_id = p.id
             WHERE ii.invoice_id = ?`,
            [id]
        );

        // =========================
        // PDF SETUP (80mm receipt)
        // =========================
        const doc = new PDFDocument({
            size: [226, 600],
            margin: 10
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=receipt-${invoice.invoice_no}.pdf`
        );

        doc.pipe(res);

        // =========================
        // HEADER
        // =========================
        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('SHUVA STORES', { align: 'center' });

        doc.fontSize(8)
            .font('Helvetica')
            .text('Sundarbazar, Lamjung', { align: 'center' })
            .text('Phone: 9856029900', { align: 'center' });

        doc.moveDown(1);

        // =========================
        // INVOICE INFO
        // =========================
        doc.text(`Invoice: ${invoice.invoice_no}`);
        doc.text(`Date: ${new Date(invoice.created_at).toLocaleString()}`);

        doc.moveDown(1);

        // =========================
        // ITEMS
        // =========================
        let total = 0;

        items.forEach((item) => {
            total += Number(item.total || 0);

            doc.text(`${item.name}`);
            doc.text(`${item.quantity} x ${item.price} = ${item.total}`);
            doc.moveDown(0.5);
        });

        doc.moveDown(1);

        // =========================
        // TOTALS
        // =========================
        doc.text(`Subtotal: ${total}`);
        doc.text(`Discount: ${invoice.discount_amount || 0}`);

        doc.font('Helvetica-Bold')
            .text(`Grand Total: ${invoice.grand_total || total}`);

        doc.text(`Paid: ${invoice.paid_amount || 0}`);
        doc.text(`Due: ${invoice.due_amount || 0}`);

        doc.moveDown(2);

        // =========================
        // FOOTER
        // =========================
        doc.fontSize(8)
            .text('Thank you for your business!', { align: 'center' });

        doc.end();

    } catch (err) {
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
    }
};