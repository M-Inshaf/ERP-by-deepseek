/**
 * Hummingbird Clothing ERP - Main Application v2.0
 * FujiSan Lanka Pvt Ltd
 * COMPLETE FILE WITH SETTINGS FIX
 */

console.log('🔄 app.js loading...');

// ==========================================
// GLOBAL FUNCTION: Toggle Submenu
// ==========================================
function toggleSubmenu(event, submenuId) {
    event.preventDefault();
    event.stopPropagation();
    const navItem = event.target.closest('.has-submenu');
    if (navItem) {
        navItem.classList.toggle('open');
    }
}

// ==========================================
// HUMMINGBIRD ERP CLASS
// ==========================================
class HummingbirdERP {
    constructor() {
        console.log('🏗️ HummingbirdERP constructor called');
        
        this.currentModule = 'dashboard';
        this.modules = [
            'dashboard', 'customers', 'suppliers', 'inventory',
            'fabric', 'accessories', 'sub-garments', 'production',
            'finishing', 'payments', 'ledger', 'expenses',
            'cheques', 'staff', 'reports', 'settings'
        ];
        
        this.isMobile = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this._confirmCallback = null;
        
        this.init();
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    init() {
        console.log('🚀 App.init() started');
        
        this.loadSettings();
        this.setupEventListeners();
        this.initMobileDetection();
        this.setupKeyboardShortcuts();
        this.updateDateTime();
        this.setupAutoSave();
        
        setTimeout(() => {
            this.navigateTo('dashboard');
        }, 200);
        
        console.log('✅ App.init() completed');
    }

    loadSettings() {
        try {
            const settings = db.getSettings();
            const theme = settings.theme || 'light';
            const accent = settings.accent || 'blue';
            
            document.documentElement.setAttribute('data-theme', theme);
            document.documentElement.setAttribute('data-accent', accent);
            
            document.querySelectorAll('.btn-theme').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-theme') === theme) {
                    btn.classList.add('active');
                }
            });
        } catch(e) {
            console.error('loadSettings error:', e);
        }
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    
    setupEventListeners() {
        // Menu toggle (hamburger button)
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.onclick = (e) => {
                e.preventDefault();
                this.toggleSidebar();
            };
        }

        // Sidebar collapse
        const sidebarCollapse = document.getElementById('sidebarCollapse');
        if (sidebarCollapse) {
            sidebarCollapse.onclick = (e) => {
                e.preventDefault();
                this.toggleSidebar();
            };
        }

        // Theme buttons (sun/moon in topbar)
        document.querySelectorAll('.btn-theme').forEach((btn) => {
            const theme = btn.getAttribute('data-theme');
            btn.onclick = (e) => {
                e.preventDefault();
                this.switchTheme(theme);
            };
        });

        // Settings button in sidebar footer (gear icon)
        const btnSettings = document.querySelector('.btn-settings');
        if (btnSettings) {
            btnSettings.onclick = (e) => {
                e.preventDefault();
                this.navigateTo('settings');
            };
        }

        // Modal overlay - close on background click
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.onclick = (e) => {
                if (e.target === modalOverlay) {
                    this.closeModal();
                }
            };
        }

        // Confirm overlay
        const confirmOverlay = document.getElementById('confirmOverlay');
        if (confirmOverlay) {
            confirmOverlay.onclick = (e) => {
                if (e.target === confirmOverlay) {
                    this.closeConfirm();
                }
            };
        }

        // Global search
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    this.globalSearch(globalSearch.value);
                }
            };
        }

        // Touch events for mobile
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
        window.addEventListener('resize', () => this.handleResize());
    }

    // ==========================================
    // MOBILE
    // ==========================================
    
    initMobileDetection() {
        this.checkMobile();
        window.addEventListener('resize', () => this.checkMobile());
    }

    checkMobile() {
        this.isMobile = window.innerWidth <= 768;
        if (this.isMobile) {
            document.body.classList.add('is-mobile');
            document.body.classList.remove('is-desktop');
        } else {
            document.body.classList.remove('is-mobile');
            document.body.classList.add('is-desktop');
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        if (this.isMobile) {
            sidebar.classList.toggle('mobile-open');
            document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
        } else {
            sidebar.classList.toggle('collapsed');
        }
    }

    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('mobile-open');
            document.body.style.overflow = '';
        }
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }

    handleTouchEnd(e) {
        const touchEndX = e.changedTouches[0].clientX;
        const diffX = touchEndX - this.touchStartX;
        if (this.isMobile && Math.abs(diffX) > 80 && diffX > 0 && this.touchStartX < 40) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.add('mobile-open');
                document.body.style.overflow = 'hidden';
            }
        }
        if (this.isMobile && Math.abs(diffX) > 80 && diffX < 0) {
            this.closeMobileSidebar();
        }
    }

    handleResize() {
        this.checkMobile();
        if (window.innerWidth > 768) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.remove('mobile-open');
            document.body.style.overflow = '';
        }
    }

    // ==========================================
    // NAVIGATION
    // ==========================================
    
    navigateTo(moduleName) {
        console.log('🧭 navigateTo:', moduleName);
        
        if (!this.modules.includes(moduleName)) {
            this.showToast('Module not found: ' + moduleName, 'error');
            return;
        }

        // Update active nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const navItem = document.querySelector(`[data-module="${moduleName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        // Update title
        const title = moduleName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = title;
        document.title = `Hummingbird ERP - ${title}`;

        this.currentModule = moduleName;
        this.loadModule(moduleName);

        if (this.isMobile) this.closeMobileSidebar();
    }

    // ==========================================
    // MODULE LOADING (WITH SETTINGS FIX)
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
                        if (typeof DashboardModule !== 'undefined') {
                            DashboardModule.render(container);
                        } else {
                            this.renderGenericModule(container, moduleName);
                        }
                        break;
                        
                    case 'sub-garments':
                        if (typeof SubGarmentsModule !== 'undefined') {
                            SubGarmentsModule.render(container);
                        } else {
                            this.renderGenericModule(container, moduleName);
                        }
                        break;
                        
                    case 'production':
                        if (typeof ProductionModule !== 'undefined') {
                            ProductionModule.render(container);
                        } else {
                            this.renderGenericModule(container, moduleName);
                        }
                        break;
                        
                    case 'finishing':
                        if (typeof FinishingModule !== 'undefined') {
                            FinishingModule.render(container);
                        } else {
                            this.renderGenericModule(container, moduleName);
                        }
                        break;
                        
                    case 'payments':
                        if (typeof PaymentsModule !== 'undefined') {
                            PaymentsModule.render(container);
                        } else {
                            this.renderGenericModule(container, moduleName);
                        }
                        break;
                        
                    case 'ledger':
                        if (typeof LedgerModule !== 'undefined') {
                            LedgerModule.render(container);
                        } else {
                            this.renderGenericModule(container, moduleName);
                        }
                        break;
                        
                    case 'inventory':
                        if (typeof InventoryModule !== 'undefined') {
                            InventoryModule.render(container);
                        } else {
                            this.renderGenericModule(container, moduleName);
                        }
                        break;
                        
                    case 'reports':
                        if (typeof ReportsModule !== 'undefined') {
                            ReportsModule.render(container);
                        } else {
                            this.renderGenericModule(container, moduleName);
                        }
                        break;
                        
                    case 'settings':
                        // ✅ SETTINGS FIX - Always render settings properly
                        if (typeof SettingsModule !== 'undefined') {
                            SettingsModule.render(container);
                        } else {
                            // Fallback if SettingsModule is not defined
                            this.renderGenericModule(container, moduleName);
                        }
                        break;
                        
                    default:
                        this.renderGenericModule(container, moduleName);
                }
            } catch (error) {
                console.error('❌ Error loading module:', moduleName, error);
                container.innerHTML = `
                    <div class="glass-card" style="padding:40px;text-align:center;">
                        <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:var(--danger-color);"></i>
                        <h3>Error Loading ${moduleName}</h3>
                        <p>${error.message}</p>
                        <button class="btn btn-primary" onclick="app.navigateTo('dashboard')">Go to Dashboard</button>
                    </div>
                `;
            }
            
            container.style.opacity = '1';
        }, 150);
    }

    renderGenericModule(container, moduleName) {
        const title = moduleName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const items = db.getCollection(moduleName);
        
        container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">${title} Management</h2>
                <div class="module-actions">
                    <button class="btn btn-primary btn-lift" onclick="app.showModal('${moduleName}')">
                        <i class="fas fa-plus"></i> Add New
                    </button>
                </div>
            </div>
            
            <div class="data-table-container glass-card">
                <div class="table-wrapper">
                    <table class="data-table" id="${moduleName}Table">
                        <thead><tr id="${moduleName}TableHead"></tr></thead>
                        <tbody id="${moduleName}TableBody"></tbody>
                    </table>
                </div>
                <div class="table-footer">
                    <span class="table-count" id="${moduleName}Count">${items.length} records</span>
                </div>
            </div>
        `;

        const tableHead = document.getElementById(`${moduleName}TableHead`);
        const tableBody = document.getElementById(`${moduleName}TableBody`);
        
        if (!tableHead || !tableBody) return;

        if (items.length === 0) {
            tableHead.innerHTML = '';
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No records found</p>
                    </td>
                </tr>
            `;
            return;
        }

        const headers = Object.keys(items[0]).filter(key => 
            key !== 'id' && key !== 'updatedAt'
        );
        
        tableHead.innerHTML = `
            <th>#</th>
            ${headers.map(h => `<th>${h.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</th>`).join('')}
            <th>Actions</th>
        `;

        tableBody.innerHTML = items.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                ${headers.map(h => `<td>${this.formatCellValue(item[h])}</td>`).join('')}
                <td class="actions-cell">
                    <button class="btn-icon-sm btn-view" onclick="app.viewItem('${moduleName}', '${item.id}')"><i class="fas fa-eye"></i></button>
                    <button class="btn-icon-sm btn-edit" onclick="app.editItem('${moduleName}', '${item.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon-sm btn-delete" onclick="app.deleteItem('${moduleName}', '${item.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    formatCellValue(value) {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? '✓' : '✗';
        if (typeof value === 'object') return JSON.stringify(value).substring(0, 50);
        return value;
    }

    // ==========================================
    // MODALS
    // ==========================================
    
    showModal(type, data = null) {
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        if (!overlay || !container) return;
        
        const isEdit = data !== null;
        const title = type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-${isEdit ? 'edit' : 'plus-circle'}"></i> ${isEdit ? 'Edit' : 'Add New'} ${title}</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="modalForm" onsubmit="app.saveForm(event, '${type}', '${isEdit ? data.id : ''}')">
                    ${isEdit ? 
                        Object.keys(data).filter(k => !['id','createdAt','updatedAt'].includes(k)).map(k => `
                            <div class="form-group"><label>${k}</label><input type="text" class="form-input" name="${k}" value="${data[k] || ''}"></div>
                        `).join('') : 
                        '<div class="form-group"><label>Name</label><input type="text" class="form-input" name="name" required></div><div class="form-group"><label>Description</label><textarea class="form-input" name="description" rows="3"></textarea></div>'
                    }
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary" type="submit" form="modalForm">${isEdit ? 'Update' : 'Save'}</button>
            </div>
        `;
        
        overlay.classList.add('active');
        overlay.style.display = 'flex';
    }

    closeModal() {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.style.display = 'none';
        }
    }

    saveForm(event, collection, id) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        
        if (id) {
            db.updateItem(collection, id, data);
            this.showToast('Updated successfully!', 'success');
        } else {
            db.addItem(collection, data);
            this.showToast('Added successfully!', 'success');
        }
        
        this.closeModal();
        this.navigateTo(collection);
    }

    viewItem(collection, id) {
        const item = db.getItem(collection, id);
        if (!item) return;
        
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        if (!overlay || !container) return;

        container.innerHTML = `
            <div class="modal-header"><h3>View Record</h3><button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button></div>
            <div class="modal-body"><pre style="white-space:pre-wrap;font-family:monospace;font-size:13px;background:var(--bg-tertiary);padding:16px;border-radius:8px;">${JSON.stringify(item, null, 2)}</pre></div>
            <div class="modal-footer"><button class="btn btn-secondary" onclick="app.closeModal()">Close</button></div>
        `;
        
        overlay.classList.add('active');
        overlay.style.display = 'flex';
    }

    editItem(collection, id) {
        const item = db.getItem(collection, id);
        if (item) this.showModal(collection, item);
        else this.showToast('Record not found', 'error');
    }

    deleteItem(collection, id) {
        this.showConfirm('Delete Record', 'Are you sure? This cannot be undone.', () => {
            db.deleteItem(collection, id);
            this.showToast('Deleted successfully!', 'success');
            this.navigateTo(collection);
        });
    }

    // ==========================================
    // CONFIRM DIALOG
    // ==========================================
    
    showConfirm(title, message, callback) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmOverlay').style.display = 'flex';
        this._confirmCallback = callback;
    }

    closeConfirm() {
        document.getElementById('confirmOverlay').style.display = 'none';
        this._confirmCallback = null;
    }

    executeConfirm() {
        if (this._confirmCallback) this._confirmCallback();
        this.closeConfirm();
    }

    // ==========================================
    // TOAST
    // ==========================================
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
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
    // THEME
    // ==========================================
    
    switchTheme(theme) {
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
    // BACKUP & RESTORE
    // ==========================================
    
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

    // ==========================================
    // SEARCH
    // ==========================================
    
    globalSearch(query) {
        if (!query || !query.trim()) return;
        this.showToast(`Searching: ${query}`, 'info');
    }

    // ==========================================
    // KEYBOARD
    // ==========================================
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('globalSearch')?.focus();
            }
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeConfirm();
            }
        });
    }

    // ==========================================
    // UTILS
    // ==========================================
    
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
// APP INITIALIZATION
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
            console.log('✅ App initialized successfully!');
        } catch(e) {
            console.error('❌ Init failed:', e);
        }
        
        if (loading) setTimeout(() => loading.remove(), 300);
    }, 500);
});

console.log('✅ app.js loaded');
