/**
 * Hummingbird Clothing ERP - Main Application v2.0
 * FujiSan Lanka Pvt Ltd
 * COMPLETE FILE - READY TO USE
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
        console.log('📂 Submenu toggled:', submenuId);
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
        
        // Load dashboard after a short delay
        setTimeout(() => {
            console.log('📊 Loading initial dashboard...');
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
            
            // Set active theme button
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
        console.log('  Setting up event listeners...');
        
        // Menu toggle button (hamburger - 3 lines)
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.onclick = (e) => {
                e.preventDefault();
                console.log('🍔 Menu toggle clicked');
                this.toggleSidebar();
            };
        } else {
            console.error('  ❌ menuToggle NOT FOUND! Check if element with id="menuToggle" exists');
        }

        // Sidebar collapse button
        const sidebarCollapse = document.getElementById('sidebarCollapse');
        if (sidebarCollapse) {
            sidebarCollapse.onclick = (e) => {
                e.preventDefault();
                console.log('◀ Sidebar collapse clicked');
                this.toggleSidebar();
            };
        }

        // Theme buttons (sun/moon)
        document.querySelectorAll('.btn-theme').forEach((btn) => {
            const theme = btn.getAttribute('data-theme');
            btn.onclick = (e) => {
                e.preventDefault();
                console.log('🎨 Theme button clicked:', theme);
                this.switchTheme(theme);
            };
        });

        // Settings button in sidebar footer
        const btnSettings = document.querySelector('.btn-settings');
        if (btnSettings) {
            btnSettings.onclick = (e) => {
                e.preventDefault();
                console.log('⚙️ Settings button clicked');
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

        // Confirm overlay - close on background click
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

        // Touch events for mobile swipe
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        console.log('  ✅ Event listeners setup complete');
    }

    // ==========================================
    // MOBILE DETECTION
    // ==========================================
    
    initMobileDetection() {
        this.checkMobile();
        window.addEventListener('resize', () => this.checkMobile());
    }

    checkMobile() {
        this.isMobile = window.innerWidth <= 768;
        console.log('  📱 Mobile check:', this.isMobile, '| Width:', window.innerWidth);
        
        if (this.isMobile) {
            document.body.classList.add('is-mobile');
            document.body.classList.remove('is-desktop');
        } else {
            document.body.classList.remove('is-mobile');
            document.body.classList.add('is-desktop');
        }
    }

    // ==========================================
    // SIDEBAR
    // ==========================================
    
    toggleSidebar() {
        console.log('📂 toggleSidebar called | isMobile:', this.isMobile);
        
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) {
            console.error('❌ Sidebar element not found!');
            return;
        }
        
        if (this.isMobile) {
            console.log('  Mobile: toggling mobile-open class');
            sidebar.classList.toggle('mobile-open');
            if (sidebar.classList.contains('mobile-open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        } else {
            console.log('  Desktop: toggling collapsed class');
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
            console.error('❌ Module not found:', moduleName);
            this.showToast('Module not found: ' + moduleName, 'error');
            return;
        }

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const navItem = document.querySelector(`[data-module="${moduleName}"]`);
        if (navItem) {
            navItem.classList.add('active');
            console.log('  ✅ Active nav:', moduleName);
        }

        // Update page title
        const title = moduleName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = title;
        }
        document.title = `Hummingbird ERP - ${title}`;

        this.currentModule = moduleName;
        this.loadModule(moduleName);

        // Close mobile sidebar after navigation
        if (this.isMobile) {
            this.closeMobileSidebar();
        }
    }

    // ==========================================
    // MODULE LOADING
    // ==========================================
    
    loadModule(moduleName) {
        console.log('📦 loadModule:', moduleName);
        
        const container = document.getElementById('moduleContainer');
        if (!container) {
            console.error('❌ moduleContainer not found!');
            return;
        }
        
        container.style.opacity = '0';
        
        setTimeout(() => {
            try {
                switch(moduleName) {
                    case 'dashboard':
                        if (typeof DashboardModule !== 'undefined') {
                            DashboardModule.render(container);
                        } else {
                            container.innerHTML = this.getWelcomeHTML('Dashboard');
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
                        if (typeof SettingsModule !== 'undefined') {
                            SettingsModule.render(container);
                        } else {
                            this.renderGenericModule(container, moduleName);
                        }
                        break;
                        
                    default:
                        this.renderGenericModule(container, moduleName);
                }
            } catch (error) {
                console.error('❌ Error loading module:', moduleName, error);
                container.innerHTML = this.getErrorHTML(moduleName, error);
            }
            
            container.style.opacity = '1';
        }, 150);
    }

    getWelcomeHTML(title) {
        return `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; min-height: 400px;">
                <div style="text-align: center; color: var(--text-tertiary);">
                    <i class="fas fa-feather-alt" style="font-size: 4rem; opacity: 0.3; margin-bottom: 16px;"></i>
                    <h3 style="font-weight: 600; color: var(--text-primary);">${title}</h3>
                    <p>This module is loading...</p>
                </div>
            </div>
        `;
    }

    getErrorHTML(moduleName, error) {
        return `
            <div class="glass-card" style="padding:40px;text-align:center;">
                <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:var(--danger-color);"></i>
                <h3 style="margin-top:16px;">Error Loading Module</h3>
                <p style="color:var(--text-tertiary);">${error.message}</p>
                <button class="btn btn-primary" onclick="app.navigateTo('dashboard')">Go to Dashboard</button>
            </div>
        `;
    }

    renderGenericModule(container, moduleName) {
        console.log('  📋 Rendering generic module:', moduleName);
        
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
                        <button class="btn btn-primary btn-sm" onclick="app.showModal('${moduleName}')">
                            <i class="fas fa-plus"></i> Add First Record
                        </button>
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
                    <button class="btn-icon-sm btn-view" onclick="app.viewItem('${moduleName}', '${item.id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon-sm btn-edit" onclick="app.editItem('${moduleName}', '${item.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon-sm btn-delete" onclick="app.deleteItem('${moduleName}', '${item.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
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
        console.log('📋 showModal:', type);
        
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        if (!overlay || !container) return;
        
        const isEdit = data !== null;
        const title = type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-${isEdit ? 'edit' : 'plus-circle'}"></i> ${isEdit ? 'Edit' : 'Add New'} ${title}</h3>
                <button class="btn-close" onclick="app.closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="modalForm" onsubmit="app.saveForm(event, '${type}', '${isEdit ? data.id : ''}')">
                    ${isEdit ? 
                        Object.keys(data)
                            .filter(k => !['id', 'createdAt', 'updatedAt'].includes(k))
                            .map(k => `
                                <div class="form-group">
                                    <label>${k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
                                    <input type="text" class="form-input" name="${k}" value="${data[k] || ''}">
                                </div>
                            `).join('')
                        : `
                            <div class="form-group">
                                <label>Name <span class="required">*</span></label>
                                <input type="text" class="form-input" name="name" required>
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea class="form-input form-textarea" name="description" rows="3"></textarea>
                            </div>
                        `
                    }
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary btn-lift" type="submit" form="modalForm">
                    <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Save'}
                </button>
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
        
        try {
            if (id) {
                db.updateItem(collection, id, data);
                this.showToast('Record updated successfully!', 'success');
            } else {
                db.addItem(collection, data);
                this.showToast('Record added successfully!', 'success');
            }
            
            this.closeModal();
            this.navigateTo(collection);
        } catch(e) {
            this.showToast('Error saving: ' + e.message, 'error');
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

        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-eye"></i> View Record</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <pre style="white-space:pre-wrap;font-family:monospace;font-size:13px;background:var(--bg-tertiary);padding:16px;border-radius:var(--radius-md);max-height:60vh;overflow-y:auto;">${JSON.stringify(item, null, 2)}</pre>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
            </div>
        `;
        
        overlay.classList.add('active');
        overlay.style.display = 'flex';
    }

    editItem(collection, id) {
        const item = db.getItem(collection, id);
        if (item) {
            this.showModal(collection, item);
        } else {
            this.showToast('Record not found', 'error');
        }
    }

    deleteItem(collection, id) {
        this.showConfirm(
            'Delete Record',
            'Are you sure you want to delete this record? This action cannot be undone.',
            () => {
                db.deleteItem(collection, id);
                this.showToast('Record deleted successfully!', 'success');
                this.navigateTo(collection);
            }
        );
    }

    // ==========================================
    // CONFIRM DIALOG
    // ==========================================
    
    showConfirm(title, message, callback) {
        const overlay = document.getElementById('confirmOverlay');
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        
        if (!overlay) return;
        
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        
        overlay.style.display = 'flex';
        overlay.classList.add('active');
        
        this._confirmCallback = callback;
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
    // TOAST NOTIFICATIONS
    // ==========================================
    
    showToast(message, type = 'info') {
        console.log(`💬 Toast [${type}]:`, message);
        
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
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }

    // ==========================================
    // THEME SWITCHING
    // ==========================================
    
    switchTheme(theme) {
        console.log('🎨 switchTheme:', theme);
        
        document.documentElement.setAttribute('data-theme', theme);
        
        // Save to database
        try {
            db.updateSettings({ theme: theme });
        } catch(e) {
            console.warn('Could not save theme:', e);
        }
        
        // Save to localStorage as backup
        localStorage.setItem('hummingbird_theme', theme);
        
        // Update theme buttons
        document.querySelectorAll('.btn-theme').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-theme') === theme) {
                btn.classList.add('active');
            }
        });
        
        this.showToast(`Theme switched to ${theme} mode`, 'success');
    }

    // ==========================================
    // BACKUP & RESTORE
    // ==========================================
    
    backupData() {
        try {
            db.backup();
            this.showToast('Backup created successfully!', 'success');
        } catch(e) {
            this.showToast('Backup failed: ' + e.message, 'error');
        }
    }

    restoreData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            try {
                const file = e.target.files[0];
                if (file) {
                    await db.restore(file);
                    this.showToast('Data restored successfully! Reloading...', 'success');
                    setTimeout(() => location.reload(), 1000);
                }
            } catch(error) {
                this.showToast('Restore failed: ' + error.message, 'error');
            }
        };
        input.click();
    }

    // ==========================================
    // GLOBAL SEARCH
    // ==========================================
    
    globalSearch(query) {
        if (!query || query.trim() === '') return;
        
        query = query.toLowerCase().trim();
        const searchableModules = [
            'customers', 'suppliers', 'subGarments', 'production',
            'finishing', 'payments', 'inventory'
        ];
        
        let results = [];
        searchableModules.forEach(module => {
            const items = db.getCollection(module);
            items.forEach(item => {
                if (JSON.stringify(item).toLowerCase().includes(query)) {
                    results.push({ module, item, id: item.id });
                }
            });
        });
        
        if (results.length === 1) {
            this.navigateTo(results[0].module);
            this.showToast(`Found 1 result in ${results[0].module}`, 'info');
        } else if (results.length > 1) {
            this.showToast(`Found ${results.length} results`, 'info');
        } else {
            this.showToast('No results found', 'warning');
        }
    }

    // ==========================================
    // KEYBOARD SHORTCUTS
    // ==========================================
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K / Cmd+K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const globalSearch = document.getElementById('globalSearch');
                if (globalSearch) globalSearch.focus();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeConfirm();
            }
        });
    }

    // ==========================================
    // UTILITIES
    // ==========================================
    
    saveCurrentModule() {
        // Placeholder for auto-save per module
    }

    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => this.saveCurrentModule(), 30000);
    }

    updateDateTime() {
        const el = document.getElementById('currentDate');
        if (el) {
            const now = new Date();
            el.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        // Update every minute
        setTimeout(() => this.updateDateTime(), 60000);
    }
}

// ==========================================
// APP INITIALIZATION
// ==========================================

let app;

window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOMContentLoaded - starting app...');
    
    setTimeout(() => {
        const loading = document.getElementById('app-loading');
        const appContainer = document.getElementById('appContainer');
        
        // Hide loading screen
        if (loading) loading.classList.add('hidden');
        
        // Show app container
        if (appContainer) appContainer.style.display = 'flex';
        
        // Initialize app
        try {
            window.app = new HummingbirdERP();
            console.log('✅✅✅ APP INITIALIZED SUCCESSFULLY ✅✅✅');
            console.log('📋 Available modules:', window.app.modules.join(', '));
            console.log('💡 Try clicking sidebar menu items!');
        } catch(e) {
            console.error('❌❌❌ APP INITIALIZATION FAILED:', e);
            const container = document.getElementById('moduleContainer');
            if (container) {
                container.innerHTML = `
                    <div style="padding:60px;text-align:center;">
                        <i class="fas fa-bug" style="font-size:4rem;color:#ef4444;"></i>
                        <h2 style="margin-top:16px;">Initialization Error</h2>
                        <p style="color:#64748b;">${e.message}</p>
                        <p style="color:#94a3b8;font-size:0.85rem;">Check console (F12) for details</p>
                        <button class="btn btn-primary" onclick="location.reload()" style="margin-top:16px;">
                            <i class="fas fa-redo"></i> Reload
                        </button>
                    </div>
                `;
            }
        }
        
        // Remove loading screen
        if (loading) {
            setTimeout(() => {
                if (loading.parentNode) loading.remove();
            }, 300);
        }
    }, 500);
});

console.log('✅ app.js file fully loaded');
