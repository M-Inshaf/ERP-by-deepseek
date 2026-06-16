/**
 * Hummingbird ERP - Production Module
 * Pulls data from Sub Garments via Badge ID
 */

class ProductionModule {
    static render(container) {
        const subGarments = db.getCollection('subGarments');
        const productionItems = db.getCollection('production');
        
        container.innerHTML = `
            <div class="module-header">
                <div>
                    <h2 class="module-title">Production Management</h2>
                    <p class="module-subtitle">Track production batches with Badge ID integration</p>
                </div>
                <div class="module-actions">
                    <button class="btn btn-primary btn-lift btn-glow" onclick="ProductionModule.showAddForm()">
                        <i class="fas fa-plus"></i> New Production Batch
                    </button>
                </div>
            </div>

            <!-- Stats -->
            <div class="kpi-grid" style="margin-bottom: var(--spacing-lg);">
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                        <i class="fas fa-industry"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Active Batches</span>
                        <span class="kpi-value" id="prodActive">0</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Completed</span>
                        <span class="kpi-value" id="prodCompleted">0</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Damaged</span>
                        <span class="kpi-value" id="prodDamaged">0</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Efficiency</span>
                        <span class="kpi-value" id="prodEfficiency">0%</span>
                    </div>
                </div>
            </div>

            <!-- Data Table -->
            <div class="data-table-container glass-card">
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Badge ID</th>
                                <th>Customer</th>
                                <th>Style</th>
                                <th>Cut Qty</th>
                                <th>Produced</th>
                                <th>Completed</th>
                                <th>Damaged</th>
                                <th>Rejected</th>
                                <th>Rework</th>
                                <th>Efficiency</th>
                                <th>Cost/Piece</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="productionTableBody">
                            ${productionItems.length === 0 ? `
                                <tr>
                                    <td colspan="14" class="empty-state">
                                        <i class="fas fa-industry"></i>
                                        <p>No production batches yet</p>
                                        <button class="btn btn-primary btn-sm" onclick="ProductionModule.showAddForm()">
                                            <i class="fas fa-plus"></i> Start Production
                                        </button>
                                    </td>
                                </tr>
                            ` : productionItems.map((item, i) => {
                                const efficiency = item.cutQty > 0 ? Math.round((item.producedQty / item.cutQty) * 100) : 0;
                                const damagePercent = item.cutQty > 0 ? Math.round((item.damageQty / item.cutQty) * 100) : 0;
                                const costPerPiece = item.producedQty > 0 ? Math.round(item.totalCost / item.producedQty) : 0;
                                
                                return `
                                    <tr>
                                        <td>${i + 1}</td>
                                        <td style="font-weight:700;color:var(--accent-color);font-family:monospace;">${item.badgeId || '-'}</td>
                                        <td>${item.customer || '-'}</td>
                                        <td>${item.style || '-'}</td>
                                        <td>${item.cutQty || 0}</td>
                                        <td>${item.producedQty || 0}</td>
                                        <td>${item.completedQty || 0}</td>
                                        <td style="color:${damagePercent > 10 ? 'var(--danger-color)' : 'inherit'}">${item.damageQty || 0} (${damagePercent}%)</td>
                                        <td>${item.rejectQty || 0}</td>
                                        <td>${item.reworkQty || 0}</td>
                                        <td><span class="status-badge ${efficiency >= 90 ? 'active' : efficiency >= 70 ? 'pending' : 'cancelled'}">${efficiency}%</span></td>
                                        <td>Rs. ${costPerPiece.toLocaleString()}</td>
                                        <td><span class="status-badge ${item.status === 'completed' ? 'active' : 'pending'}">${item.status || 'In Progress'}</span></td>
                                        <td class="actions-cell">
                                            <button class="btn-icon-sm btn-view" onclick="ProductionModule.viewItem('${item.id}')"><i class="fas fa-eye"></i></button>
                                            <button class="btn-icon-sm btn-edit" onclick="ProductionModule.editItem('${item.id}')"><i class="fas fa-edit"></i></button>
                                            <button class="btn-icon-sm btn-delete" onclick="app.deleteItem('production','${item.id}')"><i class="fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        ProductionModule.updateStats(productionItems);
    }

