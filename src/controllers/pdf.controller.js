const PDFDocument = require('pdfkit');
const db = require('../config/db');

exports.generateInvoicePDF = async (req, res) => {
    const { id } = req.params;

    try {
        const [invoiceRows] = await db.execute(
            `SELECT * FROM invoices WHERE id = ?`,
            [id]
        );

        if (!invoiceRows.length) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        const invoice = invoiceRows[0];

        const [items] = await db.execute(
            `SELECT ii.*, p.name
             FROM invoice_items ii
             JOIN products p ON ii.product_id = p.id
             WHERE ii.invoice_id = ?`,
            [id]
        );

        const doc = new PDFDocument({ margin: 40 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=invoice-${invoice.invoice_no}.pdf`
        );

        doc.pipe(res);

        // =========================
        // HEADER (CENTERED CLEAN)
        // =========================
        doc.fontSize(20).font('Helvetica-Bold')
            .text('SHUVA STORES', { align: 'center' });

        doc.fontSize(10).font('Helvetica')
            .text('Sundarbazar, Lamjung, Nepal | 9856029900', { align: 'center' });

        doc.moveDown(2);

        // =========================
        // STAMP (TOP RIGHT)
        // =========================
        const status = invoice.payment_status || 'CREDIT';

        doc.fontSize(14).font('Helvetica-Bold');

        doc.text(status, 450, 70);

        // =========================
        // INVOICE INFO BOX
        // =========================
        doc.fontSize(11).font('Helvetica');

        doc.text(`Invoice No: ${invoice.invoice_no}`, 40, 120);
        doc.text(`Date: ${new Date(invoice.created_at).toLocaleString()}`, 40, 135);
        doc.text(`Customer ID: ${invoice.customer_id || 'N/A'}`, 40, 150);

        // divider line
        doc.moveTo(40, 175).lineTo(555, 175).stroke();

        // =========================
        // TABLE HEADER
        // =========================
        let y = 190;

        doc.font('Helvetica-Bold');
        doc.text('S.N', 45, y);
        doc.text('Item', 80, y);
        doc.text('Qty', 260, y);
        doc.text('Rate', 330, y);
        doc.text('Amount', 420, y);

        doc.moveTo(40, y + 15).lineTo(555, y + 15).stroke();

        y += 25;

        // =========================
        // TABLE ROWS
        // =========================
        doc.font('Helvetica');

        let subtotal = 0;

        items.forEach((item, i) => {
            subtotal += Number(item.total);

            doc.text(i + 1, 45, y);
            doc.text(item.name, 80, y, { width: 170 });
            doc.text(item.quantity, 260, y);
            doc.text(Number(item.price).toFixed(2), 330, y);
            doc.text(Number(item.total).toFixed(2), 420, y);

            y += 20;
        });

        // =========================
        // TOTAL BOX (RIGHT ALIGNED CLEAN)
        // =========================
        const discount = Number(invoice.discount_amount || 0);
        const grandTotal = Number(invoice.grand_total || subtotal);

        y += 20;

        doc.moveTo(350, y).lineTo(555, y).stroke();
        y += 10;

        doc.font('Helvetica');

        doc.text(`Subtotal:`, 350, y);
        doc.text(subtotal.toFixed(2), 470, y);

        y += 15;

        doc.text(`Discount:`, 350, y);
        doc.text(discount.toFixed(2), 470, y);

        y += 15;

        doc.font('Helvetica-Bold');
        doc.text(`Grand Total:`, 350, y);
        doc.text(grandTotal.toFixed(2), 470, y);

        // =========================
        // SIGNATURE SECTION
        // =========================
        y += 60;

        doc.font('Helvetica')
            .text('Prepared By: ______________________', 40, y);

        y += 25;

        doc.text('Customer Signature: ______________________', 40, y);

        // =========================
        // FOOTER
        // =========================
        doc.fontSize(10)
            .text(
                'Thank you for your business!',
                0,
                760,
                { align: 'center' }
            );

        doc.end();

    } catch (err) {
        if (!res.headersSent) {
            return res.status(500).json({ error: err.message });
        }
    }
};