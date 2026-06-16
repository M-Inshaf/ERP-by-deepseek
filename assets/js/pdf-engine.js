/**
 * Hummingbird ERP - Premium PDF Engine
 * Enterprise Templates • Watermarks • Signatures • Professional Layout
 */

class PDFEngine {
    constructor() {
        this.company = {
            name: 'FujiSan Lanka Pvt Ltd',
            brand: 'Hummingbird Clothing',
            address: 'Sri Lanka',
            phone: '',
            email: '',
        };
    }

    // Create standard PDF document
    createDocument(title = 'Document') {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Add watermark
        this.addWatermark(doc);
        
        // Add header
        this.addHeader(doc, title);
        
        return doc;
    }

    // Add premium header
    addHeader(doc, title) {
        // Blue header bar
        doc.setFillColor(26, 86, 219);
        doc.rect(0, 0, 210, 35, 'F');
        
        // Company name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text(this.company.brand, 105, 15, { align: 'center' });
        
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(this.company.name, 105, 22, { align: 'center' });
        doc.text(this.company.address, 105, 27, { align: 'center' });
        
        // Document title
        doc.setTextColor(26, 86, 219);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(title, 105, 48, { align: 'center' });
        
        // Decorative line
        doc.setDrawColor(26, 86, 219);
        doc.setLineWidth(0.5);
        doc.line(30, 52, 180, 52);
    }

    // Add watermark
    addWatermark(doc) {
        doc.setTextColor(240, 245, 255);
        doc.setFontSize(50);
        doc.setFont(undefined, 'bold');
        doc.text('HUMMINGBIRD', 105, 150, { 
            align: 'center', 
            angle: -30,
            renderingMode: 'fill'
        });
    }

    // Add footer
    addFooter(doc, pageNumber) {
        const pageHeight = doc.internal.pageSize.height;
        
        // Footer line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(15, pageHeight - 15, 195, pageHeight - 15);
        
        // Footer text
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(7);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated: ${new Date().toLocaleString()} | Hummingbird ERP v2.0`, 15, pageHeight - 8);
        doc.text(`Page ${pageNumber}`, 195, pageHeight - 8, { align: 'right' });
    }

    // Add signature block
    addSignatures(doc, y) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Signatures', 105, y, { align: 'center' });
        
        y += 15;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        
        // Prepared by
        doc.line(20, y, 80, y);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text('Prepared By', 50, y + 5, { align: 'center' });
        
        // Checked by
        doc.line(100, y, 160, y);
        doc.text('Checked By', 130, y + 5, { align: 'center' });
    }

    // Generate invoice PDF
    generateInvoice(data) {
        const doc = this.createDocument('INVOICE');
        let y = 60;

        // Invoice details
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Invoice No:', 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(data.invoiceNo || 'N/A', 55, y);
        
        doc.setFont(undefined, 'bold');
        doc.text('Date:', 130, y);
        doc.setFont(undefined, 'normal');
        doc.text(data.date || new Date().toLocaleDateString(), 150, y);
        y += 8;

        // Customer info
        doc.setFont(undefined, 'bold');
        doc.text('Bill To:', 20, y);
        y += 6;
        doc.setFont(undefined, 'normal');
        doc.text(data.customer?.name || 'N/A', 20, y);
        y += 5;
        doc.text(data.customer?.address || '', 20, y);

        // Items table
        y += 12;
        this.addTableHeader(doc, y, ['#', 'Description', 'Qty', 'Unit Price', 'Total']);
        y += 8;

        if (data.items) {
            data.items.forEach((item, index) => {
                doc.setFontSize(9);
                doc.setFont(undefined, 'normal');
                doc.text(String(index + 1), 20, y);
                doc.text(item.description || '', 30, y);
                doc.text(String(item.qty || 0), 110, y, { align: 'center' });
                doc.text(`Rs. ${(item.unitPrice || 0).toLocaleString()}`, 135, y, { align: 'right' });
                doc.text(`Rs. ${(item.total || 0).toLocaleString()}`, 170, y, { align: 'right' });
                y += 6;
            });
        }

        // Total
        y += 4;
        doc.setDrawColor(26, 86, 219);
        doc.line(120, y, 190, y);
        y += 6;
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('TOTAL:', 120, y);
        doc.text(`Rs. ${(data.total || 0).toLocaleString()}`, 170, y, { align: 'right' });

        // Signatures
        this.addSignatures(doc, y + 30);
        this.addFooter(doc, 1);

        return doc;
    }

    // Add table header
    addTableHeader(doc, y, headers) {
        doc.setFillColor(240, 245, 255);
        doc.rect(15, y - 5, 180, 8, 'F');
        
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(26, 86, 219);
        
        const positions = this.calculateColumnPositions(headers.length);
        headers.forEach((header, i) => {
            doc.text(header, positions[i], y);
        });
        
        doc.setTextColor(0, 0, 0);
    }

    // Calculate column positions
    calculateColumnPositions(count) {
        const totalWidth = 180;
        const startX = 15;
        const widths = [10, 70, 30, 35, 35].slice(0, count);
        const positions = [];
        let currentX = startX;
        
        widths.forEach(w => {
            positions.push(currentX + (w > 30 ? 0 : w/2));
            currentX += w;
        });
        
        return positions;
    }

    // Save PDF
    savePDF(doc, filename) {
        doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    }
}

// Create global instance
const pdfEngine = new PDFEngine();
