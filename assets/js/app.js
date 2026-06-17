/**
 * Hummingbird ERP - Central Application Core v3.0
 * Centralized: Modal • Notifications • Forms • Error Handling
 */
console.log('🔄 app.js loading...');

// ==========================================
// CENTRALIZED MODAL MANAGER
// ==========================================
const ModalManager = {
    _overlay: null,
    _container: null,
    _isOpen: false,

    init() {
        this._overlay = document.getElementById('modalOverlay');
        this._container = document.getElementById('modalContainer');
        if (this._overlay) {
            this._overlay.addEventListener('click', (e) => {
                if (e.target === this._overlay) this.close();
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this._isOpen) this.close();
        });
    },

    open(htmlContent) {
        if (!this._overlay || !this._container) return;
        this._container.innerHTML = htmlContent;
        this._overlay.classList.add('active');
        this._overlay.style.display = 'flex';
        this._isOpen = true;
        document.body.style.overflow = 'hidden';
    },

    close() {
        if (!this._overlay) return;
        this._overlay.classList.remove('active');
        this._overlay.style.display = 'none';
        this._container.innerHTML = '';
        this._isOpen = false;
        document.body.style.overflow = '';
    },

    isOpen() { return this._isOpen; }
};

// ==========================================
// CENTRALIZED TOAST MANAGER
// ==========================================
const ToastManager = {
    _container: null,

    init() {
        this._container = document.getElementById('toastContainer');
    },

    show(message, type) {
        type = type || 'info';
        if (!this._container) return;
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
        const toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i><span>' + message + '</span>';
        this._container.appendChild(toast);
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300);
        }, 3000);
    }
};

// ==========================================
// CENTRALIZED FORM HANDLER
// ==========================================
const FormHandler = {
    _submitting: false,

    submit(formElement, collection, editId, callback) {
        if (this._submitting) return;
        this._submitting = true;
        
        try {
            const formData = new FormData(formElement);
            const data = {};
            const textFields = ['phone','email','name','address','notes','description','reference','chequeNo','bank','payee','relatedTo','colour','colourName','style','item','invoiceNo','subInvoiceNo','linkedCutInvoice','sizes','type','category','paymentMethod','unit','status'];
            
            formData.forEach(function(value, key) {
                if (!isNaN(value) && value !== '' && textFields.indexOf(key) === -1) {
                    data[key] = parseFloat(value);
                } else {
                    data[key] = value;
                }
            });

            if (editId) {
                db.updateItem(collection, editId, data);
                ToastManager.show('Record updated!', 'success');
            } else {
                db.addItem(collection, data);
                ToastManager.show('Record added!', 'success');
            }

            ModalManager.close();
            if (callback) callback(data);
        } catch(e) {
            ToastManager.show('Error: ' + e.message, 'error');
        } finally {
            this._submitting = false;
        }
    },

    buildFields(item, editId) {
        if (editId && item) {
            const skipKeys = ['id','createdAt','updatedAt','deleted','deletedAt','history'];
            return Object.keys(item)
                .filter(function(k) { return skipKeys.indexOf(k) === -1; })
                .map(function(k) {
                    var label = k.replace(/([A-Z])/g, ' $1').replace(/^./, function(s) { return s.toUpperCase(); });
                    var val = item[k] !== undefined ? item[k] : '';
                    var type = 'text';
                    if (k.indexOf('date') !== -1) type = 'date';
                    else if (k.indexOf('email') !== -1) type = 'email';
                    else if (k.indexOf('amount') !== -1 || k.indexOf('cost') !== -1 || k.indexOf('salary') !== -1 || k.indexOf('price') !== -1 || k.indexOf('qty') !== -1 || k.indexOf('stock') !== -1) type = 'number';
                    return '<div class="form-group"><label>' + label + '</label><input type="' + type + '" class="form-input" name="' + k + '" value="' + val + '" ' + (k==='name'?'required':'') + '></div>';
                }).join('');
        }
        return '<div class="form-group"><label>Name <span class="required">*</span></label><input type="text" class="form-input" name="name" required></div><div class="form-group"><label>Phone</label><input type="text" class="form-input" name="phone"></div><div class="form-group"><label>Email</label><input type="email" class="form-input" name="email"></div><div class="form-group full-width"><label>Address</label><input type="text" class="form-input" name="address"></div><div class="form-group full-width"><label>Notes</label><textarea class="form-input" name="notes" rows="2"></textarea></div>';
    }
};

