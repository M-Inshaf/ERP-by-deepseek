/**
 * Hummingbird ERP - Sub Garments Module
 * Agent-Based Subcontractor Production Management
 * Cutting • Finishing • Ledger • Statement
 */

class SubGarmentsModule {
    static currentAgentId = null;
    static currentTab = 'cutting';

    static render(container) {
        const agents = db.getCollection('subGarmentAgents');
        
        // Set first agent as default if none selected
        if (!SubGarmentsModule.currentAgentId && agents.length > 0) {
            SubGarmentsModule.currentAgentId = agents[0].id;
        }

        container.innerHTML = `
            <!-- Module Header -->
            <div class="module-header">
                <div>
                    <h2 class="module-title">Sub Garments - Agent Management</h2>
                    <p class="module-subtitle">Subcontractor production tracking system</p>
                </div>
                <div class="module-actions">
                    <button class="btn btn-secondary btn-lift" onclick="SubGarmentsModule.exportCurrentAgent()">
                        <i class="fas fa-file-export"></i> Export
                    </button>
                    <button class="btn btn-primary btn-lift btn-glow" onclick="SubGarmentsModule.showAddAgentForm()">
                        <i class="fas fa-user-plus"></i> Add Agent
                    </button>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 250px 1fr; gap: 20px;">
                
                <!-- Agent Sidebar -->
                <div class="glass-card" style="padding: 0; overflow: hidden; height: fit-content; max-height: 70vh;">
                    <div style="padding: 16px; border-bottom: 1px solid var(--border-color); background: var(--bg-secondary);">
                        <h4 style="font-weight: 700; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-users" style="color: var(--accent-color);"></i> Agents
                        </h4>
                    </div>
                    <div style="overflow-y: auto; max-height: 60vh;" id="agentList">
                        ${agents.length === 0 ? `
                            <div style="padding: 24px; text-align: center; color: var(--text-tertiary);">
                                <i class="fas fa-user-slash" style="font-size: 2rem; opacity: 0.3;"></i>
                                <p style="margin-top: 8px; font-size: 0.85rem;">No agents yet</p>
                            </div>
                        ` : agents.map(agent => `
                            <div class="agent-tab ${SubGarmentsModule.currentAgentId === agent.id ? 'active' : ''}" 
                                 onclick="SubGarmentsModule.selectAgent('${agent.id}')"
                                 style="padding: 14px 16px; cursor: pointer; border-bottom: 1px solid var(--border-color); transition: all 0.2s ease; display: flex; align-items: center; justify-content: space-between; ${SubGarmentsModule.currentAgentId === agent.id ? 'background: var(--accent-light); border-left: 3px solid var(--accent-color);' : ''}">
                                <div>
                                    <div style="font-weight: 600; font-size: 0.9rem;">${agent.name}</div>
                                    <div style="font-size: 0.75rem; color: var(--text-tertiary);">${agent.phone || 'No phone'}</div>
                                </div>
                                <div style="display: flex; gap: 4px;">
                                    <button class="btn-icon-sm btn-edit" onclick="event.stopPropagation(); SubGarmentsModule.editAgent('${agent.id}')" title="Edit">
                                        <i class="fas fa-edit" style="font-size: 0.7rem;"></i>
                                    </button>
                                    <button class="btn-icon-sm btn-delete" onclick="event.stopPropagation(); SubGarmentsModule.deleteAgent('${agent.id}')" title="Delete">
                                        <i class="fas fa-trash" style="font-size: 0.7rem;"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Main Content Area -->
                <div>
                    ${SubGarmentsModule.currentAgentId ? SubGarmentsModule.renderAgentContent() : `
                        <div class="glass-card" style="padding: 60px; text-align: center;">
                            <i class="fas fa-user-plus" style="font-size: 4rem; opacity: 0.2; color: var(--accent-color);"></i>
                            <h3 style="margin-top: 16px;">Select or Add an Agent</h3>
                            <p style="color: var(--text-tertiary);">Create an agent to start tracking cutting and finishing</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    // ==========================================
    // AGENT CONTENT (TABS)
    // ==========================================

    static renderAgentContent() {
        const agent = db.getItem('subGarmentAgents', SubGarmentsModule.currentAgentId);
        if (!agent) return '';

        const cuttingEntries = agent.cuttingEntries || [];
        const finishingEntries = agent.finishingEntries || [];
        const ledgerEntries = agent.ledgerEntries || [];

        // Calculate KPIs
        const totalBills = finishingEntries.reduce((s, e) => s + (e.grossBill || 0), 0);
        const totalPaid = ledgerEntries.filter(e => e.type === 'Disbursed Payment').reduce((s, e) => s + (e.amount || 0), 0);
        const totalAccrued = ledgerEntries.filter(e => e.type === 'Invoice Accrual').reduce((s, e) => s + (e.amount || 0), 0);
        const balance = totalAccrued - totalPaid;

        return `
            <!-- KPI Summary Bar -->
            <div class="kpi-grid" style="margin-bottom: 16px;">
                <div class="kpi-card glass-card" style="padding: 16px;">
                    <div class="kpi-icon" style="width: 40px; height: 40px; font-size: 1rem; background: linear-gradient(135deg, #3b82f6, #2563eb);">
                        <i class="fas fa-file-invoice"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Bills</span>
                        <span class="kpi-value" style="font-size: 1.1rem;">Rs. ${totalBills.toLocaleString()}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card" style="padding: 16px;">
                    <div class="kpi-icon" style="width: 40px; height: 40px; font-size: 1rem; background: linear-gradient(135deg, #10b981, #059669);">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Paid</span>
                        <span class="kpi-value" style="font-size: 1.1rem;">Rs. ${totalPaid.toLocaleString()}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card" style="padding: 16px;">
                    <div class="kpi-icon" style="width: 40px; height: 40px; font-size: 1rem; background: linear-gradient(135deg, ${balance >= 0 ? '#f59e0b' : '#ef4444'}, ${balance >= 0 ? '#d97706' : '#dc2626'});">
                        <i class="fas fa-balance-scale"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Balance Due</span>
                        <span class="kpi-value" style="font-size: 1.1rem; color: ${balance >= 0 ? 'var(--warning-color)' : 'var(--danger-color)'};">Rs. ${balance.toLocaleString()}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card" style="padding: 16px;">
                    <div class="kpi-icon" style="width: 40px; height: 40px; font-size: 1rem; background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Agent</span>
                        <span class="kpi-value" style="font-size: 0.9rem;">${agent.name}</span>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="glass-card" style="overflow: hidden;">
                <div class="tab-nav" style="display: flex; border-bottom: 2px solid var(--border-color); background: var(--bg-secondary);">
                    ${['cutting', 'finishing', 'ledger', 'statement'].map(tab => `
                        <button class="tab-btn ${SubGarmentsModule.currentTab === tab ? 'active' : ''}" 
                                onclick="SubGarmentsModule.switchTab('${tab}')"
                                style="flex: 1; padding: 14px; border: none; background: ${SubGarmentsModule.currentTab === tab ? 'var(--accent-light)' : 'transparent'}; color: ${SubGarmentsModule.currentTab === tab ? 'var(--accent-color)' : 'var(--text-secondary)'}; font-weight: 600; cursor: pointer; transition: all 0.2s ease; border-bottom: ${SubGarmentsModule.currentTab === tab ? '3px solid var(--accent-color)' : '3px solid transparent'};">
                            <i class="fas fa-${tab === 'cutting' ? 'cut' : tab === 'finishing' ? 'check-double' : tab === 'ledger' ? 'book' : 'file-alt'}"></i>
                            ${tab === 'cutting' ? ' Cutting & Dispatch' : tab === 'finishing' ? ' Finishing Receipts' : tab === 'ledger' ? ' Ledger' : ' Statement'}
                        </button>
                    `).join('')}
                </div>

                <div class="tab-content" style="padding: 20px;" id="tabContent">
                    ${SubGarmentsModule.renderCurrentTab()}
                </div>
            </div>
        `;
    }

    static switchTab(tab) {
        SubGarmentsModule.currentTab = tab;
        const container = document.getElementById('moduleContainer');
        if (container) SubGarmentsModule.render(container);
    }

    static renderCurrentTab() {
        const agent = db.getItem('subGarmentAgents', SubGarmentsModule.currentAgentId);
        if (!agent) return '';

        switch(SubGarmentsModule.currentTab) {
            case 'cutting': return SubGarmentsModule.renderCuttingTab(agent);
            case 'finishing': return SubGarmentsModule.renderFinishingTab(agent);
            case 'ledger': return SubGarmentsModule.renderLedgerTab(agent);
            case 'statement': return SubGarmentsModule.renderStatementTab(agent);
            default: return '';
        }
    }

    // ==========================================
    // 1. CUTTING & DISPATCH TAB
    // ==========================================

    static renderCuttingTab(agent) {
        const entries = agent.cuttingEntries || [];
        
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="font-weight: 700;"><i class="fas fa-cut" style="color: var(--accent-color);"></i> Cutting & Dispatch Records</h4>
                <button class="btn btn-primary btn-sm btn-lift" onclick="SubGarmentsModule.showCuttingForm()">
                    <i class="fas fa-plus"></i> Add Cutting Entry
                </button>
            </div>
            
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Invoice No</th>
                            <th>Date</th>
                            <th>Item</th>
                            <th>Cuts</th>
                            <th>Layers</th>
                            <th>Expected Qty</th>
                            <th>Unit Rate</th>
                            <th>Projected Value</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${entries.length === 0 ? `
                            <tr><td colspan="10" class="empty-state"><i class="fas fa-inbox"></i><p>No cutting entries</p></td></tr>
                        ` : entries.map((entry, i) => `
                            <tr>
                                <td style="font-weight: 600;">${entry.invoiceNo || '-'}</td>
                                <td>${entry.date || '-'}</td>
                                <td>${entry.item || '-'}</td>
                                <td>${entry.cuts || 0}</td>
                                <td>${entry.layers || 0}</td>
                                <td style="font-weight: 600;">${entry.expectedQty || 0}</td>
                                <td>Rs. ${(entry.unitRate || 0).toLocaleString()}</td>
                                <td style="font-weight: 700; color: var(--accent-color);">Rs. ${(entry.projectedValue || 0).toLocaleString()}</td>
                                <td><span class="status-badge ${entry.status === 'completed' ? 'active' : entry.status === 'in-progress' ? 'pending' : 'draft'}">${entry.status || 'Pending'}</span></td>
                                <td class="actions-cell">
                                    <button class="btn-icon-sm btn-edit" onclick="SubGarmentsModule.editCuttingEntry('${entry.id}')"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon-sm btn-delete" onclick="SubGarmentsModule.deleteCuttingEntry('${entry.id}')"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    static showCuttingForm(editId = null) {
        const agent = db.getItem('subGarmentAgents', SubGarmentsModule.currentAgentId);
        if (!agent) return;
        
        const entry = editId ? (agent.cuttingEntries || []).find(e => e.id === editId) : null;
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-cut"></i> ${editId ? 'Edit' : 'Add'} Cutting Entry</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="cuttingForm" onsubmit="SubGarmentsModule.saveCuttingEntry(event, '${editId || ''}')">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Cut Invoice No <span class="required">*</span></label>
                            <input type="text" class="form-input" name="invoiceNo" value="${entry?.invoiceNo || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Date <span class="required">*</span></label>
                            <input type="date" class="form-input" name="date" value="${entry?.date || new Date().toISOString().split('T')[0]}" required>
                        </div>
                        <div class="form-group">
                            <label>Item Name <span class="required">*</span></label>
                            <input type="text" class="form-input" name="item" value="${entry?.item || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <input type="text" class="form-input" name="description" value="${entry?.description || ''}">
                        </div>
                        <div class="form-group">
                            <label>No of Cuts <span class="required">*</span></label>
                            <input type="number" class="form-input" id="cutCuts" name="cuts" value="${entry?.cuts || ''}" min="0" required oninput="SubGarmentsModule.calcCuttingPreview()">
                        </div>
                        <div class="form-group">
                            <label>Layers per Cut <span class="required">*</span></label>
                            <input type="number" class="form-input" id="cutLayers" name="layers" value="${entry?.layers || ''}" min="0" required oninput="SubGarmentsModule.calcCuttingPreview()">
                        </div>
                        <div class="form-group">
                            <label>Sizes</label>
                            <input type="text" class="form-input" name="sizes" value="${entry?.sizes || ''}" placeholder="e.g., S,M,L,XL">
                        </div>
                        <div class="form-group">
                            <label>Unit Rate (Rs.) <span class="required">*</span></label>
                            <input type="number" class="form-input" id="cutUnitRate" name="unitRate" value="${entry?.unitRate || ''}" min="0" step="0.01" required oninput="SubGarmentsModule.calcCuttingPreview()">
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select class="form-input form-select" name="status">
                                <option value="pending" ${entry?.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="in-progress" ${entry?.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                                <option value="completed" ${entry?.status === 'completed' ? 'selected' : ''}>Completed</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Preview -->
                    <div style="margin-top: 16px; padding: 16px; background: var(--accent-light); border-radius: 8px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <div><strong>Expected Quantity:</strong> <span id="previewExpectedQty">0</span></div>
                            <div><strong>Projected Value:</strong> <span id="previewProjectedValue" style="color: var(--accent-color); font-weight: 700;">Rs. 0</span></div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary" type="submit" form="cuttingForm">${editId ? 'Update' : 'Save'} Entry</button>
            </div>
        `;

        overlay.classList.add('active');
        overlay.style.display = 'flex';
        
        if (entry) setTimeout(() => SubGarmentsModule.calcCuttingPreview(), 100);
    }

    static calcCuttingPreview() {
        const cuts = parseInt(document.getElementById('cutCuts')?.value) || 0;
        const layers = parseInt(document.getElementById('cutLayers')?.value) || 0;
        const unitRate = parseFloat(document.getElementById('cutUnitRate')?.value) || 0;
        
        const expectedQty = cuts * layers;
        const projectedValue = expectedQty * unitRate;
        
        const expectedEl = document.getElementById('previewExpectedQty');
        const projectedEl = document.getElementById('previewProjectedValue');
        
        if (expectedEl) expectedEl.textContent = expectedQty;
        if (projectedEl) projectedEl.textContent = 'Rs. ' + projectedValue.toLocaleString();
    }

    static saveCuttingEntry(event, editId) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const cuts = parseInt(formData.get('cuts')) || 0;
        const layers = parseInt(formData.get('layers')) || 0;
        const unitRate = parseFloat(formData.get('unitRate')) || 0;
        const expectedQty = cuts * layers;
        const projectedValue = expectedQty * unitRate;
        
        const entry = {
            id: editId || 'cut_' + Date.now(),
            invoiceNo: formData.get('invoiceNo'),
            date: formData.get('date'),
            item: formData.get('item'),
            description: formData.get('description'),
            cuts: cuts,
            layers: layers,
            sizes: formData.get('sizes'),
            expectedQty: expectedQty,
            unitRate: unitRate,
            projectedValue: projectedValue,
            status: formData.get('status') || 'pending',
            createdAt: new Date().toISOString()
        };

        const agent = db.getItem('subGarmentAgents', SubGarmentsModule.currentAgentId);
        if (!agent) return;

        let entries = agent.cuttingEntries || [];
        
        if (editId) {
            entries = entries.map(e => e.id === editId ? entry : e);
        } else {
            entries.push(entry);
        }

        db.updateItem('subGarmentAgents', SubGarmentsModule.currentAgentId, { cuttingEntries: entries });
        app.showToast(editId ? 'Cutting entry updated!' : 'Cutting entry added!', 'success');
        app.closeModal();
        
        const container = document.getElementById('moduleContainer');
        if (container) SubGarmentsModule.render(container);
    }

    static editCuttingEntry(entryId) {
        SubGarmentsModule.showCuttingForm(entryId);
    }

    static deleteCuttingEntry(entryId) {
        app.showConfirm('Delete Entry', 'Delete this cutting entry?', () => {
            const agent = db.getItem('subGarmentAgents', SubGarmentsModule.currentAgentId);
            if (agent) {
                const entries = (agent.cuttingEntries || []).filter(e => e.id !== entryId);
                db.updateItem('subGarmentAgents', SubGarmentsModule.currentAgentId, { cuttingEntries: entries });
                app.showToast('Entry deleted', 'success');
                const container = document.getElementById('moduleContainer');
                if (container) SubGarmentsModule.render(container);
            }
        });
    }

    // ==========================================
    // 2. FINISHING RECEIPTS TAB
    // ==========================================

    static renderFinishingTab(agent) {
        const entries = agent.finishingEntries || [];
        
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="font-weight: 700;"><i class="fas fa-check-double" style="color: var(--accent-color);"></i> Finishing Receipts</h4>
                <button class="btn btn-primary btn-sm btn-lift" onclick="SubGarmentsModule.showFinishingForm()">
                    <i class="fas fa-plus"></i> Add Finishing Entry
                </button>
            </div>
            
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Sub Invoice</th>
                            <th>Linked Cut</th>
                            <th>Date</th>
                            <th>Expected Qty</th>
                            <th>Grade A</th>
                            <th>Damaged</th>
                            <th>Waste</th>
                            <th>Accepted</th>
                            <th>Shortage</th>
                            <th>Gross Bill</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${entries.length === 0 ? `
                            <tr><td colspan="11" class="empty-state"><i class="fas fa-inbox"></i><p>No finishing entries</p></td></tr>
                        ` : entries.map((entry, i) => `
                            <tr>
                                <td style="font-weight: 600;">${entry.subInvoiceNo || '-'}</td>
                                <td>${entry.linkedCutInvoice || '-'}</td>
                                <td>${entry.date || '-'}</td>
                                <td>${entry.expectedQty || 0}</td>
                                <td>${entry.gradeA || 0}</td>
                                <td>${entry.damagedComplete || 0}</td>
                                <td>${entry.waste || 0}</td>
                                <td style="font-weight: 600;">${entry.totalAccepted || 0}</td>
                                <td style="color: ${(entry.shortage || 0) > 0 ? 'var(--danger-color)' : 'var(--success-color)'};">${entry.shortage || 0}</td>
                                <td style="font-weight: 700; color: var(--accent-color);">Rs. ${(entry.grossBill || 0).toLocaleString()}</td>
                                <td class="actions-cell">
                                    <button class="btn-icon-sm btn-edit" onclick="SubGarmentsModule.editFinishingEntry('${entry.id}')"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon-sm btn-delete" onclick="SubGarmentsModule.deleteFinishingEntry('${entry.id}')"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    static showFinishingForm(editId = null) {
        const agent = db.getItem('subGarmentAgents', SubGarmentsModule.currentAgentId);
        if (!agent) return;
        
        const cuttingEntries = agent.cuttingEntries || [];
        const entry = editId ? (agent.finishingEntries || []).find(e => e.id === editId) : null;
        
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-check-double"></i> ${editId ? 'Edit' : 'Add'} Finishing Receipt</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="finishingForm" onsubmit="SubGarmentsModule.saveFinishingEntry(event, '${editId || ''}')">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Sub Invoice No <span class="required">*</span></label>
                            <input type="text" class="form-input" name="subInvoiceNo" value="${entry?.subInvoiceNo || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Link Cut Invoice <span class="required">*</span></label>
                            <select class="form-input form-select" name="linkedCutInvoice" id="finLinkedCut" required onchange="SubGarmentsModule.autoLoadCutData()">
                                <option value="">-- Select Cut Invoice --</option>
                                ${cuttingEntries.map(c => `<option value="${c.invoiceNo}" data-qty="${c.expectedQty}" data-rate="${c.unitRate}" ${entry?.linkedCutInvoice === c.invoiceNo ? 'selected' : ''}>${c.invoiceNo} - ${c.item} (${c.expectedQty} pcs)</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Date Received</label>
                            <input type="date" class="form-input" name="date" value="${entry?.date || new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="form-group">
                            <label>Expected Qty (Auto)</label>
                            <input type="number" class="form-input" id="finExpectedQty" readonly style="background: var(--bg-tertiary);">
                        </div>
                        <div class="form-group">
                            <label>Unit Rate (Auto)</label>
                            <input type="number" class="form-input" id="finUnitRate" readonly style="background: var(--bg-tertiary);">
                        </div>
                        <div class="form-group">
                            <label>Grade A Goods <span class="required">*</span></label>
                            <input type="number" class="form-input" name="gradeA" id="finGradeA" value="${entry?.gradeA || ''}" min="0" required oninput="SubGarmentsModule.calcFinishingPreview()">
                        </div>
                        <div class="form-group">
                            <label>Damaged Complete</label>
                            <input type="number" class="form-input" name="damagedComplete" id="finDamaged" value="${entry?.damagedComplete || 0}" min="0" oninput="SubGarmentsModule.calcFinishingPreview()">
                        </div>
                        <div class="form-group">
                            <label>Waste</label>
                            <input type="number" class="form-input" name="waste" id="finWaste" value="${entry?.waste || 0}" min="0" oninput="SubGarmentsModule.calcFinishingPreview()">
                        </div>
                    </div>
                    
                    <!-- Preview -->
                    <div style="margin-top: 16px; padding: 16px; background: var(--accent-light); border-radius: 8px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <div><strong>Total Accepted:</strong> <span id="previewAccepted">0</span></div>
                            <div><strong>Shortage:</strong> <span id="previewShortage">0</span></div>
                            <div><strong>Gross Bill:</strong> <span id="previewGrossBill" style="color: var(--accent-color); font-weight: 700;">Rs. 0</span></div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary" type="submit" form="finishingForm">${editId ? 'Update' : 'Save'} Receipt</button>
            </div>
        `;

        overlay.classList.add('active');
        overlay.style.display = 'flex';
        
        if (entry) setTimeout(() => { SubGarmentsModule.autoLoadCutData(); SubGarmentsModule.calcFinishingPreview(); }, 200);
    }

    static autoLoadCutData() {
        const select = document.getElementById('finLinkedCut');
        const option = select?.options[select.selectedIndex];
        
        if (!option || !option.dataset.qty) return;
        
        document.getElementById('finExpectedQty').value = option.dataset.qty;
        document.getElementById('finUnitRate').value = option.dataset.rate;
        SubGarmentsModule.calcFinishingPreview();
    }

    static calcFinishingPreview() {
        const expectedQty = parseInt(document.getElementById('finExpectedQty')?.value) || 0;
        const gradeA = parseInt(document.getElementById('finGradeA')?.value) || 0;
        const damaged = parseInt(document.getElementById('finDamaged')?.value) || 0;
        const waste = parseInt(document.getElementById('finWaste')?.value) || 0;
        const unitRate = parseFloat(document.getElementById('finUnitRate')?.value) || 0;
        
        const totalAccepted = gradeA + damaged;
        const shortage = expectedQty - totalAccepted - waste;
        const grossBill = totalAccepted * unitRate;
        
        const acceptedEl = document.getElementById('previewAccepted');
        const shortageEl = document.getElementById('previewShortage');
        const billEl = document.getElementById('previewGrossBill');
        
        if (acceptedEl) acceptedEl.textContent = totalAccepted;
        if (shortageEl) shortageEl.textContent = shortage;
        if (billEl) billEl.textContent = 'Rs. ' + grossBill.toLocaleString();
    }

    static saveFinishingEntry(event, editId) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const expectedQty = parseInt(document.getElementById('finExpectedQty').value) || 0;
        const gradeA = parseInt(formData.get('gradeA')) || 0;
        const damagedComplete = parseInt(formData.get('damagedComplete')) || 0;
        const waste = parseInt(formData.get('waste')) || 0;
        const unitRate = parseFloat(document.getElementById('finUnitRate').value) || 0;
        
        const totalAccepted = gradeA + damagedComplete;
        const shortage = expectedQty - totalAccepted - waste;
        const grossBill = totalAccepted * unitRate;
        
        const entry = {
            id: editId || 'fin_' + Date.now(),
            subInvoiceNo: formData.get('subInvoiceNo'),
            linkedCutInvoice: formData.get('linkedCutInvoice'),
            date: formData.get('date'),
            expectedQty: expectedQty,
            gradeA: gradeA,
            damagedComplete: damagedComplete,
            waste: waste,
            totalAccepted: totalAccepted,
            shortage: shortage,
            unitRate: unitRate,
            grossBill: grossBill,
            createdAt: new Date().toISOString()
        };

        const agent = db.getItem('subGarmentAgents', SubGarmentsModule.currentAgentId);
        if (!agent) return;

        let entries = agent.finishingEntries || [];
        
        if (editId) {
            // Remove old ledger accrual
            const oldEntry = entries.find(e => e.id === editId);
            if (oldEntry) {
                agent.ledgerEntries = (agent.ledgerEntries || []).filter(e => e.reference !== oldEntry.subInvoiceNo);
            }
            entries = entries.map(e => e.id === editId ? entry : e);
        } else {
            entries.push(entry);
        }

        // Auto-create ledger accrual (CREDIT - company owes agent)
        const ledgerEntry = {
            id: 'ledger_' + Date.now(),
            date: entry.date,
            type: 'Invoice Accrual',
            reference: entry.subInvoiceNo,
            description: `Finishing receipt: ${entry.subInvoiceNo}`,
            amount: grossBill,
            paymentMethod: '',
            transactionRef: '',
            createdAt: new Date().toISOString()
        };
        
        let ledgerEntries = agent.ledgerEntries || [];
        ledgerEntries.push(ledgerEntry);

        db.updateItem('subGarmentAgents', SubGarmentsModule.currentAgentId, { 
            finishingEntries: entries,
            ledgerEntries: ledgerEntries
        });
        
        app.showToast(editId ? 'Finishing entry updated!' : 'Finishing receipt saved! Ledger accrual created.', 'success');
        app.closeModal();
        
        const container = document.getElementById('moduleContainer');
        if (container) SubGarmentsModule.render(container);
    }

    static editFinishingEntry(entryId) {
        SubGarmentsModule.showFinishingForm(entryId);
    }

    static deleteFinishingEntry(entryId) {
        app.showConfirm('Delete Entry', 'This will also remove linked ledger accrual. Continue?', () => {
            const agent = db.getItem('subGarmentAgents', SubGarmentsModule.currentAgentId);
            if (agent) {
                const entry = (agent.finishingEntries || []).find(e => e.id === entryId);
                const entries = (agent.finishingEntries || []).filter(e => e.id !== entryId);
                
                // Remove linked ledger accrual
                let ledgerEntries = (agent.ledgerEntries || []).filter(e => e.reference !== entry?.subInvoiceNo);
                
                db.updateItem('subGarmentAgents', SubGarmentsModule.currentAgentId, { 
                    finishingEntries: entries,
                    ledgerEntries: ledgerEntries
                });
                
                app.showToast('Entry and linked accrual deleted', 'success');
                const container = document.getElementById('moduleContainer');
                if (container) SubGarmentsModule.render(container);
            }
        });
    }

    // ==========================================
    // 3. LEDGER TAB
    // ==========================================

    static renderLedgerTab(agent) {
        const entries = agent.ledgerEntries || [];
        
        // Calculate running balance
        let runningBalance = 0;
        const entriesWithBalance = entries.map(e => {
            if (e.type === 'Invoice Accrual') runningBalance += (e.amount || 0);
            else runningBalance -= (e.amount || 0);
            return { ...e, balance: runningBalance };
        });

        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="font-weight: 700;"><i class="fas fa-book" style="color: var(--accent-color);"></i> Ledger Entries</h4>
                <button class="btn btn-primary btn-sm btn-lift" onclick="SubGarmentsModule.showLedgerForm()">
                    <i class="fas fa-plus"></i> Add Payment
                </button>
            </div>
            
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Reference</th>
                            <th>Method</th>
                            <th>Amount</th>
                            <th>Balance</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${entries.length === 0 ? `
                            <tr><td colspan="7" class="empty-state"><i class="fas fa-inbox"></i><p>No ledger entries</p></td></tr>
                        ` : entriesWithBalance.map((entry, i) => `
                            <tr>
                                <td>${entry.date || '-'}</td>
                                <td><span class="status-badge ${entry.type === 'Invoice Accrual' ? 'pending' : 'active'}">${entry.type}</span></td>
                                <td>${entry.reference || '-'}</td>
                                <td>${entry.paymentMethod || '-'}</td>
                                <td style="font-weight: 600; color: ${entry.type === 'Invoice Accrual' ? 'var(--warning-color)' : 'var(--success-color)'};">
                                    ${entry.type === 'Invoice Accrual' ? '+' : '-'} Rs. ${(entry.amount || 0).toLocaleString()}
                                </td>
                                <td style="font-weight: 700;">Rs. ${entry.balance.toLocaleString()}</td>
                                <td class="actions-cell">
                                    <button class="btn-icon-sm btn-edit" onclick="SubGarmentsModule.editLedgerEntry('${entry.id}')"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon-sm btn-delete" onclick="SubGarmentsModule.deleteLedgerEntry('${entry.id}')"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    static showLedgerForm(editId = null) {
        const agent = db.getItem('subGarmentAgents', SubGarmentsModule.currentAgentId);
        if (!agent) return;
        
        const entry = editId ? (agent.ledgerEntries || []).find(e => e.id === editId) : null;
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-book"></i> ${editId ? 'Edit' : 'Add'} Ledger Entry</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="ledgerForm" onsubmit="SubGarmentsModule.saveLedgerEntry(event, '${editId || ''}')">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Date</label>
                            <input type="date" class="form-input" name="date" value="${entry?.date || new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="form-group">
                            <label>Type</label>
                            <select class="form-input form-select" name="type">
                                <option value="Disbursed Payment" ${entry?.type === 'Disbursed Payment' ? 'selected' : ''}>Disbursed Payment</option>
                                <option value="Invoice Accrual" ${entry?.type === 'Invoice Accrual' ? 'selected' : ''}>Invoice Accrual</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Reference No</label>
                            <input type="text" class="form-input" name="reference" value="${entry?.reference || ''}">
                        </div>
                        <div class="form-group">
                            <label>Payment Method</label>
                            <select class="form-input form-select" name="paymentMethod" id="ledgerPaymentMethod" onchange="SubGarmentsModule.checkChequeMethod()">
                                <option value="">-- Select --</option>
                                <option value="Cash" ${entry?.paymentMethod === 'Cash' ? 'selected' : ''}>Cash</option>
                                <option value="Cheque" ${entry?.paymentMethod === 'Cheque' ? 'selected' : ''}>Cheque</option>
                                <option value="Bank Deposit" ${entry?.paymentMethod === 'Bank Deposit' ? 'selected' : ''}>Bank Deposit</option>
                                <option value="Online Transfer" ${entry?.paymentMethod === 'Online Transfer' ? 'selected' : ''}>Online Transfer</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Transaction Ref</label>
                            <input type="text" class="form-input" name="transactionRef" value="${entry?.transactionRef || ''}">
                        </div>
                        <div class="form-group">
                            <label>Amount (Rs.) <span class="required">*</span></label>
                            <input type="number" class="form-input" name="amount" value="${entry?.amount || ''}" min="0" step="0.01" required>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary" type="submit" form="ledgerForm">${editId ? 'Update' : 'Save'} Entry</button>
            </div>
        `;

        overlay.classList.add('active');
        overlay.style.display = 'flex';
    }

    static checkChequeMethod() {
        const method = document.getElementById('ledgerPaymentMethod')?.value;
        if (method === 'Cheque') {
            app.showToast('Cheque payment will be tracked in Cheque module', 'info');
        }
    }

    static saveLedgerEntry(event, editId) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const entry = {
            id: editId || 'ledger_' + Date.now(),
            date: formData.get('date'),
            type: formData.get('type'),
            reference: formData.get('reference'),
            paymentMethod: formData.get('paymentMethod'),
            transactionRef: formData.get('transactionRef'),
            amount: parseFloat(formData.get('amount')) || 0,
            createdAt: new Date().toISOString()
        };

        // If cheque payment, add to cheque tracker
        if (entry.paymentMethod === 'Cheque') {
            db.addItem('cheques', {
                relatedTo: 'agent_ledger',
                agentId: SubGarmentsModule.currentAgentId,
                reference: entry.reference,
                amount: entry.amount,
                date: entry.date,
                status: 'pending'
            });
        }

        const agent = db.getItem('subGarmentAgents', SubGarmentsModule.currentAgentId);
        if (!agent) return;

        let entries = agent.ledgerEntries || [];
        if (editId) {
            entries = entries.map(e => e.id === editId ? entry : e);
        } else {
            entries.push(entry);
        }

        db.updateItem('subGarmentAgents', SubGarmentsModule.currentAgentId, { ledgerEntries: entries });
        app.showToast(editId ? 'Ledger entry updated!' : 'Payment recorded!', 'success');
        app.closeModal();
        
        const container = document.getElementById('moduleContainer');
        if (container) SubGarmentsModule.render(container);
    }

    static editLedgerEntry(entryId) {
        SubGarmentsModule.showLedgerForm(entryId);
    }

    static deleteLedgerEntry(entryId) {
        app.showConfirm('Delete Entry', 'Delete this ledger entry? Balance will be recalculated.', () => {
            const agent = db.getItem('subGarmentAgents', SubGarmentsModule.currentAgentId);
            if (agent) {
                const entries = (agent.ledgerEntries || []).filter(e => e.id !== entryId);
                db.updateItem('subGarmentAgents', SubGarmentsModule.currentAgentId, { ledgerEntries: entries });
                app.showToast('Entry deleted', 'success');
                const container = document.getElementById('moduleContainer');
                if (container) SubGarmentsModule.render(container);
            }
        });
    }

    // ==========================================
    // 4. STATEMENT TAB
    // ==========================================

    static renderStatementTab(agent) {
        const cuttingEntries = agent.cuttingEntries || [];
        const finishingEntries = agent.finishingEntries || [];
        const ledgerEntries = agent.ledgerEntries || [];
        
        const totalBills = finishingEntries.reduce((s, e) => s + (e.grossBill || 0), 0);
        const totalPaid = ledgerEntries.filter(e => e.type === 'Disbursed Payment').reduce((s, e) => s + (e.amount || 0), 0);
        const totalAccrued = ledgerEntries.filter(e => e.type === 'Invoice Accrual').reduce((s, e) => s + (e.amount || 0), 0);
        const balance = totalAccrued - totalPaid;

        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="font-weight: 700;"><i class="fas fa-file-alt" style="color: var(--accent-color);"></i> Agent Statement</h4>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary btn-sm" onclick="SubGarmentsModule.printStatement()">
                        <i class="fas fa-print"></i> Print
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="SubGarmentsModule.exportStatementPDF()">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                </div>
            </div>

            <!-- Statement Header -->
            <div class="glass-card" style="padding: 24px; margin-bottom: 16px; text-align: center;">
                <h3 style="margin-bottom: 4px;">Hummingbird Clothing</h3>
                <p style="color: var(--text-tertiary);">FujiSan Lanka Pvt Ltd</p>
                <hr style="margin: 12px 0;">
                <h4>Agent Statement</h4>
                <p><strong>Agent:</strong> ${agent.name} | <strong>Phone:</strong> ${agent.phone || 'N/A'}</p>
                <p><strong>Statement Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <!-- Cutting Summary -->
            <div class="glass-card" style="padding: 16px; margin-bottom: 12px;">
                <h5 style="margin-bottom: 8px;">Cutting Summary (${cuttingEntries.length} entries)</h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.9rem;">
                    <div>Total Cuts:</div>
                    <div style="text-align: right; font-weight: 600;">${cuttingEntries.reduce((s,e) => s + (e.cuts || 0), 0)}</div>
                    <div>Total Expected Qty:</div>
                    <div style="text-align: right; font-weight: 600;">${cuttingEntries.reduce((s,e) => s + (e.expectedQty || 0), 0)}</div>
                    <div>Total Projected Value:</div>
                    <div style="text-align: right; font-weight: 700; color: var(--accent-color);">Rs. ${cuttingEntries.reduce((s,e) => s + (e.projectedValue || 0), 0).toLocaleString()}</div>
                </div>
            </div>

            <!-- Finishing Summary -->
            <div class="glass-card" style="padding: 16px; margin-bottom: 12px;">
                <h5 style="margin-bottom: 8px;">Finishing Summary (${finishingEntries.length} entries)</h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.9rem;">
                    <div>Total Accepted:</div>
                    <div style="text-align: right; font-weight: 600;">${finishingEntries.reduce((s,e) => s + (e.totalAccepted || 0), 0)}</div>
                    <div>Total Shortage:</div>
                    <div style="text-align: right; font-weight: 600; color: var(--danger-color);">${finishingEntries.reduce((s,e) => s + (e.shortage || 0), 0)}</div>
                </div>
            </div>

            <!-- Ledger Summary -->
            <div class="glass-card" style="padding: 16px; margin-bottom: 12px;">
                <h5 style="margin-bottom: 8px;">Financial Summary</h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 1rem;">
                    <div>Total Bills:</div>
                    <div style="text-align: right; font-weight: 700;">Rs. ${totalBills.toLocaleString()}</div>
                    <div>Total Paid:</div>
                    <div style="text-align: right; font-weight: 700; color: var(--success-color);">Rs. ${totalPaid.toLocaleString()}</div>
                    <div style="border-top: 2px solid var(--border-color); padding-top: 8px; font-size: 1.1rem;"><strong>Outstanding Balance:</strong></div>
                    <div style="border-top: 2px solid var(--border-color); padding-top: 8px; text-align: right; font-weight: 800; font-size: 1.2rem; color: ${balance >= 0 ? 'var(--warning-color)' : 'var(--danger-color)'};">Rs. ${balance.toLocaleString()}</div>
                </div>
            </div>
        `;
    }

    // ==========================================
    // AGENT CRUD
    // ==========================================

    static showAddAgentForm() {
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-user-plus"></i> Add New Agent</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="agentForm" onsubmit="SubGarmentsModule.saveAgent(event)">
                    <div class="form-grid">
                        <div class="form-group"><label>Name <span class="required">*</span></label><input type="text" class="form-input" name="name" required></div>
                        <div class="form-group"><label>Phone</label><input type="text" class="form-input" name="phone"></div>
                        <div class="form-group full-width"><label>Address</label><input type="text" class="form-input" name="address"></div>
                        <div class="form-group full-width"><label>Notes</label><textarea class="form-input" name="notes" rows="2"></textarea></div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary" type="submit" form="agentForm">Save Agent</button>
            </div>
        `;

        overlay.classList.add('active');
        overlay.style.display = 'flex';
    }

    static saveAgent(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const agent = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            notes: formData.get('notes'),
            cuttingEntries: [],
            finishingEntries: [],
            ledgerEntries: []
        };
        
        const saved = db.addItem('subGarmentAgents', agent);
        SubGarmentsModule.currentAgentId = saved.id;
        
        app.showToast('Agent created!', 'success');
        app.closeModal();
        
        const container = document.getElementById('moduleContainer');
        if (container) SubGarmentsModule.render(container);
    }

    static editAgent(agentId) {
        const agent = db.getItem('subGarmentAgents', agentId);
        if (!agent) return;
        
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-user-edit"></i> Edit Agent</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="agentForm" onsubmit="SubGarmentsModule.updateAgent(event, '${agentId}')">
                    <div class="form-grid">
                        <div class="form-group"><label>Name</label><input type="text" class="form-input" name="name" value="${agent.name || ''}" required></div>
                        <div class="form-group"><label>Phone</label><input type="text" class="form-input" name="phone" value="${agent.phone || ''}"></div>
                        <div class="form-group full-width"><label>Address</label><input type="text" class="form-input" name="address" value="${agent.address || ''}"></div>
                        <div class="form-group full-width"><label>Notes</label><textarea class="form-input" name="notes" rows="2">${agent.notes || ''}</textarea></div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary" type="submit" form="agentForm">Update Agent</button>
            </div>
        `;

        overlay.classList.add('active');
        overlay.style.display = 'flex';
    }

    static updateAgent(event, agentId) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        db.updateItem('subGarmentAgents', agentId, {
            name: formData.get('name'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            notes: formData.get('notes')
        });
        
        app.showToast('Agent updated!', 'success');
        app.closeModal();
        
        const container = document.getElementById('moduleContainer');
        if (container) SubGarmentsModule.render(container);
    }

    static deleteAgent(agentId) {
        const agent = db.getItem('subGarmentAgents', agentId);
        if (!agent) return;
        
        app.showConfirm(
            'Delete Agent',
            `Delete "${agent.name}" and ALL linked records (cutting, finishing, ledger)? This cannot be undone.`,
            () => {
                db.deleteItem('subGarmentAgents', agentId);
                
                if (SubGarmentsModule.currentAgentId === agentId) {
                    const agents = db.getCollection('subGarmentAgents');
                    SubGarmentsModule.currentAgentId = agents.length > 0 ? agents[0].id : null;
                }
                
                app.showToast('Agent and all records deleted', 'success');
                const container = document.getElementById('moduleContainer');
                if (container) SubGarmentsModule.render(container);
            }
        );
    }

    static selectAgent(agentId) {
        SubGarmentsModule.currentAgentId = agentId;
        SubGarmentsModule.currentTab = 'cutting';
        const container = document.getElementById('moduleContainer');
        if (container) SubGarmentsModule.render(container);
    }

    // ==========================================
    // EXPORT & PRINT
    // ==========================================

    static exportCurrentAgent() {
        const agent = db.getItem('subGarmentAgents', SubGarmentsModule.currentAgentId);
        if (!agent) return;
        
        try {
            const data = [{
                'Agent': agent.name,
                'Phone': agent.phone,
                'Cutting Entries': agent.cuttingEntries?.length || 0,
                'Finishing Entries': agent.finishingEntries?.length || 0,
                'Ledger Entries': agent.ledgerEntries?.length || 0
            }];
            
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, agent.name);
            XLSX.writeFile(wb, `${agent.name}_export_${new Date().toISOString().split('T')[0]}.xlsx`);
            app.showToast('Exported!', 'success');
        } catch(e) {
            app.showToast('Export failed', 'error');
        }
    }

    static printStatement() {
        window.print();
    }

    static exportStatementPDF() {
        const agent = db.getItem('subGarmentAgents', SubGarmentsModule.currentAgentId);
        if (!agent) return;
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(16);
            doc.text('Agent Statement', 105, 20, { align: 'center' });
            doc.setFontSize(12);
            doc.text(`Agent: ${agent.name}`, 20, 35);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42);
            
            doc.save(`${agent.name}_statement.pdf`);
            app.showToast('PDF generated!', 'success');
        } catch(e) {
            app.showToast('PDF failed', 'error');
        }
    }
}
