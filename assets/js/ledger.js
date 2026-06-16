/**
 * Hummingbird ERP - Ledger Module
 * Double-Entry Style Ledger with Auto-Entries
 */

class LedgerModule {
    static render(container) {
        const ledgerEntries = db.getCollection('ledger');
        const agentLedgers = SubGarmentsModule.getAllAgentLedgers();
        const allEntries = [...ledgerEntries, ...agentLedgers].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Calculate totals
        const totalDebit = allEntries.filter(e => e.type === 'Disbursed Payment' || e.debit).reduce((s, e) => s + (e.debit || e.amount || 0), 0);
        const totalCredit = allEntries.filter(e => e.type === 'Invoice Accrual' || e.credit).reduce((s, e) => s + (e.credit || e.amount || 0), 0);
        const balance = totalCredit - totalDebit;

        container.innerHTML = `
            <div class="module-header">
                <div>
                    <h2 class="module-title">General Ledger</h2>
                    <p class="module-subtitle">Double-entry ledger with auto-accruals from all modules</p>
                </div>
                <div class="module-actions">
                    <button class="btn btn-secondary btn-lift" onclick="LedgerModule.exportLedger()">
                        <i class="fas fa-file-export"></i> Export
                    </button>
                    <button class="btn btn-primary btn-lift btn-glow" onclick="LedgerModule.showAddEntry()">
                        <i class="fas fa-plus"></i> Add Entry
                    </button>
                </div>
            </div>

            <!-- KPI Summary -->
            <div class="kpi-grid" style="margin-bottom: var(--spacing-lg);">
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                        <i class="fas fa-arrow-down"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Credits</span>
                        <span class="kpi-value" style="font-size: 1.2rem;">Rs. ${totalCredit.toLocaleString()}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                        <i class="fas fa-arrow-up"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Debits</span>
                        <span class="kpi-value" style="font-size: 1.2rem;">Rs. ${totalDebit.toLocaleString()}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, ${balance >= 0 ? '#f59e0b' : '#ef4444'}, ${balance >= 0 ? '#d97706' : '#dc2626'});">
                        <i class="fas fa-balance-scale"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Net Balance</span>
                        <span class="kpi-value" style="font-size: 1.2rem; color: ${balance >= 0 ? 'var(--warning-color)' : 'var(--danger-color)'};">Rs. ${balance.toLocaleString()}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                        <i class="fas fa-list"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Entries</span>
                        <span class="kpi-value" style="font-size: 1.2rem;">${allEntries.length}</span>
                    </div>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="filter-bar glass-card" style="margin-bottom: 16px;">
                <div class="filter-row">
                    <input type="text" class="form-input" placeholder="Search entries..." id="ledgerSearch" oninput="LedgerModule.filterEntries()" style="flex: 1;">
                    <input type="date" class="form-input" id="ledgerDateFrom" onchange="LedgerModule.filterEntries()">
                    <span class="filter-separator">to</span>
                    <input type="date" class="form-input" id="ledgerDateTo" onchange="LedgerModule.filterEntries()">
                    <select class="form-input form-select" id="ledgerTypeFilter" onchange="LedgerModule.filterEntries()">
                        <option value="all">All Types</option>
                        <option value="Invoice Accrual">Invoice Accrual</option>
                        <option value="Disbursed Payment">Disbursed Payment</option>
                    </select>
                    <button class="btn btn-secondary btn-sm" onclick="LedgerModule.resetFilters()">
                        <i class="fas fa-undo"></i> Reset
                    </button>
                </div>
            </div>

            <!-- Ledger Table -->
            <div class="data-table-container glass-card">
                <div class="table-wrapper">
                    <table class="data-table" id="ledgerTable">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Reference</th>
                                <th>Description</th>
                                <th>Credit</th>
                                <th>Debit</th>
                                <th>Balance</th>
                                <th>Source</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="ledgerTableBody">
                            ${allEntries.length === 0 ? `
                                <tr><td colspan="9" class="empty-state">
                                    <i class="fas fa-book-open"></i>
                                    <p>No ledger entries yet</p>
                                    <p style="font-size: 0.8rem; color: var(--text-tertiary);">Entries are auto-created from Sub Garments, Production, and Payments</p>
                                </td></tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
                <div class="table-footer">
                    <span class="table-count" id="ledgerCount">${allEntries.length} entries</span>
                </div>
            </div>
        `;

        if (allEntries.length > 0) {
            LedgerModule.renderLedgerRows(allEntries);
        }
    }

    static getAllAgentLedgers() {
        const agents = db.getCollection('subGarmentAgents');
        let allLedgers = [];
        agents.forEach(agent => {
            if (agent.ledgerEntries) {
                agent.ledgerEntries.forEach(entry => {
                    allLedgers.push({
                        ...entry,
                        source: `Agent: ${agent.name}`,
                        description: entry.description || `${entry.type} for ${agent.name}`
                    });
                });
            }
        });
        return allLedgers;
    }

    static renderLedgerRows(entries) {
        const tbody = document.getElementById('ledgerTableBody');
        if (!tbody) return;

        let runningBalance = 0;
        
        // Sort by date ascending for running balance
        const sorted = [...entries].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        // Calculate running balances
        const withBalances = sorted.map(e => {
            const isCredit = e.type === 'Invoice Accrual';
            const amount = e.amount || e.credit || e.debit || 0;
            if (isCredit) runningBalance += amount;
            else runningBalance -= amount;
            return { ...e, balance: runningBalance };
        });

        // Sort back to descending for display
        withBalances.reverse();

        tbody.innerHTML = withBalances.map(entry => {
            const isCredit = entry.type === 'Invoice Accrual';
            const amount = entry.amount || 0;
            
            return `
                <tr>
                    <td>${entry.date ? new Date(entry.date).toLocaleDateString() : '-'}</td>
                    <td>
                        <span class="status-badge ${isCredit ? 'pending' : 'active'}" style="font-size: 0.7rem;">
                            ${entry.type || 'Entry'}
                        </span>
                    </td>
                    <td style="font-weight: 500;">${entry.reference || '-'}</td>
                    <td>${entry.description || '-'}</td>
                    <td style="color: var(--warning-color); font-weight: 600;">
                        ${isCredit ? 'Rs. ' + amount.toLocaleString() : '-'}
                    </td>
                    <td style="color: var(--success-color); font-weight: 600;">
                        ${!isCredit ? 'Rs. ' + amount.toLocaleString() : '-'}
                    </td>
                    <td style="font-weight: 700; color: ${entry.balance >= 0 ? 'var(--text-primary)' : 'var(--danger-color)'};">
                        Rs. ${entry.balance.toLocaleString()}
                    </td>
                    <td style="font-size: 0.8rem; color: var(--text-tertiary);">${entry.source || 'Direct'}</td>
                    <td class="actions-cell">
                        <button class="btn-icon-sm btn-view" onclick="LedgerModule.viewEntry('${entry.id}')"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon-sm btn-edit" onclick="LedgerModule.editEntry('${entry.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon-sm btn-delete" onclick="LedgerModule.deleteEntry('${entry.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');

        document.getElementById('ledgerCount').textContent = `${entries.length} entries`;
    }

    static showAddEntry() {
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-plus-circle"></i> Add Ledger Entry</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="ledgerEntryForm" onsubmit="LedgerModule.saveEntry(event)">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Date</label>
                            <input type="date" class="form-input" name="date" value="${new Date().toISOString().split('T')[0]}" required>
                        </div>
                        <div class="form-group">
                            <label>Type</label>
                            <select class="form-input form-select" name="type" required>
                                <option value="Invoice Accrual">Invoice Accrual (Credit)</option>
                                <option value="Disbursed Payment">Disbursed Payment (Debit)</option>
                                <option value="Journal Entry">Journal Entry</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Reference No</label>
                            <input type="text" class="form-input" name="reference" placeholder="Invoice/Receipt No">
                        </div>
                        <div class="form-group">
                            <label>Amount (Rs.)</label>
                            <input type="number" class="form-input" name="amount" min="0" step="0.01" required>
                        </div>
                        <div class="form-group full-width">
                            <label>Description</label>
                            <textarea class="form-input" name="description" rows="2" placeholder="Entry description..."></textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary" type="submit" form="ledgerEntryForm">Save Entry</button>
            </div>
        `;

        overlay.classList.add('active');
        overlay.style.display = 'flex';
    }

    static saveEntry(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const entry = {
            date: formData.get('date'),
            type: formData.get('type'),
            reference: formData.get('reference'),
            amount: parseFloat(formData.get('amount')) || 0,
            description: formData.get('description'),
            source: 'Manual Entry'
        };
        
        db.addItem('ledger', entry);
        app.showToast('Ledger entry saved!', 'success');
        app.closeModal();
        
        const container = document.getElementById('moduleContainer');
        if (container) LedgerModule.render(container);
    }

    static autoCreateEntry(source, data) {
        const entry = {
            date: new Date().toISOString().split('T')[0],
            type: 'Invoice Accrual',
            reference: data.badgeId || data.invoiceNo || 'AUTO',
            amount: data.totalCost || data.grossBill || 0,
            description: `Auto-entry from ${source}: ${data.badgeId || data.invoiceNo || ''}`,
            source: source
        };
        
        db.addItem('ledger', entry);
        console.log('📒 Auto ledger entry created from', source);
    }

    static viewEntry(id) {
        const entry = db.getItem('ledger', id);
        if (entry) {
            app.viewItem('ledger', id);
        } else {
            // Check agent ledgers
            const agents = db.getCollection('subGarmentAgents');
            for (const agent of agents) {
                const found = (agent.ledgerEntries || []).find(e => e.id === id);
                if (found) {
                    alert(JSON.stringify(found, null, 2));
                    return;
                }
            }
            app.showToast('Entry not found', 'error');
        }
    }

    static editEntry(id) {
        app.editItem('ledger', id);
    }

    static deleteEntry(id) {
        app.showConfirm('Delete Entry', 'Delete this ledger entry?', () => {
            db.deleteItem('ledger', id);
            app.showToast('Entry deleted', 'success');
            const container = document.getElementById('moduleContainer');
            if (container) LedgerModule.render(container);
        });
    }

    static filterEntries() {
        const search = document.getElementById('ledgerSearch')?.value?.toLowerCase() || '';
        const dateFrom = document.getElementById('ledgerDateFrom')?.value;
        const dateTo = document.getElementById('ledgerDateTo')?.value;
        const typeFilter = document.getElementById('ledgerTypeFilter')?.value;

        const ledgerEntries = db.getCollection('ledger');
        const agentLedgers = LedgerModule.getAllAgentLedgers();
        let allEntries = [...ledgerEntries, ...agentLedgers];

        if (search) {
            allEntries = allEntries.filter(e => JSON.stringify(e).toLowerCase().includes(search));
        }
        if (dateFrom) {
            allEntries = allEntries.filter(e => new Date(e.date || e.createdAt) >= new Date(dateFrom));
        }
        if (dateTo) {
            allEntries = allEntries.filter(e => new Date(e.date || e.createdAt) <= new Date(dateTo));
        }
        if (typeFilter && typeFilter !== 'all') {
            allEntries = allEntries.filter(e => e.type === typeFilter);
        }

        LedgerModule.renderLedgerRows(allEntries);
    }

    static resetFilters() {
        document.getElementById('ledgerSearch').value = '';
        document.getElementById('ledgerDateFrom').value = '';
        document.getElementById('ledgerDateTo').value = '';
        document.getElementById('ledgerTypeFilter').value = 'all';
        
        const container = document.getElementById('moduleContainer');
        if (container) LedgerModule.render(container);
    }

    static exportLedger() {
        const ledgerEntries = db.getCollection('ledger');
        const agentLedgers = LedgerModule.getAllAgentLedgers();
        const allEntries = [...ledgerEntries, ...agentLedgers];

        if (allEntries.length === 0) {
            app.showToast('No data to export', 'warning');
            return;
        }

        try {
            const exportData = allEntries.map(e => ({
                'Date': e.date || '',
                'Type': e.type || '',
                'Reference': e.reference || '',
                'Description': e.description || '',
                'Amount': e.amount || 0,
                'Source': e.source || 'Direct'
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Ledger');
            XLSX.writeFile(wb, `Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
            app.showToast('Ledger exported!', 'success');
        } catch(e) {
            app.showToast('Export failed', 'error');
        }
    }
}
