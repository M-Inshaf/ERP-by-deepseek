/**
 * Hummingbird ERP - Cheques Module
 * Track all cheque payments and status
 */

class ChequesModule {
    static render(container) {
        const cheques = db.getCollection('cheques');
        
        const pending = cheques.filter(c => c.status === 'pending');
        const cleared = cheques.filter(c => c.status === 'cleared');
        const bounced = cheques.filter(c => c.status === 'bounced');
        const totalValue = cheques.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);

        container.innerHTML = `
            <div class="module-header">
                <div>
                    <h2 class="module-title">Cheque Management</h2>
                    <p class="module-subtitle">Track all cheque payments and clearance status</p>
                </div>
                <div class="module-actions">
                    <button class="btn btn-secondary btn-lift" onclick="ChequesModule.exportCheques()">
                        <i class="fas fa-file-export"></i> Export
                    </button>
                    <button class="btn btn-primary btn-lift btn-glow" onclick="ChequesModule.showAddForm()">
                        <i class="fas fa-plus"></i> Add Cheque
                    </button>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="kpi-grid" style="margin-bottom: var(--spacing-lg);">
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Pending</span>
                        <span class="kpi-value">${pending.length}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Cleared</span>
                        <span class="kpi-value">${cleared.length}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Bounced</span>
                        <span class="kpi-value">${bounced.length}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                        <i class="fas fa-money-check"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Value</span>
                        <span class="kpi-value" style="font-size: 1.1rem;">Rs. ${totalValue.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <!-- Cheque Table -->
            <div class="data-table-container glass-card">
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Cheque No</th>
                                <th>Date</th>
                                <th>Bank</th>
                                <th>Amount</th>
                                <th>Payee</th>
                                <th>Status</th>
                                <th>Clearance Date</th>
                                <th>Related To</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cheques.length === 0 ? `
                                <tr><td colspan="9" class="empty-state">
                                    <i class="fas fa-money-check-alt"></i>
                                    <p>No cheques recorded</p>
                                </td></tr>
                            ` : cheques.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(cheque => `
                                <tr style="${cheque.status === 'bounced' ? 'background: rgba(239,68,68,0.05);' : ''}">
                                    <td style="font-weight: 600; font-family: monospace;">${cheque.chequeNo || '-'}</td>
                                    <td>${cheque.date || '-'}</td>
                                    <td>${cheque.bank || '-'}</td>
                                    <td style="font-weight: 700;">Rs. ${(parseFloat(cheque.amount) || 0).toLocaleString()}</td>
                                    <td>${cheque.payee || '-'}</td>
                                    <td>
                                        <span class="status-badge ${cheque.status === 'cleared' ? 'active' : cheque.status === 'bounced' ? 'cancelled' : 'pending'}">
                                            ${cheque.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td>${cheque.clearanceDate || 'Not cleared'}</td>
                                    <td style="font-size: 0.8rem;">${cheque.relatedTo || '-'}</td>
                                    <td class="actions-cell">
                                        <button class="btn-icon-sm btn-view" onclick="ChequesModule.viewCheque('${cheque.id}')"><i class="fas fa-eye"></i></button>
                                        <button class="btn-icon-sm btn-edit" onclick="ChequesModule.editCheque('${cheque.id}')"><i class="fas fa-edit"></i></button>
                                        ${cheque.status === 'pending' ? `
                                            <button class="btn-icon-sm" style="background: #10b981; color: white;" onclick="ChequesModule.clearCheque('${cheque.id}')" title="Mark Cleared"><i class="fas fa-check"></i></button>
                                            <button class="btn-icon-sm" style="background: #ef4444; color: white;" onclick="ChequesModule.bounceCheque('${cheque.id}')" title="Mark Bounced"><i class="fas fa-times"></i></button>
                                        ` : ''}
                                        <button class="btn-icon-sm btn-delete" onclick="app.deleteItem('cheques','${cheque.id}')"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    static showAddForm(editId = null) {
        const cheque = editId ? db.getItem('cheques', editId) : null;
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-${editId ? 'edit' : 'plus-circle'}"></i> ${editId ? 'Edit' : 'Add'} Cheque</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="chequeForm" onsubmit="ChequesModule.saveCheque(event, '${editId || ''}')">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Cheque No <span class="required">*</span></label>
                            <input type="text" class="form-input" name="chequeNo" value="${cheque?.chequeNo || ''}" required style="font-family: monospace;">
                        </div>
                        <div class="form-group">
                            <label>Date <span class="required">*</span></label>
                            <input type="date" class="form-input" name="date" value="${cheque?.date || new Date().toISOString().split('T')[0]}" required>
                        </div>
                        <div class="form-group">
                            <label>Bank</label>
                            <input type="text" class="form-input" name="bank" value="${cheque?.bank || ''}" placeholder="Bank name">
                        </div>
                        <div class="form-group">
                            <label>Amount (Rs.) <span class="required">*</span></label>
                            <input type="number" class="form-input" name="amount" value="${cheque?.amount || ''}" min="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label>Payee</label>
                            <input type="text" class="form-input" name="payee" value="${cheque?.payee || ''}">
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select class="form-input form-select" name="status">
                                <option value="pending" ${cheque?.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="cleared" ${cheque?.status === 'cleared' ? 'selected' : ''}>Cleared</option>
                                <option value="bounced" ${cheque?.status === 'bounced' ? 'selected' : ''}>Bounced</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Clearance Date</label>
                            <input type="date" class="form-input" name="clearanceDate" value="${cheque?.clearanceDate || ''}">
                        </div>
                        <div class="form-group full-width">
                            <label>Related To</label>
                            <input type="text" class="form-input" name="relatedTo" value="${cheque?.relatedTo || ''}" placeholder="e.g., Agent name, Supplier">
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary" type="submit" form="chequeForm">${editId ? 'Update' : 'Save'} Cheque</button>
            </div>
        `;

        overlay.classList.add('active');
        overlay.style.display = 'flex';
    }

    static saveCheque(event, editId) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = {
            chequeNo: formData.get('chequeNo'),
            date: formData.get('date'),
            bank: formData.get('bank'),
            amount: parseFloat(formData.get('amount')) || 0,
            payee: formData.get('payee'),
            status: formData.get('status') || 'pending',
            clearanceDate: formData.get('clearanceDate') || '',
            relatedTo: formData.get('relatedTo'),
        };

        if (editId) {
            db.updateItem('cheques', editId, data);
            app.showToast('Cheque updated!', 'success');
        } else {
            db.addItem('cheques', data);
            app.showToast('Cheque saved!', 'success');
        }

        app.closeModal();
        const container = document.getElementById('moduleContainer');
        if (container) ChequesModule.render(container);
    }

    static viewCheque(id) {
        app.viewItem('cheques', id);
    }

    static editCheque(id) {
        ChequesModule.showAddForm(id);
    }

    static clearCheque(id) {
        db.updateItem('cheques', id, { 
            status: 'cleared', 
            clearanceDate: new Date().toISOString().split('T')[0] 
        });
        app.showToast('Cheque marked as cleared!', 'success');
        const container = document.getElementById('moduleContainer');
        if (container) ChequesModule.render(container);
    }

    static bounceCheque(id) {
        db.updateItem('cheques', id, { status: 'bounced' });
        app.showToast('Cheque marked as bounced!', 'warning');
        const container = document.getElementById('moduleContainer');
        if (container) ChequesModule.render(container);
    }

    static exportCheques() {
        const cheques = db.getCollection('cheques');
        if (cheques.length === 0) {
            app.showToast('No data to export', 'warning');
            return;
        }
        
        try {
            const exportData = cheques.map(c => ({
                'Cheque No': c.chequeNo,
                'Date': c.date,
                'Bank': c.bank,
                'Amount': c.amount,
                'Payee': c.payee,
                'Status': c.status,
                'Clearance Date': c.clearanceDate || ''
            }));
            
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Cheques');
            XLSX.writeFile(wb, `Cheques_${new Date().toISOString().split('T')[0]}.xlsx`);
            app.showToast('Cheques exported!', 'success');
        } catch(e) {
            app.showToast('Export failed', 'error');
        }
    }
}
