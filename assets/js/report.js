/**
 * Hummingbird ERP - Reports Module
 */

class ReportsModule {
    static render(container) {
        container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">Reports & Analytics</h2>
            </div>

            <div class="reports-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                ${ReportsModule.getReportCards().map(card => `
                    <div class="glass-card card-glow" style="padding: 24px; cursor: pointer;" onclick="${card.onclick}">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="width: 50px; height: 50px; border-radius: 12px; background: ${card.color}; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.3rem;">
                                <i class="fas ${card.icon}"></i>
                            </div>
                            <div>
                                <h4 style="font-weight: 700;">${card.title}</h4>
                                <p style="font-size: 0.85rem; color: var(--text-tertiary);">${card.desc}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    static getReportCards() {
        return [
            { title: 'Production Summary', icon: 'fa-industry', color: 'linear-gradient(135deg, #3b82f6, #2563eb)', desc: 'Production efficiency and output', onclick: "ReportsModule.generateReport('production')" },
            { title: 'Customer Summary', icon: 'fa-users', color: 'linear-gradient(135deg, #10b981, #059669)', desc: 'Customer orders and payments', onclick: "ReportsModule.generateReport('customers')" },
            { title: 'Supplier Summary', icon: 'fa-truck', color: 'linear-gradient(135deg, #f59e0b, #d97706)', desc: 'Supplier purchases and dues', onclick: "ReportsModule.generateReport('suppliers')" },
            { title: 'Expense Summary', icon: 'fa-receipt', color: 'linear-gradient(135deg, #ef4444, #dc2626)', desc: 'All business expenses', onclick: "ReportsModule.generateReport('expenses')" },
            { title: 'Profit & Loss', icon: 'fa-chart-line', color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', desc: 'Income vs Expenses', onclick: "ReportsModule.generateReport('pnl')" },
            { title: 'Cost Analysis', icon: 'fa-calculator', color: 'linear-gradient(135deg, #14b8a6, #0d9488)', desc: 'Production cost breakdown', onclick: "ReportsModule.generateReport('costs')" },
            { title: 'Damage Analysis', icon: 'fa-exclamation-triangle', color: 'linear-gradient(135deg, #dc2626, #991b1b)', desc: 'Damage and waste tracking', onclick: "ReportsModule.generateReport('damage')" },
            { title: 'Monthly Summary', icon: 'fa-calendar-alt', color: 'linear-gradient(135deg, #6366f1, #4f46e5)', desc: 'Month-wise performance', onclick: "ReportsModule.generateReport('monthly')" },
        ];
    }

    static generateReport(type) {
        app.showToast(`Generating ${type} report...`, 'info');
        
        setTimeout(() => {
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                doc.setFillColor(26, 86, 219);
                doc.rect(0, 0, 210, 25, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(14);
                doc.text('HUMMINGBIRD CLOTHING ERP', 105, 12, { align: 'center' });
                doc.text(`${type.toUpperCase()} REPORT`, 105, 20, { align: 'center' });
                
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(10);
                doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
                
                doc.save(`${type}_report_${new Date().toISOString().split('T')[0]}.pdf`);
                app.showToast('Report generated!', 'success');
            } catch(e) {
                app.showToast('PDF generation failed', 'error');
            }
        }, 500);
    }
}
