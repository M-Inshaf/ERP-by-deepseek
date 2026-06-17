/**
 * Hummingbird ERP - Accessories Management Module
 */
console.log('🧩 accessories.js loaded');

class AccessoriesModule {
    static render(container) {
        const items = db.getCollection('accessories');
        const totalValue = items.reduce((s, i) => s + ((parseFloat(i.quantity) || 0) * (parseFloat(i.unitCost) || 0)), 0);

        container.innerHTML = `
            <div class="module-header">
                <div>
                    <h2 class="module-title">Accessories Management</h2>
                    <p class="module-subtitle">Buttons, zippers, threads, labels and more</p>
                </div>
                <div class="module-actions">
                    <button class="btn btn-primary btn-lift btn-glow" id="btnAddAccessory">
                        <i class="fas fa-plus"></i> Add Accessory
                    </button>
                </div>
            </div>

            <div class="kpi-grid" style="margin-bottom: var(--spacing-lg);">
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                        <i class="fas fa-puzzle-piece"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Items</span>
                        <span class="kpi-value">${items.length}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                        <i class="fas fa-cubes"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Qty</span>
                        <span class="kpi-value">${items.reduce((s,i) => s + (parseFloat(i.quantity) || 0), 0)}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                        <i class="fas fa-rupee-sign"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Value</span>
                        <span class="kpi-value" style="font-size: 1.1rem;">Rs. ${totalValue.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div class="data-table-container glass-card">
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>#</th><th>Name</th><th>Description</th><th>Unit</th>
                                <th>Quantity</th><th>Unit Cost</th><th>Total Value</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.length === 0 ? `
                                <tr><td colspan="8" class="empty-state">
                                    <i class="fas fa-puzzle-piece"></i>
                                    <p>No accessories recorded</p>
                                    <button class="btn btn-primary btn-sm" id="btnAddEmptyAcc">
                                        <i class="fas fa-plus"></i> Add First Accessory
                                    </button>
                                </td></tr>
                            ` : items.map((item, i) => {
                                const total = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0);
                                return `
                                    <tr>
                                        <td>${i + 1}</td>
                                        <td style="font-weight: 600;">${item.name || '-'}</td>
                                        <td>${item.description || '-'}</td>
                                        <td>${item.unit || 'pcs'}</td>
                                        <td>${item.quantity || 0}</td>
                                        <td>Rs. ${(parseFloat(item.unitCost) || 0).toLocaleString()}</td>
                                        <td style="font-weight: 600;">Rs. ${total.toLocaleString()}</td>
                                        <td class="actions-cell">
                                            <button class="btn-icon-sm btn-view" onclick="AccessoriesModule.viewItem('${item.id}')"><i class="fas fa-eye"></i></button>
                                            <button class="btn-icon-sm btn-edit" onclick="AccessoriesModule.showAddForm('${item.id}')"><i class="fas fa-edit"></i></button>
                                            <button class="btn-icon-sm btn-delete" onclick="AccessoriesModule.deleteItem('${item.id}')"><i class="fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="table-footer">
                    <span class="table-count">${items.length} items | Total Value: Rs. ${totalValue.toLocaleString()}</span>
                </div>
            </div>
        `;

        setTimeout(() => {
            const btnAdd = document.getElementById('btnAddAccessory');
            const btnAddEmpty = document.getElementById('btnAddEmptyAcc');
            if (btnAdd) btnAdd.onclick = () => AccessoriesModule.showAddForm();
            if (btnAddEmpty) btnAddEmpty.onclick = () => AccessoriesModule.showAddForm();
        }, 100);
    }

    static showAddForm(editId = null) {
        const item = editId ? db.getItem('accessories', editId) : null;
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        if (!overlay || !container) return;

        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-${editId ? 'edit' : 'plus-circle'}"></i> ${editId ? 'Edit' : 'Add'} Accessory</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="accForm" onsubmit="return false;">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Name <span class="required">*</span></label>
                            <input type="text" class="form-input" id="accName" value="${item?.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <input type="text" class="form-input" id="accDesc" value="${item?.description || ''}">
                        </div>
                        <div class="form-group">
                            <label>Unit</label>
                            <select class="form-input form-select" id="accUnit">
                                ${['pcs','set','meter','roll','pack','box','dozen','pair'].map(u => 
                                    `<option value="${u}" ${item?.unit === u ? 'selected' : ''}>${u}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Quantity</label>
                            <input type="number" class="form-input" id="accQty" value="${item?.quantity || 0}" min="0" step="0.01">
                        </div>
                        <div class="form-group">
                            <label>Unit Cost (Rs.)</label>
                            <input type="number" class="form-input" id="accCost" value="${item?.unitCost || 0}" min="0" step="0.01">
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary btn-lift" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary btn-lift btn-glow" id="btnSaveAcc">
                    <i class="fas fa-save"></i> ${editId ? 'Update' : 'Save'} Accessory
                </button>
            </div>
        `;

        overlay.classList.add('active');
        overlay.style.display = 'flex';

        document.getElementById('btnSaveAcc').onclick = () => {
            const data = {
                name: document.getElementById('accName').value,
                description: document.getElementById('accDesc').value,
                unit: document.getElementById('accUnit').value,
                quantity: parseFloat(document.getElementById('accQty').value) || 0,
                unitCost: parseFloat(document.getElementById('accCost').value) || 0,
            };

            if (!data.name) {
                app.showToast('Please enter a name', 'warning');
                return;
            }

            if (editId) {
                db.updateItem('accessories', editId, data);
                app.showToast('Accessory updated!', 'success');
            } else {
                db.addItem('accessories', data);
                app.showToast('Accessory added!', 'success');
            }

            app.closeModal();
            app.navigateTo('accessories');
        };
    }

    static viewItem(id) {
        app.viewItem('accessories', id);
    }

    static deleteItem(id) {
        app.showConfirm('Delete Accessory', 'Delete this item?', () => {
            db.deleteItem('accessories', id);
            app.showToast('Deleted!', 'success');
            app.navigateTo('accessories');
        });
    }
}
