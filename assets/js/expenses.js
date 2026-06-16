/**
 * Hummingbird ERP - Expenses Module
 * Track all business expenses with categories
 */

class ExpensesModule {
    static render(container) {
        const expenses = db.getCollection('expenses');
        
        // Calculate totals
        const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        const thisMonth = expenses.filter(e => {
            const d = new Date(e.date || e.createdAt);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const thisMonthTotal = thisMonth.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        
        // Categories
        const categories = [...new Set(expenses.map(e => e.category || 'Uncategorized'))];

        container.innerHTML = `
            <div class="module-header">
                <div>
                    <h2 class="module-title">Expenses Management</h2>
                    <p class="module-subtitle">Track all business expenses and costs</p>
                </div>
                <div class="module-actions">
                    <button class="btn btn-secondary btn-lift" onclick="ExpensesModule.exportExpenses()">
                        <i class="fas fa-file-export"></i> Export Excel
                    </button>
                    <button class="btn btn-primary btn-lift btn-glow" onclick="ExpensesModule.showAddForm()">
                        <i class="fas fa-plus"></i> Add Expense
                    </button>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="kpi-grid" style="margin-bottom: var(--spacing-lg);">
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Expenses</span>
                        <span class="kpi-value" style="font-size: 1.1rem;">Rs. ${totalExpenses.toLocaleString()}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">This Month</span>
                        <span class="kpi-value" style="font-size: 1.1rem;">Rs. ${thisMonthTotal.toLocaleString()}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                        <i class="fas fa-list"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Entries</span>
                        <span class="kpi-value">${expenses.length}</span>
                    </div>
                </div>
                <div class="kpi-card glass-card">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                        <i class="fas fa-tags"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Categories</span>
                        <span class="kpi-value">${categories.length}</span>
                    </div>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="filter-bar glass-card" style="margin-bottom: 16px;">
                <div class="filter-row">
                    <input type="text" class="form-input" placeholder="Search expenses..." id="expenseSearch" oninput="ExpensesModule.filterExpenses()" style="flex: 1;">
                    <input type="date" class="form-input" id="expenseDateFrom" onchange="ExpensesModule.filterExpenses()">
                    <span class="filter-separator">to</span>
                    <input type="date" class="form-input" id="expenseDateTo" onchange="ExpensesModule.filterExpenses()">
                    <select class="form-input form-select" id="expenseCategoryFilter" onchange="ExpensesModule.filterExpenses()">
                        <option value="all">All Categories</option>
                        ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <button class="btn btn-secondary btn-sm" onclick="ExpensesModule.resetFilters()">
                        <i class="fas fa-undo"></i> Reset
                    </button>
                </div>
            </div>

            <!-- Data Table -->
            <div class="data-table-container glass-card">
                <div class="table-wrapper">
                    <table class="data-table" id="expensesTable">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                                <th>Reference</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="expensesTableBody">
                            ${expenses.length === 0 ? `
                                <tr><td colspan="8" class="empty-state">
                                    <i class="fas fa-receipt"></i>
                                    <p>No expenses recorded yet</p>
                                </td></tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
                <div class="table-footer">
                    <span class="table-count" id="expensesCount">${expenses.length} expenses</span>
                    <div style="font-weight: 700; color: var(--danger-color);">Total: Rs. ${totalExpenses.toLocaleString()}</div>
                </div>
            </div>
        `;

        if (expenses.length > 0) {
            ExpensesModule.renderExpenseRows(expenses);
        }
    }

    static renderExpenseRows(expenses) {
        const tbody = document.getElementById('expensesTableBody');
        if (!tbody) return;

        tbody.innerHTML = expenses.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).map(expense => `
            <tr>
                <td>${expense.date ? new Date(expense.date).toLocaleDateString() : '-'}</td>
                <td><span class="status-badge draft">${expense.category || 'Uncategorized'}</span></td>
                <td>${expense.description || '-'}</td>
                <td style="font-weight: 700; color: var(--danger-color);">Rs. ${(parseFloat(expense.amount) || 0).toLocaleString()}</td>
                <td>${expense.paymentMethod || 'Cash'}</td>
                <td>${expense.reference || '-'}</td>
                <td><span class="status-badge ${expense.status === 'paid' ? 'active' : 'pending'}">${expense.status || 'Pending'}</span></td>
                <td class="actions-cell">
                    <button class="btn-icon-sm btn-view" onclick="ExpensesModule.viewExpense('${expense.id}')"><i class="fas fa-eye"></i></button>
                    <button class="btn-icon-sm btn-edit" onclick="ExpensesModule.editExpense('${expense.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon-sm btn-pdf" onclick="ExpensesModule.printExpense('${expense.id}')"><i class="fas fa-file-pdf"></i></button>
                    <button class="btn-icon-sm btn-delete" onclick="app.deleteItem('expenses','${expense.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');

        document.getElementById('expensesCount').textContent = `${expenses.length} expenses`;
    }

    static showAddForm(editId = null) {
        const expense = editId ? db.getItem('expenses', editId) : null;
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-${editId ? 'edit' : 'plus-circle'}"></i> ${editId ? 'Edit' : 'Add'} Expense</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="expenseForm" onsubmit="ExpensesModule.saveExpense(event, '${editId || ''}')">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Date <span class="required">*</span></label>
                            <input type="date" class="form-input" name="date" value="${expense?.date || new Date().toISOString().split('T')[0]}" required>
                        </div>
                        <div class="form-group">
                            <label>Category <span class="required">*</span></label>
                            <select class="form-input form-select" name="category" required>
                                <option value="">Select Category</option>
                                ${['Raw Materials','Utilities','Rent','Salaries','Transport','Maintenance','Office Supplies','Marketing','Miscellaneous'].map(c => `
                                    <option value="${c}" ${expense?.category === c ? 'selected' : ''}>${c}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Amount (Rs.) <span class="required">*</span></label>
                            <div class="input-group">
                                <span class="input-group-addon">Rs.</span>
                                <input type="number" class="form-input" name="amount" value="${expense?.amount || ''}" min="0" step="0.01" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Payment Method</label>
                            <select class="form-input form-select" name="paymentMethod">
                                <option value="Cash" ${expense?.paymentMethod === 'Cash' ? 'selected' : ''}>Cash</option>
                                <option value="Cheque" ${expense?.paymentMethod === 'Cheque' ? 'selected' : ''}>Cheque</option>
                                <option value="Bank Transfer" ${expense?.paymentMethod === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
                                <option value="Credit Card" ${expense?.paymentMethod === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Reference No</label>
                            <input type="text" class="form-input" name="reference" value="${expense?.reference || ''}" placeholder="Bill/Receipt No">
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select class="form-input form-select" name="status">
                                <option value="paid" ${expense?.status === 'paid' ? 'selected' : ''}>Paid</option>
                                <option value="pending" ${expense?.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="cancelled" ${expense?.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                        <div class="form-group full-width">
                            <label>Description</label>
                            <textarea class="form-input" name="description" rows="2" placeholder="Expense details...">${expense?.description || ''}</textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary" type="submit" form="expenseForm">${editId ? 'Update' : 'Save'} Expense</button>
            </div>
        `;

        overlay.classList.add('active');
        overlay.style.display = 'flex';
    }

    static saveExpense(event, editId) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = {
            date: formData.get('date'),
            category: formData.get('category'),
            amount: parseFloat(formData.get('amount')) || 0,
            paymentMethod: formData.get('paymentMethod'),
            reference: formData.get('reference'),
            status: formData.get('status'),
            description: formData.get('description'),
        };

        if (editId) {
            db.updateItem('expenses', editId, data);
            app.showToast('Expense updated!', 'success');
        } else {
            const saved = db.addItem('expenses', data);
            
            // Auto-create ledger debit entry
            if (typeof LedgerModule !== 'undefined') {
                db.addItem('ledger', {
                    date: data.date,
                    type: 'Disbursed Payment',
                    reference: data.reference || 'EXP-' + saved.id.substring(0, 6),
                    amount: data.amount,
                    description: `Expense: ${data.category} - ${data.description || ''}`,
                    source: 'Expenses'
                });
            }
            
            app.showToast('Expense saved! Ledger entry created.', 'success');
        }

        app.closeModal();
        const container = document.getElementById('moduleContainer');
        if (container) ExpensesModule.render(container);
    }

    static viewExpense(id) {
        const expense = db.getItem('expenses', id);
        if (!expense) return;
        
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-eye"></i> Expense Details</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                        <strong>Date:</strong> <span>${expense.date ? new Date(expense.date).toLocaleDateString() : '-'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                        <strong>Category:</strong> <span>${expense.category || '-'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                        <strong>Amount:</strong> <span style="color: var(--danger-color); font-weight: 700;">Rs. ${(parseFloat(expense.amount) || 0).toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                        <strong>Payment Method:</strong> <span>${expense.paymentMethod || '-'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                        <strong>Status:</strong> <span class="status-badge ${expense.status === 'paid' ? 'active' : 'pending'}">${expense.status || 'Pending'}</span>
                    </div>
                    <div style="padding: 8px 0;">
                        <strong>Description:</strong>
                        <p style="margin-top: 4px; color: var(--text-secondary);">${expense.description || 'No description'}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
            </div>
        `;

        overlay.classList.add('active');
        overlay.style.display = 'flex';
    }

    static editExpense(id) {
        ExpensesModule.showAddForm(id);
    }

    static printExpense(id) {
        const expense = db.getItem('expenses', id);
        if (!expense) return;

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(16);
            doc.text('Expense Voucher', 105, 20, { align: 'center' });
            doc.setFontSize(10);
            doc.text(`Date: ${expense.date}`, 20, 35);
            doc.text(`Category: ${expense.category}`, 20, 42);
            doc.text(`Amount: Rs. ${(parseFloat(expense.amount) || 0).toLocaleString()}`, 20, 49);
            doc.text(`Description: ${expense.description || '-'}`, 20, 56);
            
            doc.save(`Expense_${expense.date}.pdf`);
            app.showToast('PDF generated!', 'success');
        } catch(e) {
            app.showToast('PDF failed', 'error');
        }
    }

    static filterExpenses() {
        const search = document.getElementById('expenseSearch')?.value?.toLowerCase() || '';
        const dateFrom = document.getElementById('expenseDateFrom')?.value;
        const dateTo = document.getElementById('expenseDateTo')?.value;
        const categoryFilter = document.getElementById('expenseCategoryFilter')?.value;

        let expenses = db.getCollection('expenses');

        if (search) expenses = expenses.filter(e => JSON.stringify(e).toLowerCase().includes(search));
        if (dateFrom) expenses = expenses.filter(e => new Date(e.date || e.createdAt) >= new Date(dateFrom));
        if (dateTo) expenses = expenses.filter(e => new Date(e.date || e.createdAt) <= new Date(dateTo));
        if (categoryFilter && categoryFilter !== 'all') expenses = expenses.filter(e => e.category === categoryFilter);

        ExpensesModule.renderExpenseRows(expenses);
    }

    static resetFilters() {
        document.getElementById('expenseSearch').value = '';
        document.getElementById('expenseDateFrom').value = '';
        document.getElementById('expenseDateTo').value = '';
        document.getElementById('expenseCategoryFilter').value = 'all';
        
        const container = document.getElementById('moduleContainer');
        if (container) ExpensesModule.render(container);
    }

    static exportExpenses() {
        const expenses = db.getCollection('expenses');
        if (expenses.length === 0) {
            app.showToast('No data to export', 'warning');
            return;
        }

        try {
            const exportData = expenses.map(e => ({
                'Date': e.date || '',
                'Category': e.category || '',
                'Description': e.description || '',
                'Amount': e.amount || 0,
                'Payment Method': e.paymentMethod || '',
                'Reference': e.reference || '',
                'Status': e.status || ''
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
            XLSX.writeFile(wb, `Expenses_${new Date().toISOString().split('T')[0]}.xlsx`);
            app.showToast('Expenses exported!', 'success');
        } catch(e) {
            app.showToast('Export failed', 'error');
        }
    }
}
