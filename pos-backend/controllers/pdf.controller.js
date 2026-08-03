const PDFDocument = require('pdfkit');
const db = require('../config/db');

exports.generateInvoicePDF = async (req, res) => {
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
        // GET CUSTOMER
        // =========================
        let customer = null;

        if (invoice.customer_id) {
            const [customerRows] = await db.execute(
                `SELECT * FROM customers WHERE id = ?`,
                [invoice.customer_id]
            );

            if (customerRows.length) customer = customerRows[0];
        }

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
        // PDF INIT
        // =========================
        const doc = new PDFDocument({ margin: 40 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=invoice-${invoice.invoice_no}.pdf`
        );

        doc.pipe(res);

        // =========================
        // HEADER
        // =========================
        doc.fontSize(20)
            .font('Helvetica-Bold')
            .text('SHUVA STORES', { align: 'center' });

        doc.moveDown(0.3);

        doc.fontSize(10)
            .font('Helvetica')
            .text('Sundarbazar, Lamjung, Nepal', { align: 'center' });

        doc.text('Phone: 9856029900 | PAN: XXXXXXXXX', {
            align: 'center'
        });

        doc.moveDown(1.5);

        // =========================
        // STATUS
        // =========================
        const status = invoice.payment_status || 'CREDIT';

        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text(`STATUS: ${status}`, 450, 90);

        // =========================
        // CUSTOMER + INVOICE
        // =========================
        doc.fontSize(11)
            .font('Helvetica-Bold')
            .text('CUSTOMER DETAILS', 40, 120);

        doc.font('Helvetica')
            .text(`Name: ${customer?.name || 'Walk-in Customer'}`, 40, 140)
            .text(`Phone: ${customer?.phone || '-'}`, 40, 155)
            .text(`Address: ${customer?.address || '-'}`, 40, 170);

        doc.font('Helvetica-Bold')
            .text('INVOICE DETAILS', 320, 120);

        doc.font('Helvetica')
            .text(`Invoice No: ${invoice.invoice_no}`, 320, 140)
            .text(`Date: ${new Date(invoice.created_at).toLocaleString()}`, 320, 155)
            .text(`Status: ${status}`, 320, 170);

        // =========================
        // LINE
        // =========================
        doc.moveTo(40, 205).lineTo(555, 205).stroke();

        // =========================
        // TABLE HEADER
        // =========================
        let y = 220;

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

        items.forEach((item, index) => {
            subtotal += Number(item.total);

            doc.text(index + 1, 45, y);
            doc.text(item.name, 80, y, { width: 160 });
            doc.text(item.quantity, 260, y);
            doc.text(Number(item.price).toFixed(2), 330, y);
            doc.text(Number(item.total).toFixed(2), 420, y);

            y += 20;
        });

        // =========================
        // TOTALS
        // =========================
        const discount = Number(invoice.discount_amount || 0);
        const grandTotal = Number(invoice.grand_total || subtotal);
        const paidAmount = Number(invoice.paid_amount || 0);
        const dueAmount = Number(invoice.due_amount || 0);

        y += 20;

        doc.moveTo(350, y).lineTo(555, y).stroke();

        y += 10;

        doc.font('Helvetica')
            .text(`Subtotal: ${subtotal.toFixed(2)}`, 350, y)
            .text(`Discount: ${discount.toFixed(2)}`, 350, y + 15);

        doc.font('Helvetica-Bold')
            .text(`Grand Total: ${grandTotal.toFixed(2)}`, 350, y + 30);

        doc.font('Helvetica')
            .text(`Paid: ${paidAmount.toFixed(2)}`, 350, y + 50)
            .text(`Due: ${dueAmount.toFixed(2)}`, 350, y + 65);

        // =========================
        // SIGNATURE
        // =========================
        doc.moveDown(4);
        doc.text('Prepared By: ____________________', 40);

        // =========================
        // FOOTER FIXED
        // =========================
        doc.fontSize(10)
            .text(
                'Thank you for your business!',
                0,
                doc.page.height - 60,
                { align: 'center' }
            );

        doc.end();

    } catch (err) {
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
    }
};