    static updateStats(items) {
        const active = items.filter(i => i.status !== 'completed').length;
        const completed = items.filter(i => i.status === 'completed').length;
        const totalDamaged = items.reduce((s, i) => s + (i.damageQty || 0), 0);
        const avgEfficiency = items.length > 0 
            ? Math.round(items.reduce((s, i) => {
                const eff = i.cutQty > 0 ? (i.producedQty / i.cutQty) * 100 : 0;
                return s + eff;
            }, 0) / items.length) 
            : 0;

        document.getElementById('prodActive').textContent = active;
        document.getElementById('prodCompleted').textContent = completed;
        document.getElementById('prodDamaged').textContent = totalDamaged;
        document.getElementById('prodEfficiency').textContent = avgEfficiency + '%';
    }

    static showAddForm() {
        const subGarments = db.getCollection('subGarments');
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-plus-circle"></i> New Production Batch</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="productionForm" onsubmit="ProductionModule.saveForm(event)">
                    <!-- Select Badge ID -->
                    <div class="form-section">
                        <h4 class="form-section-title"><i class="fas fa-tag"></i> Select Sub Garment</h4>
                        <div class="form-group">
                            <label>Badge ID <span class="required">*</span></label>
                            <select class="form-input form-select" id="prodBadgeId" required onchange="ProductionModule.autoFillData()">
                                <option value="">-- Select Badge ID --</option>
                                ${subGarments.map(sg => `<option value="${sg.id}" data-customer="${sg.customer || ''}" data-style="${sg.style || ''}" data-colour="${sg.colour || ''}" data-fabric="${sg.fabricCost || 0}" data-accessories="${sg.accessoriesCost || 0}" data-cutting="${sg.cuttingCost || 0}">${sg.badgeId} - ${sg.customer || 'N/A'} - ${sg.style || 'N/A'}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Auto-filled Data -->
                    <div class="form-section">
                        <h4 class="form-section-title"><i class="fas fa-info-circle"></i> Order Details (Auto-filled)</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Customer</label>
                                <input type="text" class="form-input" id="prodCustomer" readonly>
                            </div>
                            <div class="form-group">
                                <label>Style</label>
                                <input type="text" class="form-input" id="prodStyle" readonly>
                            </div>
                            <div class="form-group">
                                <label>Colour</label>
                                <input type="text" class="form-input" id="prodColour" readonly>
                            </div>
                        </div>
                    </div>

                    <!-- Production Quantities -->
                    <div class="form-section">
                        <h4 class="form-section-title"><i class="fas fa-cubes"></i> Production Quantities</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Cut Quantity</label>
                                <input type="number" class="form-input" name="cutQty" id="prodCutQty" min="0" value="0" oninput="ProductionModule.calculateEfficiency()">
                            </div>
                            <div class="form-group">
                                <label>Produced Quantity</label>
                                <input type="number" class="form-input" name="producedQty" id="prodProducedQty" min="0" value="0" oninput="ProductionModule.calculateEfficiency()">
                            </div>
                            <div class="form-group">
                                <label>Completed Quantity</label>
                                <input type="number" class="form-input" name="completedQty" id="prodCompletedQty" min="0" value="0">
                            </div>
                            <div class="form-group">
                                <label>Damage Quantity</label>
                                <input type="number" class="form-input" name="damageQty" id="prodDamageQty" min="0" value="0" oninput="ProductionModule.calculateEfficiency()">
                            </div>
                            <div class="form-group">
                                <label>Reject Quantity</label>
                                <input type="number" class="form-input" name="rejectQty" min="0" value="0">
                            </div>
                            <div class="form-group">
                                <label>Rework Quantity</label>
                                <input type="number" class="form-input" name="reworkQty" min="0" value="0">
                            </div>
                        </div>
                    </div>

                    <!-- Cost Summary -->
                    <div class="form-section">
                        <h4 class="form-section-title"><i class="fas fa-calculator"></i> Cost Summary</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Fabric Cost (Auto)</label>
                                <input type="number" class="form-input" id="prodFabricCost" readonly>
                            </div>
                            <div class="form-group">
                                <label>Accessories Cost (Auto)</label>
                                <input type="number" class="form-input" id="prodAccessoriesCost" readonly>
                            </div>
                            <div class="form-group">
                                <label>Cutting Cost (Auto)</label>
                                <input type="number" class="form-input" id="prodCuttingCost" readonly>
                            </div>
                        </div>
                        <div style="margin-top:16px;padding:16px;background:var(--accent-light);border-radius:8px;text-align:center;">
                            <span style="font-weight:700;">Efficiency: </span>
                            <span style="font-size:1.5rem;font-weight:800;color:var(--accent-color);" id="prodEfficiencyDisplay">0%</span>
                            <br>
                            <span style="font-weight:700;">Damage Rate: </span>
                            <span style="font-weight:800;color:var(--danger-color);" id="prodDamageRate">0%</span>
                            <br>
                            <span style="font-weight:700;">Total Cost: </span>
                            <span style="font-weight:800;" id="prodTotalCost">Rs. 0</span>
                            <br>
                            <span style="font-weight:700;">Cost Per Piece: </span>
                            <span style="font-weight:800;color:var(--accent-color);" id="prodCostPerPiece">Rs. 0</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Status</label>
                        <select class="form-input form-select" name="status">
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="on-hold">On Hold</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary btn-lift" type="submit" form="productionForm">
                    <i class="fas fa-save"></i> Save Production Batch
                </button>
            </div>
        `;

        overlay.classList.add('active');
        overlay.style.display = 'flex';
    }

    static autoFillData() {
        const select = document.getElementById('prodBadgeId');
        const option = select.options[select.selectedIndex];
        
        if (!option || !select.value) return;

        document.getElementById('prodCustomer').value = option.dataset.customer || '';
        document.getElementById('prodStyle').value = option.dataset.style || '';
        document.getElementById('prodColour').value = option.dataset.colour || '';
        document.getElementById('prodFabricCost').value = option.dataset.fabric || '0';
        document.getElementById('prodAccessoriesCost').value = option.dataset.accessories || '0';
        document.getElementById('prodCuttingCost').value = option.dataset.cutting || '0';
        
        ProductionModule.calculateEfficiency();
    }

    static calculateEfficiency() {
        const cutQty = parseInt(document.getElementById('prodCutQty')?.value) || 0;
        const producedQty = parseInt(document.getElementById('prodProducedQty')?.value) || 0;
        const damageQty = parseInt(document.getElementById('prodDamageQty')?.value) || 0;
        
        const fabricCost = parseFloat(document.getElementById('prodFabricCost')?.value) || 0;
        const accessoriesCost = parseFloat(document.getElementById('prodAccessoriesCost')?.value) || 0;
        const cuttingCost = parseFloat(document.getElementById('prodCuttingCost')?.value) || 0;
        
        const efficiency = cutQty > 0 ? Math.round((producedQty / cutQty) * 100) : 0;
        const damageRate = cutQty > 0 ? Math.round((damageQty / cutQty) * 100) : 0;
        const totalCost = fabricCost + accessoriesCost + cuttingCost;
        const costPerPiece = producedQty > 0 ? Math.round(totalCost / producedQty) : 0;
        
        document.getElementById('prodEfficiencyDisplay').textContent = efficiency + '%';
        document.getElementById('prodDamageRate').textContent = damageRate + '%';
        document.getElementById('prodTotalCost').textContent = 'Rs. ' + totalCost.toLocaleString();
        document.getElementById('prodCostPerPiece').textContent = 'Rs. ' + costPerPiece.toLocaleString();
    }

    static saveForm(event) {
        event.preventDefault();
        
        const select = document.getElementById('prodBadgeId');
        const option = select.options[select.selectedIndex];
        
        const badgeId = option ? option.text.split(' - ')[0] : '';
        const formData = new FormData(event.target);
        
        const data = {
            badgeId: badgeId,
            customer: document.getElementById('prodCustomer').value,
            style: document.getElementById('prodStyle').value,
            colour: document.getElementById('prodColour').value,
            cutQty: parseInt(formData.get('cutQty')) || 0,
            producedQty: parseInt(formData.get('producedQty')) || 0,
            completedQty: parseInt(formData.get('completedQty')) || 0,
            damageQty: parseInt(formData.get('damageQty')) || 0,
            rejectQty: parseInt(formData.get('rejectQty')) || 0,
            reworkQty: parseInt(formData.get('reworkQty')) || 0,
            fabricCost: parseFloat(document.getElementById('prodFabricCost').value) || 0,
            accessoriesCost: parseFloat(document.getElementById('prodAccessoriesCost').value) || 0,
            cuttingCost: parseFloat(document.getElementById('prodCuttingCost').value) || 0,
            totalCost: parseFloat(document.getElementById('prodFabricCost').value) + parseFloat(document.getElementById('prodAccessoriesCost').value) + parseFloat(document.getElementById('prodCuttingCost').value),
            status: formData.get('status') || 'in-progress',
        };
        
        db.addItem('production', data);
        app.showToast('Production batch saved!', 'success');
        app.closeModal();
        
        const container = document.getElementById('moduleContainer');
        if (container) ProductionModule.render(container);
    }

    static viewItem(id) {
        const item = db.getItem('production', id);
        if (!item) return;
        app.viewItem('production', id);
    }

    static editItem(id) {
        app.editItem('production', id);
    }
}
