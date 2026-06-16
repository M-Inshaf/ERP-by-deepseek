/**
 * Hummingbird ERP - Inventory Management
 */

class InventoryModule {
    static render(container) {
        const items = db.getCollection('inventory');
        const totalValue = items.reduce((s, i) => s + ((i.quantity || 0) * (i.unitCost || 0)), 0);
        const lowStock = items.filter(i => (i.quantity || 0) <= (i.minStock || 10));

        container.innerHTML = `
            <div class="module-header">
                <div>
                    <h2 class="module-title">Inventory Management</h2>
                    <p class="module-subtitle">Track stock levels and material costs</p>
                </div>
                <div class="module-actions">
                    <button class="btn btn-secondary btn-lift" onclick="InventoryModule.exportInventory()">
                        <i class="fas fa-file-export"></i> Export
                    </button>
                    <button class="btn btn-primary btn-lift btn-glow" onclick="app.showModal('inventory')">
                        <i class="fas fa-plus"></i> Add Item
                    </button>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="kpi-grid" style="margin-bottom: var(--spacing-lg);">
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                        <i class="fas fa-boxes"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Items</span>
                        <span class="kpi-value">${items.length}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                        <i class="fas fa-rupee-sign"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Stock Value</span>
                        <span class="kpi-value" style="font-size: 1.1rem;">Rs. ${totalValue.toLocaleString()}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Low Stock Items</span>
                        <span class="kpi-value" style="color: var(--danger-color);">${lowStock.length}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                        <i class="fas fa-tags"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Categories</span>
                        <span class="kpi-value">${new Set(items.map(i => i.category)).size}</span>
                    </div>
                </div>
            </div>

            <!-- Data Table -->
            <div class="data-table-container glass-card">
                <div class="table-wrapper">
                    <table class="data-table" id="inventoryTable">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Unit</th>
                                <th>Unit Cost</th>
                                <th>Total Value</th>
                                <th>Min Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="inventoryTableBody">
                            ${items.length === 0 ? `
                                <tr><td colspan="10" class="empty-state">
                                    <i class="fas fa-box-open"></i>
                                    <p>No inventory items</p>
                                </td></tr>
                            ` : items.map((item, i) => {
                                const totalValue = (item.quantity || 0) * (item.unitCost || 0);
                                const isLow = (item.quantity || 0) <= (item.minStock || 10);
                                return `
                                    <tr style="${isLow ? 'background: rgba(239,68,68,0.05);' : ''}">
                                        <td>${i + 1}</td>
                                        <td style="font-weight: 600;">${item.name || '-'}</td>
                                        <td>${item.category || '-'}</td>
                                        <td style="font-weight: 600; color: ${isLow ? 'var(--danger-color)' : 'inherit'};">${item.quantity || 0}</td>
                                        <td>${item.unit || 'pcs'}</td>
                                        <td>Rs. ${(item.unitCost || 0).toLocaleString()}</td>
                                        <td style="font-weight: 600;">Rs. ${totalValue.toLocaleString()}</td>
                                        <td>${item.minStock || 10}</td>
                                        <td><span class="status-badge ${isLow ? 'cancelled' : 'active'}">${isLow ? 'Low Stock' : 'In Stock'}</span></td>
                                        <td class="actions-cell">
                                            <button class="btn-icon-sm btn-view" onclick="app.viewItem('inventory','${item.id}')"><i class="fas fa-eye"></i></button>
                                            <button class="btn-icon-sm btn-edit" onclick="InventoryModule.editItem('${item.id}')"><i class="fas fa-edit"></i></button>
                                            <button class="btn-icon-sm btn-delete" onclick="app.deleteItem('inventory','${item.id}')"><i class="fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="table-footer">
                    <span class="table-count">${items.length} items | ${lowStock.length} low stock</span>
                </div>
            </div>
        `;
    }

    static editItem(id) {
        const item = db.getItem('inventory', id);
        if (!item) return;
        
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> Edit Inventory Item</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form onsubmit="InventoryModule.saveEdit(event, '${id}')">
                    <div class="form-grid">
                        <div class="form-group"><label>Name</label><input type="text" class="form-input" name="name" value="${item.name || ''}" required></div>
                        <div class="form-group"><label>Category</label><input type="text" class="form-input" name="category" value="${item.category || ''}"></div>
                        <div class="form-group"><label>Quantity</label><input type="number" class="form-input" name="quantity" value="${item.quantity || 0}" min="0"></div>
                        <div class="form-group"><label>Unit</label><input type="text" class="form-input" name="unit" value="${item.unit || 'pcs'}"></div>
                        <div class="form-group"><label>Unit Cost (Rs.)</label><input type="number" class="form-input" name="unitCost" value="${item.unitCost || 0}" step="0.01"></div>
                        <div class="form-group"><label>Min Stock Level</label><input type="number" class="form-input" name="minStock" value="${item.minStock || 10}"></div>
                    </div>
                    <div style="margin-top: 16px;">
                        <button type="submit" class="btn btn-primary">Update Item</button>
                    </div>
                </form>
            </div>
        `;

        overlay.classList.add('active');
        overlay.style.display = 'flex';
    }

    static saveEdit(event, id) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        data.quantity = parseInt(data.quantity) || 0;
        data.unitCost = parseFloat(data.unitCost) || 0;
        data.minStock = parseInt(data.minStock) || 10;
        
        db.updateItem('inventory', id, data);
        app.showToast('Item updated!', 'success');
        app.closeModal();
        
        const container = document.getElementById('moduleContainer');
        if (container) InventoryModule.render(container);
    }

    static exportInventory() {
        const items = db.getCollection('inventory');
        if (items.length === 0) {
            app.showToast('No data to export', 'warning');
            return;
        }
        
        try {
            const exportData = items.map(i => ({
                'Name': i.name,
                'Category': i.category,
                'Quantity': i.quantity,
                'Unit': i.unit,
                'Unit Cost': i.unitCost,
                'Total Value': (i.quantity || 0) * (i.unitCost || 0),
                'Status': (i.quantity || 0) <= (i.minStock || 10) ? 'Low Stock' : 'In Stock'
            }));
            
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
            XLSX.writeFile(wb, `Inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
            app.showToast('Inventory exported!', 'success');
        } catch(e) {
            app.showToast('Export failed', 'error');
        }
    }
}
