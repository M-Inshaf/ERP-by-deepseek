/**
 * Hummingbird ERP - Sub Garments Module
 * Badge ID Auto-Generation • Unlimited Accessories • Production Master Reference
 */

class SubGarmentsModule {
    static render(container) {
        container.innerHTML = `
            <!-- Module Header -->
            <div class="module-header">
                <div>
                    <h2 class="module-title">Sub Garments Management</h2>
                    <p class="module-subtitle">Master production references with Badge ID system</p>
                </div>
                <div class="module-actions">
                    <button class="btn btn-secondary btn-lift" onclick="SubGarmentsModule.exportExcel()">
                        <i class="fas fa-file-excel"></i> Export Excel
                    </button>
                    <button class="btn btn-primary btn-lift btn-glow pulse" onclick="SubGarmentsModule.showAddForm()">
                        <i class="fas fa-plus"></i> New Sub Garment
                    </button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="kpi-grid" style="margin-bottom: var(--spacing-lg);">
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                        <i class="fas fa-tshirt"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Sub Garments</span>
                        <span class="kpi-value" id="sgTotalCount">0</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                        <i class="fas fa-tag"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Latest Badge ID</span>
                        <span class="kpi-value" id="sgLatestBadge" style="font-size: 1.1rem;">-</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                        <i class="fas fa-calculator"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Avg. Cost Per Piece</span>
                        <span class="kpi-value" id="sgAvgCost">Rs. 0</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Active Customers</span>
                        <span class="kpi-value" id="sgCustomerCount">0</span>
                    </div>
                </div>
            </div>

            <!-- Filter Bar -->
            <div id="subGarmentsFilterContainer"></div>

            <!-- Data Table -->
            <div class="data-table-container glass-card">
                <div class="table-wrapper">
                    <table class="data-table" id="subGarmentsTable">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Badge ID</th>
                                <th>Customer</th>
                                <th>Style</th>
                                <th>Colour</th>
                                <th>Fabric Type</th>
                                <th>Fabric Cost</th>
                                <th>Accessories Cost</th>
                                <th>Cutting Cost</th>
                                <th>Finishing Cost</th>
                                <th>Total Cost</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="subGarmentsTableBody"></tbody>
                    </table>
                </div>
                <div class="table-footer">
                    <span class="table-count" id="subGarmentsCount">0 records</span>
                    <div class="pagination" id="subGarmentsPagination"></div>
                </div>
            </div>
        `;

        // Initialize filter
        window.subGarmentsFilter = new FilterSystem('subGarments', 'subGarmentsFilterContainer');
        window.subGarmentsFilter.render();
        window.subGarmentsFilter.updateTable = (items) => SubGarmentsModule.renderTable(items);

        // Load data
        SubGarmentsModule.loadData();
    }

    static loadData() {
        const items = db.getCollection('subGarments');
        SubGarmentsModule.renderTable(items);
        SubGarmentsModule.updateStats(items);
    }

    static updateStats(items) {
        const totalCount = items.length;
        const latestBadge = items.length > 0 ? items[items.length - 1].badgeId : '-';
        
        const totalCost = items.reduce((sum, item) => {
            const itemTotal = (item.fabricCost || 0) + (item.accessoriesCost || 0) + 
                            (item.cuttingCost || 0) + (item.finishingCost || 0);
            return sum + itemTotal;
        }, 0);
        const avgCost = totalCount > 0 ? Math.round(totalCost / totalCount) : 0;
        
        const uniqueCustomers = new Set(items.map(i => i.customer)).size;

        document.getElementById('sgTotalCount').textContent = totalCount;
        document.getElementById('sgLatestBadge').textContent = latestBadge;
        document.getElementById('sgAvgCost').textContent = 'Rs. ' + avgCost.toLocaleString();
        document.getElementById('sgCustomerCount').textContent = uniqueCustomers;
    }