// ==========================================
// ERROR HANDLER
// ==========================================
const ErrorHandler = {
    handle: function(error, context) {
        console.error('❌ [' + (context || 'app') + ']', error);
        ToastManager.show('Error: ' + (error.message || 'Unknown error'), 'error');
    },

    renderFallback: function(container, moduleName, error) {
        container.innerHTML = '<div class="glass-card" style="padding:40px;text-align:center;"><i class="fas fa-exclamation-triangle" style="font-size:3rem;color:var(--danger-color);"></i><h3 style="margin-top:16px;">Error Loading ' + moduleName + '</h3><p style="color:var(--text-tertiary);">' + error.message + '</p><button class="btn btn-primary btn-lift" onclick="app.navigateTo(\'dashboard\')"><i class="fas fa-home"></i> Go to Dashboard</button></div>';
    }
};

// ==========================================
// HUMMINGBIRD ERP CLASS
// ==========================================
class HummingbirdERP {
    constructor() {
        this.currentModule = 'dashboard';
        this.modules = ['dashboard','customers','suppliers','inventory','fabric','accessories','sub-garments','production','finishing','payments','ledger','expenses','cheques','staff','reports','settings'];
        this.init();
    }

    init() {
        ModalManager.init();
        ToastManager.init();
        this.loadSettings();
        this.setupSidebarNavigation();
        this.setupTopbarEvents();
        this.setupKeyboardShortcuts();
        this.updateDateTime();
        setTimeout(() => this.navigateTo('dashboard'), 300);
        console.log('✅ ERP Core Ready');
    }

    loadSettings() {
        try {
            const settings = db.getSettings();
            document.documentElement.setAttribute('data-theme', settings.theme || 'light');
            document.documentElement.setAttribute('data-accent', settings.accent || 'blue');
            this.updateThemeButtons(settings.theme || 'light');
        } catch(e) { ErrorHandler.handle(e, 'loadSettings'); }
    }

    updateThemeButtons(theme) {
        document.querySelectorAll('.btn-theme').forEach(function(btn) {
            btn.classList.remove('active');
            if (btn.getAttribute('data-theme') === theme) btn.classList.add('active');
        });
    }

    switchTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try { db.updateSettings({ theme: theme }); } catch(e) {}
        localStorage.setItem('hummingbird_theme', theme);
        this.updateThemeButtons(theme);
        ToastManager.show('Theme: ' + theme + ' mode', 'success');
    }

    setupSidebarNavigation() {
        const nav = document.querySelector('.sidebar-nav');
        if (!nav) return;
        
        nav.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            const module = link.getAttribute('data-nav');
            
            // Submenu toggle
            if (link.classList.contains('submenu-toggle')) {
                e.preventDefault();
                e.stopPropagation();
                const item = link.closest('.has-submenu');
                if (item) item.classList.toggle('open');
                return;
            }
            
            // Navigate to module
            if (module) {
                e.preventDefault();
                e.stopPropagation();
                this.navigateTo(module);
            }
        });
    }

    setupTopbarEvents() {
        // Hamburger menu
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.onclick = () => {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) sidebar.classList.toggle('collapsed');
            };
        }
        
        // Sidebar collapse
        const sidebarCollapse = document.getElementById('sidebarCollapse');
        if (sidebarCollapse) {
            sidebarCollapse.onclick = () => {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) sidebar.classList.toggle('collapsed');
            };
        }

        // Theme buttons
        document.querySelectorAll('.btn-theme').forEach(function(btn) {
            btn.onclick = function(e) {
                e.preventDefault();
                if (window.app) window.app.switchTheme(btn.getAttribute('data-theme'));
            };
        });

        // Global search
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.onkeydown = function(e) {
                if (e.key === 'Enter' && window.app) window.app.globalSearch(globalSearch.value);
            };
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const gs = document.getElementById('globalSearch');
                if (gs) gs.focus();
            }
        });
    }

    navigateTo(moduleName) {
        if (this.modules.indexOf(moduleName) === -1) return;
        
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('active'); });
        const navItem = document.querySelector('[data-module="' + moduleName + '"]');
        if (navItem) navItem.classList.add('active');
        
        // Update title
        const title = moduleName.replace(/-/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = title;
        document.title = 'Hummingbird ERP - ' + title;
        
        this.currentModule = moduleName;
        this.loadModule(moduleName);
    }

    loadModule(moduleName) {
        const container = document.getElementById('moduleContainer');
        if (!container) return;
        container.style.opacity = '0';
        
        setTimeout(() => {
            try {
                const moduleMap = {
                    'dashboard': DashboardModule,
                    'sub-garments': SubGarmentsModule,
                    'production': ProductionModule,
                    'finishing': FinishingModule,
                    'payments': PaymentsModule,
                    'ledger': LedgerModule,
                    'inventory': InventoryModule,
                    'fabric': FabricModule,
                    'accessories': AccessoriesModule,
                    'expenses': ExpensesModule,
                    'cheques': ChequesModule,
                    'staff': StaffModule,
                    'reports': ReportsModule,
                    'settings': SettingsModule
                };
                
                const ModuleClass = moduleMap[moduleName];
                if (ModuleClass && typeof ModuleClass.render === 'function') {
                    ModuleClass.render(container);
                } else {
                    this.renderGenericModule(container, moduleName);
                }
            } catch(error) {
                ErrorHandler.renderFallback(container, moduleName, error);
            }
            container.style.opacity = '1';
        }, 100);
    }

    renderGenericModule(container, moduleName) {
        const title = moduleName.replace(/-/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
        const items = db.getActiveItems(moduleName);
        
        container.innerHTML = '<div class="module-header"><h2 class="module-title">' + title + ' Management</h2><button class="btn btn-primary btn-lift btn-glow" id="btnAdd_' + moduleName + '"><i class="fas fa-plus"></i> Add New</button></div><div class="data-table-container glass-card"><div class="table-wrapper"><table class="data-table"><thead><tr id="' + moduleName + '_head"></tr></thead><tbody id="' + moduleName + '_body">' + (items.length === 0 ? '<tr><td colspan="10" class="empty-state"><i class="fas fa-inbox"></i><p>No records</p><button class="btn btn-primary btn-sm" id="btnEmpty_' + moduleName + '"><i class="fas fa-plus"></i> Add First</button></td></tr>' : '') + '</tbody></table></div><div class="table-footer"><span class="table-count">' + items.length + ' records</span></div></div>';

        setTimeout(() => {
            const btnAdd = document.getElementById('btnAdd_' + moduleName);
            const btnEmpty = document.getElementById('btnEmpty_' + moduleName);
            if (btnAdd) btnAdd.onclick = () => this.showGenericForm(moduleName);
            if (btnEmpty) btnEmpty.onclick = () => this.showGenericForm(moduleName);
        }, 100);

        if (items.length > 0) this.renderGenericTable(moduleName, items);
    }

    renderGenericTable(collection, items) {
        const head = document.getElementById(collection + '_head');
        const body = document.getElementById(collection + '_body');
        if (!head || !body) return;
        
        const skipKeys = ['id','updatedAt','deleted','deletedAt','history'];
        const headers = Object.keys(items[0]).filter(function(k) { return skipKeys.indexOf(k) === -1; });
        
        head.innerHTML = '<th>#</th>' + headers.map(function(h) { return '<th>' + h.replace(/([A-Z])/g, ' $1').replace(/^./, function(s) { return s.toUpperCase(); }) + '</th>'; }).join('') + '<th>Actions</th>';
        
        body.innerHTML = items.map(function(item, i) {
            return '<tr><td>' + (i+1) + '</td>' + headers.map(function(h) { return '<td>' + this.fmt(item[h]) + '</td>'; }.bind(this)).join('') + '<td class="actions-cell"><button class="btn-icon-sm btn-view" onclick="app.viewItem(\'' + collection + '\',\'' + item.id + '\')"><i class="fas fa-eye"></i></button><button class="btn-icon-sm btn-edit" onclick="app.showGenericForm(\'' + collection + '\',\'' + item.id + '\')"><i class="fas fa-edit"></i></button><button class="btn-icon-sm btn-delete" onclick="app.deleteRecord(\'' + collection + '\',\'' + item.id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
        }.bind(this)).join('');
    }

    fmt(value) {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? '✓' : '✗';
        if (typeof value === 'object') return JSON.stringify(value).substring(0, 40);
        return String(value);
    }

    showGenericForm(collection, editId) {
        editId = editId || null;
        const item = editId ? db.getItem(collection, editId) : null;
        const title = collection.replace(/-/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
        
        const html = '<div class="modal-header"><h3><i class="fas fa-' + (editId ? 'edit' : 'plus-circle') + '"></i> ' + (editId ? 'Edit' : 'Add') + ' ' + title + '</h3><button class="btn-close" onclick="ModalManager.close()"><i class="fas fa-times"></i></button></div><div class="modal-body"><form id="genForm" onsubmit="return false;"><div class="form-grid">' + FormHandler.buildFields(item, editId) + '</div></form></div><div class="modal-footer"><button class="btn btn-secondary btn-lift" onclick="ModalManager.close()">Cancel</button><button class="btn btn-primary btn-lift btn-glow" id="btnSubmitGen"><i class="fas fa-save"></i> ' + (editId ? 'Update' : 'Save') + '</button></div>';
        
        ModalManager.open(html);
        
        document.getElementById('btnSubmitGen').onclick = () => {
            const form = document.getElementById('genForm');
            FormHandler.submit(form, collection, editId, () => this.navigateTo(collection));
        };
    }

    viewItem(collection, id) {
        const item = db.getItem(collection, id);
        if (!item) { ToastManager.show('Not found', 'error'); return; }
        
        const skipKeys = ['id','updatedAt','deleted','deletedAt','history'];
        const details = Object.keys(item).filter(function(k) { return skipKeys.indexOf(k) === -1; }).map(function(k) {
            var val = item[k];
            if (typeof val === 'object') val = JSON.stringify(val, null, 2);
            if (k === 'createdAt') val = new Date(val).toLocaleString();
            return { key: k.replace(/([A-Z])/g, ' $1').replace(/^./, function(s) { return s.toUpperCase(); }), value: val };
        });

        ModalManager.open('<div class="modal-header"><h3><i class="fas fa-eye"></i> View Record</h3><button class="btn-close" onclick="ModalManager.close()"><i class="fas fa-times"></i></button></div><div class="modal-body"><table style="width:100%;border-collapse:collapse;">' + details.map(function(d) { return '<tr style="border-bottom:1px solid var(--border-color);"><td style="padding:10px 16px;font-weight:600;width:40%;">' + d.key + '</td><td style="padding:10px 16px;">' + (d.value || '-') + '</td></tr>'; }).join('') + '</table></div><div class="modal-footer"><button class="btn btn-secondary" onclick="ModalManager.close()">Close</button></div>');
    }

    deleteRecord(collection, id) {
        ModalManager.open('<div class="modal-header"><h3>Delete Record</h3><button class="btn-close" onclick="ModalManager.close()"><i class="fas fa-times"></i></button></div><div class="modal-body"><p>Are you sure? The record will be moved to recycle bin.</p></div><div class="modal-footer"><button class="btn btn-secondary" onclick="ModalManager.close()">Cancel</button><button class="btn btn-danger" id="btnConfirmDelete">Delete</button></div>');
        
        document.getElementById('btnConfirmDelete').onclick = () => {
            db.softDelete(collection, id);
            ToastManager.show('Record moved to recycle bin', 'success');
            ModalManager.close();
            this.navigateTo(collection);
        };
    }

    backupData() {
        try { db.backup(); ToastManager.show('Backup created!', 'success'); }
        catch(e) { ToastManager.show('Backup failed', 'error'); }
    }
    
    restoreData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            try {
                await db.restore(e.target.files[0]);
                ToastManager.show('Restored! Reloading...', 'success');
                setTimeout(function() { location.reload(); }, 1000);
            } catch(e) {
                ToastManager.show('Restore failed', 'error');
            }
        };
        input.click();
    }

    globalSearch(query) {
        if (query) ToastManager.show('Searching: ' + query, 'info');
    }

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
// INITIALIZE APP
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
            console.log('✅✅✅ Hummingbird ERP v3.0 Ready ✅✅✅');
        } catch(e) {
            console.error('❌ Init failed:', e);
            const mc = document.getElementById('moduleContainer');
            if (mc) {
                mc.innerHTML = '<div style="padding:60px;text-align:center;"><h3>Init Error</h3><p>' + e.message + '</p><button onclick="location.reload()" class="btn btn-primary">Reload</button></div>';
            }
        }
        
        if (loading) setTimeout(function() { if (loading.parentNode) loading.remove(); }, 300);
    }, 500);
});

console.log('✅ app.js loaded - v3.0');
