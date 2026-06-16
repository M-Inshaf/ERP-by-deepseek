/**
 * Hummingbird ERP - Finishing Module
 */

class FinishingModule {
    static render(container) {
        const items = db.getCollection('finishing');
        
        container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">Finishing Management</h2>
                <button class="btn btn-primary btn-lift" onclick="FinishingModule.showAddForm()">
                    <i class="fas fa-plus"></i> Add Finishing Record
                </button>
            </div>

            <div class="kpi-grid" style="margin-bottom: var(--spacing-lg);">
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                        <i class="fas fa-check-double"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Received</span>
                        <span class="kpi-value">${items.reduce((s,i) => s + (i.receivedQty || 0), 0)}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                        <i class="fas fa-check"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Finished</span>
                        <span class="kpi-value">${items.reduce((s,i) => s + (i.finishedQty || 0), 0)}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Damaged</span>
                        <span class="kpi-value">${items.reduce((s,i) => s + (i.damagedQty || 0), 0)}</span>
                    </div>
                </div>
            </div>

            <div class="data-table-container glass-card">
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Badge ID</th>
                                <th>Received</th>
                                <th>Finished</th>
                                <th>Damaged</th>
                                <th>Rejected</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.length === 0 ? `
                                <tr><td colspan="8" class="empty-state"><i class="fas fa-inbox"></i><p>No records</p></td></tr>
                            ` : items.map((item, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td style="font-weight:700;color:var(--accent-color);">${item.badgeId || '-'}</td>
                                    <td>${item.receivedQty || 0}</td>
                                    <td>${item.finishedQty || 0}</td>
                                    <td>${item.damagedQty || 0}</td>
                                    <td>${item.rejectedQty || 0}</td>
                                    <td>${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                                    <td class="actions-cell">
                                        <button class="btn-icon-sm btn-view" onclick="app.viewItem('finishing','${item.id}')"><i class="fas fa-eye"></i></button>
                                        <button class="btn-icon-sm btn-edit" onclick="app.editItem('finishing','${item.id}')"><i class="fas fa-edit"></i></button>
                                        <button class="btn-icon-sm btn-delete" onclick="app.deleteItem('finishing','${item.id}')"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    static showAddForm() {
        app.showModal('finishing');
    }
}