    static renderTable(items) {
        const tbody = document.getElementById('subGarmentsTableBody');
        const countEl = document.getElementById('subGarmentsCount');
        
        if (!tbody) return;

        if (items.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="14" class="empty-state">
                        <i class="fas fa-tshirt"></i>
                        <p>No sub garments created yet</p>
                        <button class="btn btn-primary btn-sm" onclick="SubGarmentsModule.showAddForm()">
                            <i class="fas fa-plus"></i> Create First Sub Garment
                        </button>
                    </td>
                </tr>
            `;
            if (countEl) countEl.textContent = '0 records';
            SubGarmentsModule.updateStats([]);
            return;
        }

        tbody.innerHTML = items.map((item, index) => {
            const totalCost = (item.fabricCost || 0) + (item.accessoriesCost || 0) + 
                            (item.cuttingCost || 0) + (item.finishingCost || 0) + 
                            (item.dispatchCost || 0);
            
            const statusClass = item.status === 'completed' ? 'active' : 
                              item.status === 'in-production' ? 'pending' : 'draft';

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <span class="badge-id" style="font-weight: 700; color: var(--accent-color); font-family: monospace; font-size: 0.9rem;">
                            ${item.badgeId}
                        </span>
                    </td>
                    <td>${item.customer || '-'}</td>
                    <td>${item.style || '-'}</td>
                    <td>
                        ${item.colour ? `<span class="color-dot" style="background: ${item.colour}; width: 12px; height: 12px; border-radius: 50%; display: inline-block; margin-right: 6px; border: 2px solid var(--border-color);"></span>${item.colour}` : '-'}
                    </td>
                    <td>${item.fabricType || '-'}</td>
                    <td class="text-right">${item.fabricCost ? 'Rs. ' + item.fabricCost.toLocaleString() : '-'}</td>
                    <td class="text-right">${item.accessoriesCost ? 'Rs. ' + item.accessoriesCost.toLocaleString() : '-'}</td>
                    <td class="text-right">${item.cuttingCost ? 'Rs. ' + item.cuttingCost.toLocaleString() : '-'}</td>
                    <td class="text-right">${item.finishingCost ? 'Rs. ' + item.finishingCost.toLocaleString() : '-'}</td>
                    <td class="text-right" style="font-weight: 700;">Rs. ${totalCost.toLocaleString()}</td>
                    <td><span class="status-badge ${statusClass}">${item.status || 'Draft'}</span></td>
                    <td>${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                    <td class="actions-cell">
                        <button class="btn-icon-sm btn-view" onclick="SubGarmentsModule.viewItem('${item.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon-sm btn-edit" onclick="SubGarmentsModule.showEditForm('${item.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon-sm btn-print" onclick="SubGarmentsModule.printBadge('${item.id}')" title="Print Badge">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn-icon-sm btn-pdf" onclick="SubGarmentsModule.generatePDF('${item.id}')" title="PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                        <button class="btn-icon-sm btn-delete" onclick="app.deleteItem('subGarments', '${item.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        if (countEl) countEl.textContent = `${items.length} records`;
    }

    // ==========================================
    // ADD / EDIT FORM
    // ==========================================

    static showAddForm() {
        const badgeId = db.generateBadgeId();
        const customers = db.getCollection('customers');
        const fabricTypes = db.getCollection('fabric');
        
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-plus-circle"></i> Create New Sub Garment</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="subGarmentForm" onsubmit="SubGarmentsModule.saveForm(event)">
                    <!-- Badge ID (Auto-generated, read-only) -->
                    <div class="form-section">
                        <h4 class="form-section-title"><i class="fas fa-tag"></i> Badge Information</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Badge ID <span class="required">*</span></label>
                                <div class="input-with-icon">
                                    <i class="fas fa-hashtag"></i>
                                    <input type="text" class="form-input" value="${badgeId}" readonly 
                                           style="font-family: monospace; font-weight: 700; font-size: 1.1rem; color: var(--accent-color); background: var(--accent-light);">
                                </div>
                                <span class="form-help">Auto-generated unique production reference</span>
                            </div>
                            <div class="form-group">
                                <label>Status</label>
                                <select class="form-input form-select" name="status">
                                    <option value="draft">Draft</option>
                                    <option value="in-production">In Production</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Customer & Style -->
                    <div class="form-section">
                        <h4 class="form-section-title"><i class="fas fa-info-circle"></i> Order Details</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Customer <span class="required">*</span></label>
                                <select class="form-input form-select" name="customer" required id="sgCustomer">
                                    <option value="">Select Customer</option>
                                    ${customers.map(c => `<option value="${c.name || c.id}">${c.name || c.id}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Style / Design</label>
                                <input type="text" class="form-input" name="style" placeholder="e.g., Casual Shirt, Formal Trouser">
                            </div>
                            <div class="form-group">
                                <label>Colour</label>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <input type="color" class="form-color" name="colour" value="#3b82f6">
                                    <input type="text" class="form-input" name="colourName" placeholder="Colour name">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Quantity</label>
                                <input type="number" class="form-input" name="quantity" placeholder="Number of pieces" min="1" value="1">
                            </div>
                        </div>
                    </div>

                    <!-- Fabric Details -->
                    <div class="form-section">
                        <h4 class="form-section-title"><i class="fas fa-layer-group"></i> Fabric Details</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Fabric Type</label>
                                <select class="form-input form-select" name="fabricType" id="sgFabricType">
                                    <option value="">Select Fabric</option>
                                    ${fabricTypes.map(f => `<option value="${f.name || f.id}">${f.name || f.id}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Fabric Cost (Rs.)</label>
                                <div class="input-group">
                                    <span class="input-group-addon">Rs.</span>
                                    <input type="number" class="form-input" name="fabricCost" placeholder="0" step="0.01" id="sgFabricCost" oninput="SubGarmentsModule.calculateTotal()">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Accessories Section -->
                    <div class="form-section">
                        <h4 class="form-section-title">
                            <i class="fas fa-puzzle-piece"></i> Accessories
                            <span style="font-weight: 400; font-size: 0.8rem; color: var(--text-tertiary); margin-left: 8px;">
                                (Add unlimited accessories - price can be added later in Inventory)
                            </span>
                        </h4>
                        <div id="accessoriesContainer">
                            <!-- Dynamic accessory rows -->
                        </div>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="SubGarmentsModule.addAccessoryRow()" style="margin-top: 12px;">
                            <i class="fas fa-plus"></i> Add Accessory
                        </button>
                        <div style="text-align: right; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                            <span style="font-weight: 600; color: var(--text-secondary);">Total Accessories Cost: </span>
                            <span style="font-weight: 800; font-size: 1.1rem; color: var(--accent-color);" id="sgTotalAccessoriesCost">Rs. 0.00</span>
                        </div>
                    </div>

                    <!-- Production Costs -->
                    <div class="form-section">
                        <h4 class="form-section-title"><i class="fas fa-calculator"></i> Production Costs</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Cutting Cost (Rs.)</label>
                                <div class="input-group">
                                    <span class="input-group-addon">Rs.</span>
                                    <input type="number" class="form-input" name="cuttingCost" placeholder="0" step="0.01" id="sgCuttingCost" oninput="SubGarmentsModule.calculateTotal()">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Finishing Cost (Rs.)</label>
                                <div class="input-group">
                                    <span class="input-group-addon">Rs.</span>
                                    <input type="number" class="form-input" name="finishingCost" placeholder="0" step="0.01" id="sgFinishingCost" oninput="SubGarmentsModule.calculateTotal()">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Dispatch Cost (Rs.)</label>
                                <div class="input-group">
                                    <span class="input-group-addon">Rs.</span>
                                    <input type="number" class="form-input" name="dispatchCost" placeholder="0" step="0.01" id="sgDispatchCost" oninput="SubGarmentsModule.calculateTotal()">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Cost Summary -->
                    <div class="form-section" style="background: var(--accent-light); padding: 20px; border-radius: var(--radius-lg);">
                        <h4 class="form-section-title" style="border-bottom: none; margin-bottom: 8px;">
                            <i class="fas fa-chart-pie"></i> Cost Summary
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 0.9rem;">
                            <div>Fabric Cost:</div>
                            <div style="text-align: right; font-weight: 600;" id="summaryFabricCost">Rs. 0.00</div>
                            <div>Accessories Cost:</div>
                            <div style="text-align: right; font-weight: 600;" id="summaryAccessoriesCost">Rs. 0.00</div>
                            <div>Cutting Cost:</div>
                            <div style="text-align: right; font-weight: 600;" id="summaryCuttingCost">Rs. 0.00</div>
                            <div>Finishing Cost:</div>
                            <div style="text-align: right; font-weight: 600;" id="summaryFinishingCost">Rs. 0.00</div>
                            <div>Dispatch Cost:</div>
                            <div style="text-align: right; font-weight: 600;" id="summaryDispatchCost">Rs. 0.00</div>
                            <div style="border-top: 2px solid var(--accent-color); padding-top: 8px; font-weight: 800; font-size: 1.1rem;">TOTAL COST:</div>
                            <div style="border-top: 2px solid var(--accent-color); padding-top: 8px; text-align: right; font-weight: 800; font-size: 1.2rem; color: var(--accent-color);" id="summaryTotalCost">Rs. 0.00</div>
                        </div>
                    </div>

                    <!-- Notes -->
                    <div class="form-section">
                        <div class="form-group full-width">
                            <label>Notes / Special Instructions</label>
                            <textarea class="form-input form-textarea" name="notes" rows="3" placeholder="Any special requirements or notes..."></textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary btn-lift btn-glow" form="subGarmentForm" type="submit">
                    <i class="fas fa-save"></i> Create Sub Garment
                </button>
            </div>
        `;

        overlay.classList.add('active');
        
        // Add first empty accessory row
        SubGarmentsModule.addAccessoryRow();
    }

    static showEditForm(id) {
        const item = db.getItem('subGarments', id);
        if (!item) {
            app.showToast('Record not found', 'error');
            return;
        }

        const customers = db.getCollection('customers');
        const fabricTypes = db.getCollection('fabric');
        
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> Edit Sub Garment - ${item.badgeId}</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="subGarmentForm" onsubmit="SubGarmentsModule.saveEditForm(event, '${id}')">
                    <!-- Badge ID (Read-only) -->
                    <div class="form-section">
                        <h4 class="form-section-title"><i class="fas fa-tag"></i> Badge Information</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Badge ID</label>
                                <input type="text" class="form-input" value="${item.badgeId}" readonly 
                                       style="font-family: monospace; font-weight: 700; color: var(--accent-color); background: var(--accent-light);">
                            </div>
                            <div class="form-group">
                                <label>Status</label>
                                <select class="form-input form-select" name="status">
                                    <option value="draft" ${item.status === 'draft' ? 'selected' : ''}>Draft</option>
                                    <option value="in-production" ${item.status === 'in-production' ? 'selected' : ''}>In Production</option>
                                    <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Customer & Style -->
                    <div class="form-section">
                        <h4 class="form-section-title"><i class="fas fa-info-circle"></i> Order Details</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Customer <span class="required">*</span></label>
                                <select class="form-input form-select" name="customer" required>
                                    ${customers.map(c => `<option value="${c.name || c.id}" ${(item.customer === c.name || item.customer === c.id) ? 'selected' : ''}>${c.name || c.id}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Style / Design</label>
                                <input type="text" class="form-input" name="style" value="${item.style || ''}">
                            </div>
                            <div class="form-group">
                                <label>Colour</label>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <input type="color" class="form-color" name="colour" value="${item.colour || '#3b82f6'}">
                                    <input type="text" class="form-input" name="colourName" value="${item.colourName || ''}" placeholder="Colour name">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Quantity</label>
                                <input type="number" class="form-input" name="quantity" value="${item.quantity || 1}" min="1">
                            </div>
                        </div>
                    </div>

                    <!-- Fabric Details -->
                    <div class="form-section">
                        <h4 class="form-section-title"><i class="fas fa-layer-group"></i> Fabric Details</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Fabric Type</label>
                                <select class="form-input form-select" name="fabricType">
                                    ${fabricTypes.map(f => `<option value="${f.name || f.id}" ${(item.fabricType === f.name || item.fabricType === f.id) ? 'selected' : ''}>${f.name || f.id}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Fabric Cost (Rs.)</label>
                                <div class="input-group">
                                    <span class="input-group-addon">Rs.</span>
                                    <input type="number" class="form-input" name="fabricCost" value="${item.fabricCost || 0}" step="0.01" oninput="SubGarmentsModule.calculateTotal()">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Accessories -->
                    <div class="form-section">
                        <h4 class="form-section-title"><i class="fas fa-puzzle-piece"></i> Accessories</h4>
                        <div id="accessoriesContainer"></div>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="SubGarmentsModule.addAccessoryRow()" style="margin-top: 12px;">
                            <i class="fas fa-plus"></i> Add Accessory
                        </button>
                        <div style="text-align: right; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                            <span style="font-weight: 600;">Total Accessories Cost: </span>
                            <span style="font-weight: 800; font-size: 1.1rem; color: var(--accent-color);" id="sgTotalAccessoriesCost">Rs. ${(item.accessoriesCost || 0).toLocaleString()}</span>
                        </div>
                    </div>

                    <!-- Production Costs -->
                    <div class="form-section">
                        <h4 class="form-section-title"><i class="fas fa-calculator"></i> Production Costs</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Cutting Cost (Rs.)</label>
                                <input type="number" class="form-input" name="cuttingCost" value="${item.cuttingCost || 0}" step="0.01" oninput="SubGarmentsModule.calculateTotal()">
                            </div>
                            <div class="form-group">
                                <label>Finishing Cost (Rs.)</label>
                                <input type="number" class="form-input" name="finishingCost" value="${item.finishingCost || 0}" step="0.01" oninput="SubGarmentsModule.calculateTotal()">
                            </div>
                            <div class="form-group">
                                <label>Dispatch Cost (Rs.)</label>
                                <input type="number" class="form-input" name="dispatchCost" value="${item.dispatchCost || 0}" step="0.01" oninput="SubGarmentsModule.calculateTotal()">
                            </div>
                        </div>
                    </div>

                    <!-- Notes -->
                    <div class="form-section">
                        <div class="form-group full-width">
                            <label>Notes</label>
                            <textarea class="form-input form-textarea" name="notes" rows="3">${item.notes || ''}</textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary btn-lift" form="subGarmentForm" type="submit">
                    <i class="fas fa-save"></i> Update Sub Garment
                </button>
            </div>
        `;

        overlay.classList.add('active');

        // Load existing accessories
        if (item.accessories && Array.isArray(item.accessories)) {
            item.accessories.forEach(acc => {
                SubGarmentsModule.addAccessoryRow(acc);
            });
        } else {
            SubGarmentsModule.addAccessoryRow();
        }
    }

    // ==========================================
    // ACCESSORIES MANAGEMENT
    // ==========================================

    static addAccessoryRow(data = null) {
        const container = document.getElementById('accessoriesContainer');
        if (!container) return;

        const rowId = 'acc_' + Date.now();
        const row = document.createElement('div');
        row.className = 'accessory-row';
        row.id = rowId;
        row.style.cssText = `
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 1fr 40px;
            gap: 8px;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid var(--border-color);
            animation: rowSlideIn 0.3s ease forwards;
        `;

        row.innerHTML = `
            <input type="text" class="form-input" placeholder="Description" value="${data?.description || ''}">
            <input type="text" class="form-input" placeholder="Unit" value="${data?.unit || ''}">
            <input type="number" class="form-input acc-qty" placeholder="Qty" value="${data?.quantity || ''}" min="0" step="0.01" oninput="SubGarmentsModule.calculateTotal()">
            <input type="number" class="form-input acc-unit-cost" placeholder="Unit Cost" value="${data?.unitCost || ''}" min="0" step="0.01" oninput="SubGarmentsModule.calculateTotal()">
            <input type="number" class="form-input acc-total" placeholder="Total" value="${data?.totalCost || ''}" readonly style="background: var(--bg-tertiary); font-weight: 600;">
            <button type="button" class="btn-icon-sm btn-delete" onclick="document.getElementById('${rowId}').remove(); SubGarmentsModule.calculateTotal();" title="Remove">
                <i class="fas fa-trash"></i>
            </button>
        `;

        container.appendChild(row);
    }

    static calculateTotal() {
        // Calculate accessories total
        let accessoriesTotal = 0;
        document.querySelectorAll('.accessory-row').forEach(row => {
            const qty = parseFloat(row.querySelector('.acc-qty')?.value) || 0;
            const unitCost = parseFloat(row.querySelector('.acc-unit-cost')?.value) || 0;
            const total = qty * unitCost;
            
            const totalInput = row.querySelector('.acc-total');
            if (totalInput) totalInput.value = total.toFixed(2);
            
            accessoriesTotal += total;
        });

        // Get main costs
        const fabricCost = parseFloat(document.getElementById('sgFabricCost')?.value) || 0;
        const cuttingCost = parseFloat(document.getElementById('sgCuttingCost')?.value) || 0;
        const finishingCost = parseFloat(document.getElementById('sgFinishingCost')?.value) || 0;
        const dispatchCost = parseFloat(document.getElementById('sgDispatchCost')?.value) || 0;

        // Update accessories total display
        const accTotalEl = document.getElementById('sgTotalAccessoriesCost');
        if (accTotalEl) accTotalEl.textContent = 'Rs. ' + accessoriesTotal.toLocaleString(undefined, {minimumFractionDigits: 2});

        // Update summary
        const summaryFabric = document.getElementById('summaryFabricCost');
        const summaryAccessories = document.getElementById('summaryAccessoriesCost');
        const summaryCutting = document.getElementById('summaryCuttingCost');
        const summaryFinishing = document.getElementById('summaryFinishingCost');
        const summaryDispatch = document.getElementById('summaryDispatchCost');
        const summaryTotal = document.getElementById('summaryTotalCost');

        if (summaryFabric) summaryFabric.textContent = 'Rs. ' + fabricCost.toLocaleString(undefined, {minimumFractionDigits: 2});
        if (summaryAccessories) summaryAccessories.textContent = 'Rs. ' + accessoriesTotal.toLocaleString(undefined, {minimumFractionDigits: 2});
        if (summaryCutting) summaryCutting.textContent = 'Rs. ' + cuttingCost.toLocaleString(undefined, {minimumFractionDigits: 2});
        if (summaryFinishing) summaryFinishing.textContent = 'Rs. ' + finishingCost.toLocaleString(undefined, {minimumFractionDigits: 2});
        if (summaryDispatch) summaryDispatch.textContent = 'Rs. ' + dispatchCost.toLocaleString(undefined, {minimumFractionDigits: 2});

        const grandTotal = fabricCost + accessoriesTotal + cuttingCost + finishingCost + dispatchCost;
        if (summaryTotal) summaryTotal.textContent = 'Rs. ' + grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2});
    }

    // ==========================================
    // SAVE FORMS
    // ==========================================

    static saveForm(event) {
        event.preventDefault();
        
        // Collect accessories data
        const accessories = [];
        document.querySelectorAll('.accessory-row').forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs[0].value.trim()) {
                accessories.push({
                    description: inputs[0].value,
                    unit: inputs[1].value,
                    quantity: parseFloat(inputs[2].value) || 0,
                    unitCost: parseFloat(inputs[3].value) || 0,
                    totalCost: parseFloat(inputs[4].value) || 0
                });
            }
        });

        const accessoriesTotal = accessories.reduce((sum, acc) => sum + acc.totalCost, 0);
        const formData = new FormData(event.target);
        
        const data = {
            badgeId: formData.get('badgeId') || document.querySelector('input[value*="HB-"]')?.value,
            customer: formData.get('customer'),
            style: formData.get('style'),
            colour: formData.get('colourName') || formData.get('colour'),
            colourHex: formData.get('colour'),
            fabricType: formData.get('fabricType'),
            fabricCost: parseFloat(formData.get('fabricCost')) || 0,
            accessories: accessories,
            accessoriesCost: accessoriesTotal,
            cuttingCost: parseFloat(formData.get('cuttingCost')) || 0,
            finishingCost: parseFloat(formData.get('finishingCost')) || 0,
            dispatchCost: parseFloat(formData.get('dispatchCost')) || 0,
            quantity: parseInt(formData.get('quantity')) || 1,
            status: formData.get('status') || 'draft',
            notes: formData.get('notes') || '',
        };

        // Calculate total cost
        data.totalCost = data.fabricCost + data.accessoriesCost + data.cuttingCost + 
                        data.finishingCost + data.dispatchCost;

        // Save to database
        const saved = db.addItem('subGarments', data);
        
        if (saved) {
            app.showToast(`Sub Garment ${data.badgeId} created successfully!`, 'success');
            app.closeModal();
            SubGarmentsModule.loadData();
            
            // Auto-create ledger entry
            LedgerModule.autoCreateEntry('subGarments', saved);
        } else {
            app.showToast('Failed to save. Please try again.', 'error');
        }
    }

    static saveEditForm(event, id) {
        event.preventDefault();
        
        const accessories = [];
        document.querySelectorAll('.accessory-row').forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs[0].value.trim()) {
                accessories.push({
                    description: inputs[0].value,
                    unit: inputs[1].value,
                    quantity: parseFloat(inputs[2].value) || 0,
                    unitCost: parseFloat(inputs[3].value) || 0,
                    totalCost: parseFloat(inputs[4].value) || 0
                });
            }
        });

        const accessoriesTotal = accessories.reduce((sum, acc) => sum + acc.totalCost, 0);
        const formData = new FormData(event.target);

        const data = {
            customer: formData.get('customer'),
            style: formData.get('style'),
            colour: formData.get('colourName') || formData.get('colour'),
            colourHex: formData.get('colour'),
            fabricType: formData.get('fabricType'),
            fabricCost: parseFloat(formData.get('fabricCost')) || 0,
            accessories: accessories,
            accessoriesCost: accessoriesTotal,
            cuttingCost: parseFloat(formData.get('cuttingCost')) || 0,
            finishingCost: parseFloat(formData.get('finishingCost')) || 0,
            dispatchCost: parseFloat(formData.get('dispatchCost')) || 0,
            quantity: parseInt(formData.get('quantity')) || 1,
            status: formData.get('status') || 'draft',
            notes: formData.get('notes') || '',
            totalCost: 0,
        };

        data.totalCost = data.fabricCost + data.accessoriesCost + data.cuttingCost + 
                        data.finishingCost + data.dispatchCost;

        const updated = db.updateItem('subGarments', id, data);
        
        if (updated) {
            app.showToast('Sub Garment updated successfully!', 'success');
            app.closeModal();
            SubGarmentsModule.loadData();
        } else {
            app.showToast('Failed to update. Please try again.', 'error');
        }
    }

    // ==========================================
    // VIEW DETAILS
    // ==========================================

    static viewItem(id) {
        const item = db.getItem('subGarments', id);
        if (!item) return;

        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');

        const totalCost = (item.fabricCost || 0) + (item.accessoriesCost || 0) + 
                        (item.cuttingCost || 0) + (item.finishingCost || 0) + 
                        (item.dispatchCost || 0);

        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-eye"></i> Sub Garment Details</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <!-- Badge Header -->
                <div style="text-align: center; margin-bottom: 24px; padding: 20px; background: var(--accent-light); border-radius: var(--radius-lg);">
                    <div style="font-family: monospace; font-size: 1.5rem; font-weight: 800; color: var(--accent-color);">
                        ${item.badgeId}
                    </div>
                    <span class="status-badge ${item.status === 'completed' ? 'active' : item.status === 'in-production' ? 'pending' : 'draft'}">
                        ${item.status || 'Draft'}
                    </span>
                </div>

                <!-- Details Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                    <div><strong>Customer:</strong> ${item.customer || '-'}</div>
                    <div><strong>Style:</strong> ${item.style || '-'}</div>
                    <div><strong>Colour:</strong> ${item.colour || '-'}</div>
                    <div><strong>Fabric Type:</strong> ${item.fabricType || '-'}</div>
                    <div><strong>Quantity:</strong> ${item.quantity || '-'}</div>
                    <div><strong>Date:</strong> ${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</div>
                </div>

                <!-- Cost Breakdown -->
                <h4 style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">Cost Breakdown</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.9rem;">
                    <div>Fabric Cost:</div>
                    <div style="text-align: right; font-weight: 600;">Rs. ${(item.fabricCost || 0).toLocaleString()}</div>
                    <div>Accessories Cost:</div>
                    <div style="text-align: right; font-weight: 600;">Rs. ${(item.accessoriesCost || 0).toLocaleString()}</div>
                    <div>Cutting Cost:</div>
                    <div style="text-align: right; font-weight: 600;">Rs. ${(item.cuttingCost || 0).toLocaleString()}</div>
                    <div>Finishing Cost:</div>
                    <div style="text-align: right; font-weight: 600;">Rs. ${(item.finishingCost || 0).toLocaleString()}</div>
                    <div>Dispatch Cost:</div>
                    <div style="text-align: right; font-weight: 600;">Rs. ${(item.dispatchCost || 0).toLocaleString()}</div>
                    <div style="border-top: 2px solid var(--accent-color); padding-top: 8px; font-weight: 800;">TOTAL:</div>
                    <div style="border-top: 2px solid var(--accent-color); padding-top: 8px; text-align: right; font-weight: 800; color: var(--accent-color); font-size: 1.1rem;">Rs. ${totalCost.toLocaleString()}</div>
                </div>

                <!-- Accessories List -->
                ${item.accessories && item.accessories.length > 0 ? `
                    <h4 style="margin-top: 20px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">Accessories (${item.accessories.length})</h4>
                    <table style="width: 100%; font-size: 0.85rem; border-collapse: collapse;">
                        <thead>
                            <tr style="background: var(--bg-tertiary);">
                                <th style="padding: 8px; text-align: left;">Description</th>
                                <th style="padding: 8px; text-align: left;">Unit</th>
                                <th style="padding: 8px; text-align: right;">Qty</th>
                                <th style="padding: 8px; text-align: right;">Unit Cost</th>
                                <th style="padding: 8px; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${item.accessories.map(acc => `
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 8px;">${acc.description}</td>
                                    <td style="padding: 8px;">${acc.unit || '-'}</td>
                                    <td style="padding: 8px; text-align: right;">${acc.quantity}</td>
                                    <td style="padding: 8px; text-align: right;">Rs. ${(acc.unitCost || 0).toLocaleString()}</td>
                                    <td style="padding: 8px; text-align: right; font-weight: 600;">Rs. ${(acc.totalCost || 0).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : ''}

                ${item.notes ? `
                    <h4 style="margin-top: 20px; margin-bottom: 8px;">Notes</h4>
                    <p style="background: var(--bg-tertiary); padding: 12px; border-radius: var(--radius-md); font-style: italic;">${item.notes}</p>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary btn-sm" onclick="SubGarmentsModule.printBadge('${id}')">
                    <i class="fas fa-print"></i> Print Badge
                </button>
                <button class="btn btn-primary btn-sm" onclick="SubGarmentsModule.generatePDF('${id}')">
                    <i class="fas fa-file-pdf"></i> Generate PDF
                </button>
                <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
            </div>
        `;

        overlay.classList.add('active');
    }

    // ==========================================
    // PRINT & PDF
    // ==========================================

    static printBadge(id) {
        const item = db.getItem('subGarments', id);
        if (!item) return;

        const printWindow = window.open('', '_blank', 'width=600,height=400');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Badge - ${item.badgeId}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; text-align: center; padding: 40px; }
                    .badge { border: 3px solid #1a56db; border-radius: 16px; padding: 30px; display: inline-block; min-width: 300px; }
                    .badge-id { font-size: 28px; font-weight: 800; color: #1a56db; font-family: monospace; }
                    .badge-customer { font-size: 20px; margin: 12px 0; }
                    .badge-style { font-size: 16px; color: #666; }
                    .badge-qr { margin: 20px 0; font-size: 12px; color: #999; }
                </style>
            </head>
            <body>
                <div class="badge">
                    <div style="font-size: 14px; color: #999; margin-bottom: 8px;">HUMMINGBIRD CLOTHING</div>
                    <div class="badge-id">${item.badgeId}</div>
                    <div class="badge-customer">${item.customer || 'N/A'}</div>
                    <div class="badge-style">${item.style || 'N/A'} | ${item.colour || 'N/A'}</div>
                    <div class="badge-qr">Production Master Reference</div>
                </div>
                <script>window.print(); setTimeout(() => window.close(), 500);</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    static generatePDF(id) {
        const item = db.getItem('subGarments', id);
        if (!item) return;

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // PDF Header
            doc.setFillColor(26, 86, 219);
            doc.rect(0, 0, 210, 30, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.text('HUMMINGBIRD CLOTHING ERP', 105, 15, { align: 'center' });
            doc.setFontSize(10);
            doc.text('FujiSan Lanka Pvt Ltd', 105, 22, { align: 'center' });

            // Badge ID
            doc.setTextColor(26, 86, 219);
            doc.setFontSize(22);
            doc.text(item.badgeId, 105, 45, { align: 'center' });

            // Details
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            const details = [
                ['Customer:', item.customer || '-'],
                ['Style:', item.style || '-'],
                ['Colour:', item.colour || '-'],
                ['Fabric Type:', item.fabricType || '-'],
                ['Quantity:', item.quantity || '-'],
                ['Status:', item.status || 'Draft'],
            ];

            let y = 60;
            details.forEach(([label, value]) => {
                doc.setFont(undefined, 'bold');
                doc.text(label, 20, y);
                doc.setFont(undefined, 'normal');
                doc.text(String(value), 70, y);
                y += 8;
            });

            // Cost Table
            y += 5;
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Cost Breakdown', 20, y);
            y += 8;

            const costs = [
                ['Fabric Cost', `Rs. ${(item.fabricCost || 0).toLocaleString()}`],
                ['Accessories Cost', `Rs. ${(item.accessoriesCost || 0).toLocaleString()}`],
                ['Cutting Cost', `Rs. ${(item.cuttingCost || 0).toLocaleString()}`],
                ['Finishing Cost', `Rs. ${(item.finishingCost || 0).toLocaleString()}`],
                ['Dispatch Cost', `Rs. ${(item.dispatchCost || 0).toLocaleString()}`],
            ];

            const totalCost = costs.reduce((sum, c) => sum + (parseFloat(c[1].replace(/[^0-9.]/g, '')) || 0), 0);

            costs.forEach(([label, value]) => {
                doc.setFont(undefined, 'normal');
                doc.text(label, 20, y);
                doc.text(value, 120, y, { align: 'right' });
                y += 7;
            });

            doc.setDrawColor(26, 86, 219);
            doc.line(20, y, 190, y);
            y += 7;
            doc.setFont(undefined, 'bold');
            doc.text('TOTAL COST', 20, y);
            doc.text(`Rs. ${totalCost.toLocaleString()}`, 120, y, { align: 'right' });

            // Accessories
            if (item.accessories && item.accessories.length > 0) {
                y += 12;
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.text('Accessories', 20, y);
                y += 8;

                item.accessories.forEach(acc => {
                    doc.setFontSize(10);
                    doc.setFont(undefined, 'normal');
                    doc.text(`${acc.description} (${acc.quantity} ${acc.unit || 'pcs'})`, 20, y);
                    doc.text(`Rs. ${(acc.totalCost || 0).toLocaleString()}`, 190, y, { align: 'right' });
                    y += 6;
                });
            }

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Generated: ${new Date().toLocaleString()} | Hummingbird ERP v2.0`, 105, 285, { align: 'center' });

            doc.save(`${item.badgeId}_SubGarment.pdf`);
            app.showToast('PDF generated successfully!', 'success');
        } catch (error) {
            console.error('PDF Error:', error);
            app.showToast('PDF generation failed. Please try again.', 'error');
        }
    }

    // ==========================================
    // EXCEL EXPORT
    // ==========================================

    static exportExcel() {
        const items = db.getCollection('subGarments');
        if (items.length === 0) {
            app.showToast('No data to export', 'warning');
            return;
        }

        try {
            const exportData = items.map(item => ({
                'Badge ID': item.badgeId,
                'Customer': item.customer,
                'Style': item.style,
                'Colour': item.colour,
                'Fabric Type': item.fabricType,
                'Fabric Cost': item.fabricCost || 0,
                'Accessories Cost': item.accessoriesCost || 0,
                'Cutting Cost': item.cuttingCost || 0,
                'Finishing Cost': item.finishingCost || 0,
                'Dispatch Cost': item.dispatchCost || 0,
                'Total Cost': (item.fabricCost || 0) + (item.accessoriesCost || 0) + 
                            (item.cuttingCost || 0) + (item.finishingCost || 0) + 
                            (item.dispatchCost || 0),
                'Status': item.status,
                'Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sub Garments');
            XLSX.writeFile(wb, `SubGarments_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
            app.showToast('Excel exported successfully!', 'success');
        } catch (error) {
            console.error('Excel Error:', error);
            app.showToast('Excel export failed', 'error');
        }
    }
}
