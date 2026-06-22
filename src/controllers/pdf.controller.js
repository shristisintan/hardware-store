const PDFDocument = require('pdfkit');
const db = require('../config/db');

exports.generateInvoicePDF = async (req, res) => {
    const { id } = req.params;

    try {
        // get invoice
        const [invoiceRows] = await db.execute(
            `SELECT * FROM invoices WHERE id = ?`,
            [id]
        );

        if (invoiceRows.length === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        const invoice = invoiceRows[0];

        // get items
        const [items] = await db.execute(
            `SELECT ii.*, p.name
             FROM invoice_items ii
             JOIN products p ON ii.product_id = p.id
             WHERE ii.invoice_id = ?`,
            [id]
        );

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=invoice-${id}.pdf`
        );

        doc.pipe(res);

        // HEADER
        doc.fontSize(20).text(`INVOICE #${invoice.invoice_no}`);
        doc.moveDown();

        doc.fontSize(12).text(`Total: ${invoice.total_amount}`);
        doc.text(`Discount: ${invoice.discount_amount}`);
        doc.text(`Grand Total: ${invoice.grand_total}`);
        doc.moveDown();

        doc.text("ITEMS:");
        doc.moveDown();

        items.forEach((item, i) => {
            doc.text(
                `${i + 1}. ${item.name} | Qty: ${item.quantity} | Price: ${item.price} | Total: ${item.total}`
            );
        });

        doc.end();

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};