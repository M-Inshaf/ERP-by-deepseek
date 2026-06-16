/**
 * Hummingbird ERP - Payments Module
 */

class PaymentsModule {
    static render(container) {
        const items = db.getCollection('payments');
        const totalReceived = items.filter(i => i.type === 'received').reduce((s,i) => s + (parseFloat(i.amount) || 0), 0);
        const totalPaid = items.filter(i => i.type === 'paid').reduce((s,i) => s + (parseFloat(i.amount) || 0), 0);
        
        container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">Payments Management</h2>
                <button class="btn btn-primary btn-lift" onclick="app.showModal('payments')">
                    <i class="fas fa-plus"></i> Record Payment
                </button>
            </div>

            <div class="kpi-grid" style="margin-bottom: var(--spacing-lg);">
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                        <i class="fas fa-arrow-down"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Received</span>
                        <span class="kpi-value">Rs. ${totalReceived.toLocaleString()}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                        <i class="fas fa-arrow-up"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Paid</span>
                        <span class="kpi-value">Rs. ${totalPaid.toLocaleString()}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                        <i class="fas fa-balance-scale"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Balance</span>
                        <span class="kpi-value">Rs. ${(totalReceived - totalPaid).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div class="data-table-container glass-card">
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>#</th><th>Date</th><th>Type</th><th>From/To</th><th>Amount</th><th>Method</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.length === 0 ? `
                                <tr><td colspan="7" class="empty-state"><i class="fas fa-inbox"></i><p>No payments recorded</p></td></tr>
                            ` : items.map((item, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                                    <td><span class="status-badge ${item.type === 'received' ? 'active' : 'cancelled'}">${item.type || '-'}</span></td>
                                    <td>${item.party || '-'}</td>
                                    <td style="font-weight:700;">Rs. ${(parseFloat(item.amount) || 0).toLocaleString()}</td>
                                    <td>${item.method || '-'}</td>
                                    <td class="actions-cell">
                                        <button class="btn-icon-sm btn-view" onclick="app.viewItem('payments','${item.id}')"><i class="fas fa-eye"></i></button>
                                        <button class="btn-icon-sm btn-edit" onclick="app.editItem('payments','${item.id}')"><i class="fas fa-edit"></i></button>
                                        <button class="btn-icon-sm btn-delete" onclick="app.deleteItem('payments','${item.id}')"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}
