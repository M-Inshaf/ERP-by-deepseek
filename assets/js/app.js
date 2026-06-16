/**
 * Hummingbird Clothing ERP - Main Application v2.0
 * FIXED: Sidebar navigation, Settings, Theme, Accent
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
        this.touchStartY = 0;
        this._confirmCallback = null;
        
        this.init();
    }

    init() {
        console.log('🚀 Init started');
        
        this.loadSettings();
        this.setupSidebarNavigation();  // ← CRITICAL: Setup sidebar clicks
        this.setupEventListeners();
        this.initMobileDetection();
        this.setupKeyboardShortcuts();
        this.updateDateTime();
        this.setupAutoSave();
        
        setTimeout(() => {
            this.navigateTo('dashboard');
        }, 300);
        
        console.log('✅ Init complete');
    }

    // ==========================================
    // SIDEBAR NAVIGATION (EVENT DELEGATION)
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
            
            // Handle Materials submenu toggle
            if (link.classList.contains('submenu-toggle')) {
                e.preventDefault();
                e.stopPropagation();
                const navItem = link.closest('.has-submenu');
                if (navItem) {
                    navItem.classList.toggle('open');
                    console.log('📂 Submenu toggled');
                }
                return;
            }

            // Navigate to module
            if (navModule) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Sidebar click →', navModule);
                this.navigateTo(navModule);
            }
        });

        console.log('✅ Sidebar navigation ready');
    }

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

    setupEventListeners() {
        // Menu toggle (hamburger)
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

        // Theme buttons (sun/moon)
        document.querySelectorAll('.btn-theme').forEach((btn) => {
            btn.onclick = (e) => {
                e.preventDefault();
                const theme = btn.getAttribute('data-theme');
                this.switchTheme(theme);
            };
        });

        // Settings gear icon in footer
        const btnSettings = document.querySelector('.btn-settings');
        if (btnSettings) {
            btnSettings.onclick = (e) => {
                e.preventDefault();
                this.navigateTo('settings');
            };
        }

        // Modal overlay
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.onclick = (e) => {
                if (e.target === modalOverlay) this.closeModal();
            };
        }

        // Confirm overlay
        const confirmOverlay = document.getElementById('confirmOverlay');
        if (confirmOverlay) {
            confirmOverlay.onclick = (e) => {
                if (e.target === confirmOverlay) this.closeConfirm();
            };
        }

        // Global search
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.onkeydown = (e) => {
                if (e.key === 'Enter') this.globalSearch(globalSearch.value);
            };
        }

        // Touch events
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

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
    }

    handleTouchEnd(e) {
        const diffX = e.changedTouches[0].clientX - this.touchStartX;
        if (this.isMobile && Math.abs(diffX) > 80 && diffX > 0 && this.touchStartX < 40) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.add('mobile-open');
                document.body.style.overflow = 'hidden';
            }
        }
        if (this.isMobile && Math.abs(diffX) > 80 && diffX < 0) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('mobile-open');
                document.body.style.overflow = '';
            }
        }
    }

    handleResize() {
        this.checkMobile();
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

        // Update active nav
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const navItem = document.querySelector(`[data-module="${moduleName}"]`);
        if (navItem) navItem.classList.add('active');

        // Update title
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
                container.innerHTML = `<div class="glass-card" style="padding:40px;text-align:center;"><h3>Error</h3><p>${error.message}</p><button class="btn btn-primary" onclick="app.navigateTo('dashboard')">Dashboard</button></div>`;
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
                <button class="btn btn-primary btn-lift" onclick="app.showModal('${moduleName}')"><i class="fas fa-plus"></i> Add New</button>
            </div>
            <div class="data-table-container glass-card">
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead><tr id="${moduleName}TableHead"></tr></thead>
                        <tbody id="${moduleName}TableBody">
                            ${items.length === 0 ? '<tr><td colspan="10" class="empty-state"><i class="fas fa-inbox"></i><p>No records</p></td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        if (items.length > 0) {
            const headers = Object.keys(items[0]).filter(k => k !== 'id' && k !== 'updatedAt');
            document.getElementById(`${moduleName}TableHead`).innerHTML = `<th>#</th>${headers.map(h => `<th>${h}</th>`).join('')}<th>Actions</th>`;
            document.getElementById(`${moduleName}TableBody`).innerHTML = items.map((item, i) => `
                <tr>
                    <td>${i+1}</td>
                    ${headers.map(h => `<td>${item[h] || '-'}</td>`).join('')}
                    <td class="actions-cell">
                        <button class="btn-icon-sm btn-view" onclick="app.viewItem('${moduleName}','${item.id}')"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon-sm btn-edit" onclick="app.editItem('${moduleName}','${item.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon-sm btn-delete" onclick="app.deleteItem('${moduleName}','${item.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    }

    formatCellValue(value) {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? '✓' : '✗';
        if (typeof value === 'object') return JSON.stringify(value).substring(0, 50);
        return value;
    }

    showModal(type, data = null) {
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        if (!overlay || !container) return;
        
        const isEdit = data !== null;
        const title = type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        container.innerHTML = `
            <div class="modal-header">
                <h3>${isEdit ? 'Edit' : 'Add'} ${title}</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="modalForm" onsubmit="app.saveForm(event, '${type}', '${isEdit ? data.id : ''}')">
                    ${isEdit ? Object.keys(data).filter(k => !['id','createdAt','updatedAt'].includes(k)).map(k => `<div class="form-group"><label>${k}</label><input type="text" class="form-input" name="${k}" value="${data[k] || ''}"></div>`).join('') : '<div class="form-group"><label>Name</label><input type="text" class="form-input" name="name" required></div>'}
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
        if (overlay) { overlay.classList.remove('active'); overlay.style.display = 'none'; }
    }

    saveForm(event, collection, id) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        
        if (id) { db.updateItem(collection, id, data); this.showToast('Updated!', 'success'); }
        else { db.addItem(collection, data); this.showToast('Added!', 'success'); }
        
        this.closeModal();
        this.navigateTo(collection);
    }

    viewItem(collection, id) {
        const item = db.getItem(collection, id);
        if (!item) return;
        alert(JSON.stringify(item, null, 2));
    }

    editItem(collection, id) {
        const item = db.getItem(collection, id);
        if (item) this.showModal(collection, item);
    }

    deleteItem(collection, id) {
        this.showConfirm('Delete', 'Are you sure?', () => {
            db.deleteItem(collection, id);
            this.showToast('Deleted!', 'success');
            this.navigateTo(collection);
        });
    }

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

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
    }

    switchTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try { db.updateSettings({ theme }); } catch(e) {}
        localStorage.setItem('hummingbird_theme', theme);
        document.querySelectorAll('.btn-theme').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-theme') === theme) btn.classList.add('active');
        });
        this.showToast(`Theme: ${theme}`, 'success');
    }

    backupData() { try { db.backup(); this.showToast('Backup created!', 'success'); } catch(e) { this.showToast('Failed', 'error'); } }
    
    restoreData() {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = '.json';
        input.onchange = async (e) => {
            try { await db.restore(e.target.files[0]); this.showToast('Restored!', 'success'); setTimeout(() => location.reload(), 1000); }
            catch(e) { this.showToast('Failed', 'error'); }
        };
        input.click();
    }

    globalSearch(query) {
        if (!query) return;
        this.showToast(`Search: ${query}`, 'info');
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); document.getElementById('globalSearch')?.focus(); }
            if (e.key === 'Escape') { this.closeModal(); this.closeConfirm(); }
        });
    }

    saveCurrentModule() {}
    setupAutoSave() { setInterval(() => this.saveCurrentModule(), 30000); }

    updateDateTime() {
        const el = document.getElementById('currentDate');
        if (el) el.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
            console.log('✅✅✅ ERP READY - Click sidebar items to navigate ✅✅✅');
        } catch(e) {
            console.error('❌ Init failed:', e);
        }
        if (loading) setTimeout(() => loading.remove(), 300);
    }, 500);
});

console.log('✅ app.js loaded');
