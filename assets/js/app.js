/**
 * Hummingbird Clothing ERP - Main Application v3.0
 * ALL FIXES: Modals, Theme, Navigation, Generic CRUD
 */

console.log('🔄 app.js loading...');

class HummingbirdERP {
    constructor() {
        console.log('🏗️ Constructor called');
        
        this.currentModule = 'dashboard';
        this.modules = [
            'dashboard', 'customers', 'suppliers', 'inventory',
            'fabric', 'accessories', 'sub-garments', 'production',
            'finishing', 'payments', 'ledger', 'expenses',
            'cheques', 'staff', 'reports', 'settings'
        ];
        
        this.isMobile = false;
        this.touchStartX = 0;
        this._confirmCallback = null;
        
        this.init();
    }

    init() {
        console.log('🚀 Init started');
        
        this.loadSettings();
        this.setupSidebarNavigation();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.updateDateTime();
        this.setupAutoSave();
        
        setTimeout(() => this.navigateTo('dashboard'), 300);
        console.log('✅ Init complete');
    }

    // ==========================================
    // SETTINGS & THEME
    // ==========================================
    
    loadSettings() {
        try {
            const settings = db.getSettings();
            document.documentElement.setAttribute('data-theme', settings.theme || 'light');
            document.documentElement.setAttribute('data-accent', settings.accent || 'blue');
            
            document.querySelectorAll('.btn-theme').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-theme') === (settings.theme || 'light')) {
                    btn.classList.add('active');
                }
            });
        } catch(e) {
            console.error('loadSettings error:', e);
        }
    }

    switchTheme(theme) {
        console.log('🎨 switchTheme:', theme);
        document.documentElement.setAttribute('data-theme', theme);
        
        try { db.updateSettings({ theme: theme }); } catch(e) {}
        localStorage.setItem('hummingbird_theme', theme);
        
        document.querySelectorAll('.btn-theme').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-theme') === theme) btn.classList.add('active');
        });
        
        this.showToast(`Theme: ${theme} mode`, 'success');
    }

    // ==========================================
    // SIDEBAR NAVIGATION
    // ==========================================
    
    setupSidebarNavigation() {
        const sidebarNav = document.querySelector('.sidebar-nav');
        if (!sidebarNav) {
            console.error('❌ .sidebar-nav not found!');
            return;
        }

        sidebarNav.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const navModule = link.getAttribute('data-nav');
            
            if (link.classList.contains('submenu-toggle')) {
                e.preventDefault();
                e.stopPropagation();
                const navItem = link.closest('.has-submenu');
                if (navItem) navItem.classList.toggle('open');
                return;
            }

            if (navModule) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Sidebar →', navModule);
                this.navigateTo(navModule);
            }
        });

        console.log('✅ Sidebar ready');
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    
    setupEventListeners() {
        // Hamburger menu
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.onclick = (e) => {
                e.preventDefault();
                const sidebar = document.getElementById('sidebar');
                if (sidebar) sidebar.classList.toggle('collapsed');
            };
        }

        // Sidebar collapse
        const sidebarCollapse = document.getElementById('sidebarCollapse');
        if (sidebarCollapse) {
            sidebarCollapse.onclick = (e) => {
                e.preventDefault();
                const sidebar = document.getElementById('sidebar');
                if (sidebar) sidebar.classList.toggle('collapsed');
            };
        }

        // Theme buttons (sun/moon)
        document.querySelectorAll('.btn-theme').forEach((btn) => {
            btn.onclick = (e) => {
                e.preventDefault();
                const theme = btn.getAttribute('data-theme');
                this.switchTheme(theme);
            };
        });

        // Settings gear in footer
        const btnSettings = document.querySelector('.btn-settings');
        if (btnSettings) {
            btnSettings.onclick = (e) => {
                e.preventDefault();
                this.navigateTo('settings');
            };
        }

        // Global search
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.onkeydown = (e) => {
                if (e.key === 'Enter') this.globalSearch(globalSearch.value);
            };
        }
    }

    // ==========================================
    // NAVIGATION
    // ==========================================
    
    navigateTo(moduleName) {
        console.log('🧭 navigateTo:', moduleName);
        
        if (!this.modules.includes(moduleName)) {
            console.error('❌ Module not found:', moduleName);
            return;
        }

        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const navItem = document.querySelector(`[data-module="${moduleName}"]`);
        if (navItem) navItem.classList.add('active');

        const title = moduleName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = title;
        document.title = `Hummingbird ERP - ${title}`;

        this.currentModule = moduleName;
        this.loadModule(moduleName);
    }

    // ==========================================
    // MODULE LOADING
    // ==========================================
    
    loadModule(moduleName) {
        console.log('📦 loadModule:', moduleName);
        
        const container = document.getElementById('moduleContainer');
        if (!container) return;
        
        container.style.opacity = '0';
        
        setTimeout(() => {
            try {
                switch(moduleName) {
                    case 'dashboard':
                        if (typeof DashboardModule !== 'undefined') DashboardModule.render(container);
                        else this.renderGenericModule(container, moduleName);
                        break;
                    case 'sub-garments':
                        if (typeof SubGarmentsModule !== 'undefined') SubGarmentsModule.render(container);
                        else this.renderGenericModule(container, moduleName);
                        break;
                    case 'production':
                        if (typeof ProductionModule !== 'undefined') ProductionModule.render(container);
                        else this.renderGenericModule(container, moduleName);
                        break;
                    case 'finishing':
                        if (typeof FinishingModule !== 'undefined') FinishingModule.render(container);
                        else this.renderGenericModule(container, moduleName);
                        break;
                    case 'payments':
                        if (typeof PaymentsModule !== 'undefined') PaymentsModule.render(container);
                        else this.renderGenericModule(container, moduleName);
                        break;
                    case 'ledger':
                        if (typeof LedgerModule !== 'undefined') LedgerModule.render(container);
                        else this.renderGenericModule(container, moduleName);
                        break;
                    case 'inventory':
                        if (typeof InventoryModule !== 'undefined') InventoryModule.render(container);
                        else this.renderGenericModule(container, moduleName);
                        break;
                    case 'expenses':
                        if (typeof ExpensesModule !== 'undefined') ExpensesModule.render(container);
                        else this.renderGenericModule(container, moduleName);
                        break;
                    case 'cheques':
                        if (typeof ChequesModule !== 'undefined') ChequesModule.render(container);
                        else this.renderGenericModule(container, moduleName);
                        break;
                    case 'staff':
                        if (typeof StaffModule !== 'undefined') StaffModule.render(container);
                        else this.renderGenericModule(container, moduleName);
                        break;
                    case 'reports':
                        if (typeof ReportsModule !== 'undefined') ReportsModule.render(container);
                        else this.renderGenericModule(container, moduleName);
                        break;
                    case 'settings':
                        if (typeof SettingsModule !== 'undefined') SettingsModule.render(container);
                        else this.renderGenericModule(container, moduleName);
                        break;
                    default:
                        this.renderGenericModule(container, moduleName);
                }
            } catch (error) {
                console.error('❌ Error:', error);
                container.innerHTML = `
                    <div class="glass-card" style="padding:40px;text-align:center;">
                        <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:var(--danger-color);"></i>
                        <h3>Error Loading ${moduleName}</h3>
                        <p style="color:var(--text-tertiary);">${error.message}</p>
                        <button class="btn btn-primary btn-lift" onclick="app.navigateTo('dashboard')">
                            <i class="fas fa-home"></i> Go to Dashboard
                        </button>
                    </div>
                `;
            }
            
            container.style.opacity = '1';
        }, 150);
    }

    // ==========================================
    // GENERIC MODULE (FOR SIMPLE CRUD)
    // ==========================================
    
    renderGenericModule(container, moduleName) {
        const title = moduleName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const items = db.getCollection(moduleName);
        
        container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">${title} Management</h2>
                <div class="module-actions">
                    <button class="btn btn-primary btn-lift btn-glow" id="btnAdd${moduleName}">
                        <i class="fas fa-plus"></i> Add New
                    </button>
                </div>
            </div>

            <div class="data-table-container glass-card">
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead><tr id="${moduleName}TableHead"></tr></thead>
                        <tbody id="${moduleName}TableBody">
                            ${items.length === 0 ? `
                                <tr><td colspan="10" class="empty-state">
                                    <i class="fas fa-inbox"></i>
                                    <p>No records found</p>
                                    <button class="btn btn-primary btn-sm" id="btnAddEmpty${moduleName}">
                                        <i class="fas fa-plus"></i> Add First Record
                                    </button>
                                </td></tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
                <div class="table-footer">
                    <span class="table-count">${items.length} records</span>
                </div>
            </div>
        `;

        // Add event listeners to the buttons
        setTimeout(() => {
            const btnAdd = document.getElementById(`btnAdd${moduleName}`);
            const btnAddEmpty = document.getElementById(`btnAddEmpty${moduleName}`);
            
            if (btnAdd) {
                btnAdd.onclick = () => this.showGenericForm(moduleName);
            }
            if (btnAddEmpty) {
                btnAddEmpty.onclick = () => this.showGenericForm(moduleName);
            }
        }, 100);

        // Render table if items exist
        if (items.length > 0) {
            this.renderGenericTable(moduleName, items);
        }
    }

    renderGenericTable(collection, items) {
        const tableHead = document.getElementById(`${collection}TableHead`);
        const tableBody = document.getElementById(`${collection}TableBody`);
        if (!tableHead || !tableBody) return;

        const headers = Object.keys(items[0]).filter(k => k !== 'id' && k !== 'updatedAt');
        
        tableHead.innerHTML = `
            <th>#</th>
            ${headers.map(h => `<th>${h.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</th>`).join('')}
            <th>Actions</th>
        `;

        tableBody.innerHTML = items.map((item, i) => `
            <tr>
                <td>${i + 1}</td>
                ${headers.map(h => `<td>${this.formatCellValue(item[h])}</td>`).join('')}
                <td class="actions-cell">
                    <button class="btn-icon-sm btn-view" data-action="view" data-collection="${collection}" data-id="${item.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon-sm btn-edit" data-action="edit" data-collection="${collection}" data-id="${item.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon-sm btn-delete" data-action="delete" data-collection="${collection}" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Add event listeners to action buttons
        tableBody.querySelectorAll('button').forEach(btn => {
            btn.onclick = () => {
                const action = btn.getAttribute('data-action');
                const coll = btn.getAttribute('data-collection');
                const id = btn.getAttribute('data-id');
                
                if (action === 'view') this.viewItem(coll, id);
                else if (action === 'edit') this.showGenericForm(coll, id);
                else if (action === 'delete') this.deleteItem(coll, id);
            };
        });
    }

    formatCellValue(value) {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? '✓' : '✗';
        if (typeof value === 'object') return JSON.stringify(value).substring(0, 50);
        return String(value);
    }

    // ==========================================
    // GENERIC FORM MODAL (FIXED)
    // ==========================================
    
    showGenericForm(collection, editId = null) {
        const item = editId ? db.getItem(collection, editId) : null;
        const title = collection.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        if (!overlay || !container) {
            console.error('❌ Modal elements not found!');
            return;
        }

        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-${editId ? 'edit' : 'plus-circle'}"></i> ${editId ? 'Edit' : 'Add New'} ${title}</h3>
                <button class="btn-close" id="btnCloseModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="genericForm">
                    <div class="form-grid">
                        ${editId ? 
                            Object.keys(item).filter(k => !['id','createdAt','updatedAt'].includes(k)).map(k => {
                                const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                                const val = item[k] || '';
                                return `
                                    <div class="form-group ${k.length > 20 ? 'full-width' : ''}">
                                        <label>${label}</label>
                                        <input type="${k.includes('date') ? 'date' : k.includes('email') ? 'email' : k.includes('amount') || k.includes('cost') || k.includes('salary') ? 'number' : 'text'}" 
                                               class="form-input" name="${k}" value="${val}" ${k === 'name' ? 'required' : ''}>
                                    </div>
                                `;
                            }).join('')
                            : `
                                <div class="form-group">
                                    <label>Name <span class="required">*</span></label>
                                    <input type="text" class="form-input" name="name" required>
                                </div>
                                <div class="form-group">
                                    <label>Phone</label>
                                    <input type="text" class="form-input" name="phone">
                                </div>
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" class="form-input" name="email">
                                </div>
                                <div class="form-group full-width">
                                    <label>Address</label>
                                    <input type="text" class="form-input" name="address">
                                </div>
                                <div class="form-group full-width">
                                    <label>Notes</label>
                                    <textarea class="form-input" name="notes" rows="2"></textarea>
                                </div>
                            `
                        }
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary btn-lift" id="btnCancelModal">Cancel</button>
                <button class="btn btn-primary btn-lift btn-glow" id="btnSubmitForm">
                    <i class="fas fa-save"></i> ${editId ? 'Update' : 'Save'}
                </button>
            </div>
        `;

        // Show modal
        overlay.classList.add('active');
        overlay.style.display = 'flex';

        // Close button
        document.getElementById('btnCloseModal').onclick = () => this.closeModal();
        
        // Cancel button
        document.getElementById('btnCancelModal').onclick = () => this.closeModal();
        
        // Click outside to close
        overlay.onclick = (e) => {
            if (e.target === overlay) this.closeModal();
        };
        
        // Submit button
        document.getElementById('btnSubmitForm').onclick = () => {
            const form = document.getElementById('genericForm');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Convert number fields
            Object.keys(data).forEach(key => {
                if (!isNaN(data[key]) && data[key] !== '') {
                    data[key] = parseFloat(data[key]);
                }
            });

            if (editId) {
                db.updateItem(collection, editId, data);
                this.showToast('Record updated!', 'success');
            } else {
                db.addItem(collection, data);
                this.showToast('Record added!', 'success');
            }

            this.closeModal();
            this.navigateTo(collection);
        };

        // Escape key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // ==========================================
    // MODAL CONTROLS (FIXED)
    // ==========================================
    
    closeModal() {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.style.display = 'none';
            overlay.onclick = null;
        }
    }

    viewItem(collection, id) {
        const item = db.getItem(collection, id);
        if (!item) {
            this.showToast('Record not found', 'error');
            return;
        }

        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        if (!overlay || !container) return;

        const excludeKeys = ['id', 'updatedAt'];
        const details = Object.keys(item)
            .filter(k => !excludeKeys.includes(k))
            .map(k => {
                let val = item[k];
                if (typeof val === 'object') val = JSON.stringify(val, null, 2);
                if (k === 'createdAt') val = new Date(val).toLocaleString();
                return { key: k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()), value: val };
            });

        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-eye"></i> View Record</h3>
                <button class="btn-close" id="btnCloseView"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <table style="width:100%; border-collapse: collapse;">
                    ${details.map(d => `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 10px 16px; font-weight: 600; color: var(--text-secondary); width: 40%;">${d.key}</td>
                            <td style="padding: 10px 16px;">${d.value || '-'}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="btnCloseView2">Close</button>
            </div>
        `;

        overlay.classList.add('active');
        overlay.style.display = 'flex';

        document.getElementById('btnCloseView').onclick = () => this.closeModal();
        document.getElementById('btnCloseView2').onclick = () => this.closeModal();
        overlay.onclick = (e) => { if (e.target === overlay) this.closeModal(); };
    }

    deleteItem(collection, id) {
        this.showConfirm('Delete Record', 'Are you sure? This cannot be undone.', () => {
            db.deleteItem(collection, id);
            this.showToast('Record deleted!', 'success');
            this.navigateTo(collection);
        });
    }

    // ==========================================
    // CONFIRM DIALOG (FIXED)
    // ==========================================
    
    showConfirm(title, message, callback) {
        const overlay = document.getElementById('confirmOverlay');
        if (!overlay) return;

        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        
        overlay.style.display = 'flex';
        overlay.classList.add('active');
        
        this._confirmCallback = callback;

        // Close on Escape
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeConfirm();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    closeConfirm() {
        const overlay = document.getElementById('confirmOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.style.display = 'none';
        }
        this._confirmCallback = null;
    }

    executeConfirm() {
        if (this._confirmCallback) {
            this._confirmCallback();
        }
        this.closeConfirm();
    }

    // ==========================================
    // TOAST
    // ==========================================
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const icons = { 
            success: 'fa-check-circle', 
            error: 'fa-exclamation-circle', 
            warning: 'fa-exclamation-triangle', 
            info: 'fa-info-circle' 
        };
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
        }, 3000);
    }

    // ==========================================
    // UTILS
    // ==========================================
    
    globalSearch(query) {
        if (!query) return;
        this.showToast(`Searching: ${query}`, 'info');
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('globalSearch')?.focus();
            }
        });
    }

    backupData() {
        try { db.backup(); this.showToast('Backup created!', 'success'); } 
        catch(e) { this.showToast('Backup failed', 'error'); }
    }

    restoreData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            try {
                await db.restore(e.target.files[0]);
                this.showToast('Restored! Reloading...', 'success');
                setTimeout(() => location.reload(), 1000);
            } catch(e) { this.showToast('Restore failed', 'error'); }
        };
        input.click();
    }

    saveCurrentModule() {}
    setupAutoSave() { setInterval(() => this.saveCurrentModule(), 30000); }

    updateDateTime() {
        const el = document.getElementById('currentDate');
        if (el) {
            el.textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        }
        setTimeout(() => this.updateDateTime(), 60000);
    }
}

// ==========================================
// INIT
// ==========================================

let app;

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loading = document.getElementById('app-loading');
        const appContainer = document.getElementById('appContainer');
        
        if (loading) loading.classList.add('hidden');
        if (appContainer) appContainer.style.display = 'flex';
        
        try {
            window.app = new HummingbirdERP();
            console.log('✅✅✅ ERP READY ✅✅✅');
            console.log('📋 All modules available');
            console.log('💡 Click sidebar to navigate');
            console.log('🔘 "Add New" buttons work in all modules');
        } catch(e) {
            console.error('❌ Init failed:', e);
            const mc = document.getElementById('moduleContainer');
            if (mc) mc.innerHTML = `<div style="padding:40px;text-align:center;"><h3>Error</h3><p>${e.message}</p><button onclick="location.reload()">Reload</button></div>`;
        }
        
        if (loading) setTimeout(() => loading.remove(), 300);
    }, 500);
});

console.log('✅ app.js loaded');
