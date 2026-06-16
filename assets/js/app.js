/**
 * Hummingbird Clothing ERP - Main Application
 * FIXED: Navigation, Sidebar, Theme, Settings
 */

class HummingbirdERP {
    constructor() {
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
        this.loadSettings();
        this.setupEventListeners();
        this.initMobileDetection();
        this.setupKeyboardShortcuts();
        this.updateDateTime();
        this.setupAutoSave();
        
        // Load dashboard after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.navigateTo('dashboard');
        }, 100);
    }

    loadSettings() {
        const settings = db.getSettings();
        document.documentElement.setAttribute('data-theme', settings.theme || 'light');
        document.documentElement.setAttribute('data-accent', settings.accent || 'blue');
        
        // Set active theme button
        const currentTheme = settings.theme || 'light';
        document.querySelectorAll('.btn-theme').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-theme') === currentTheme) {
                btn.classList.add('active');
            }
        });
    }

    setupEventListeners() {
        // Menu toggle button
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSidebar();
            });
        }

        // Sidebar collapse button
        const sidebarCollapse = document.getElementById('sidebarCollapse');
        if (sidebarCollapse) {
            sidebarCollapse.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSidebar();
            });
        }

        // Theme buttons
        document.querySelectorAll('.btn-theme').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const theme = btn.getAttribute('data-theme');
                this.switchTheme(theme);
            });
        });

        // Settings button in sidebar footer
        const btnSettings = document.querySelector('.btn-settings');
        if (btnSettings) {
            btnSettings.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo('settings');
            });
        }

        // Modal overlay click to close
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeModal();
                }
            });
        }

        // Confirm overlay click to close
        const confirmOverlay = document.getElementById('confirmOverlay');
        if (confirmOverlay) {
            confirmOverlay.addEventListener('click', (e) => {
                if (e.target === confirmOverlay) {
                    this.closeConfirm();
                }
            });
        }

        // Touch events for mobile swipe
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        // Window resize
        window.addEventListener('resize', () => this.handleResize());

        // Global search
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.globalSearch(globalSearch.value);
                }
            });
        }
    }

    // ==========================================
    // MOBILE DETECTION & GESTURES
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
            this.createSidebarOverlay();
            this.addMobileSidebarClose();
        } else {
            document.body.classList.remove('is-mobile');
            document.body.classList.add('is-desktop');
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('mobile-open');
            }
            document.body.style.overflow = '';
            this.removeSidebarOverlay();
        }
    }

    createSidebarOverlay() {
        if (!document.getElementById('sidebarOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'sidebarOverlay';
            overlay.className = 'sidebar-overlay';
            overlay.addEventListener('click', () => this.closeMobileSidebar());
            document.body.appendChild(overlay);
        }
    }

    removeSidebarOverlay() {
        const overlay = document.getElementById('sidebarOverlay');
        if (overlay) overlay.remove();
    }

    addMobileSidebarClose() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.querySelector('.sidebar-close-mobile')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'sidebar-close-mobile';
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.addEventListener('click', () => this.closeMobileSidebar());
            const sidebarHeader = sidebar.querySelector('.sidebar-header');
            if (sidebarHeader) {
                sidebarHeader.appendChild(closeBtn);
            }
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        const overlay = document.getElementById('sidebarOverlay');
        
        if (this.isMobile) {
            if (sidebar.classList.contains('mobile-open')) {
                this.closeMobileSidebar();
            } else {
                sidebar.classList.add('mobile-open');
                if (overlay) overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        } else {
            sidebar.classList.toggle('collapsed');
        }
    }

    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        const overlay = document.getElementById('sidebarOverlay');
        
        sidebar.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }

    handleTouchEnd(e) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - this.touchStartX;
        const diffY = touchEndY - this.touchStartY;
        
        if (this.isMobile && 
            Math.abs(diffX) > Math.abs(diffY) && 
            Math.abs(diffX) > 80 && 
            diffX > 0 &&
            this.touchStartX < 40) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.add('mobile-open');
                const overlay = document.getElementById('sidebarOverlay');
                if (overlay) overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
        
        if (this.isMobile && 
            Math.abs(diffX) > Math.abs(diffY) && 
            Math.abs(diffX) > 80 && 
            diffX < 0) {
            this.closeMobileSidebar();
        }
    }

    handleResize() {
        this.checkMobile();
        if (window.innerWidth > 768) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('mobile-open');
            }
            document.body.style.overflow = '';
        }
    }

    // ==========================================
    // NAVIGATION (FIXED)
    // ==========================================

    navigateTo(moduleName) {
        console.log('Navigating to:', moduleName);
        
        if (!this.modules.includes(moduleName)) {
            console.warn('Module not found:', moduleName);
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
        }

        // Update page title
        const title = moduleName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = title;
        }
        document.title = `Hummingbird ERP - ${title}`;

        this.saveCurrentModule();
        this.currentModule = moduleName;
        this.loadModule(moduleName);

        // Close mobile sidebar after navigation
        if (this.isMobile) {
            this.closeMobileSidebar();
            const moduleContainer = document.getElementById('moduleContainer');
            if (moduleContainer) {
                moduleContainer.scrollTop = 0;
            }
        }
    }

    loadModule(moduleName) {
        const container = document.getElementById('moduleContainer');
        if (!container) {
            console.error('Module container not found!');
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
                            container.innerHTML = '<div class="glass-card" style="padding:40px;text-align:center;"><h3>Dashboard Module Loading...</h3></div>';
                        }
                        break;
                    case 'sub-garments':
                        if (typeof SubGarmentsModule !== 'undefined') {
                            SubGarmentsModule.render(container);
                        } else {
                            container.innerHTML = '<div class="glass-card" style="padding:40px;text-align:center;"><h3>Sub Garments Module Loading...</h3></div>';
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
                console.error('Error loading module:', moduleName, error);
                container.innerHTML = `
                    <div class="glass-card" style="padding:40px;text-align:center;">
                        <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:var(--danger-color);"></i>
                        <h3 style="margin-top:16px;">Error Loading Module</h3>
                        <p style="color:var(--text-tertiary);">${error.message}</p>
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
            <div id="${moduleName}FilterContainer"></div>
            <div class="data-table-container glass-card">
                <div class="table-wrapper">
                    <table class="data-table" id="${moduleName}Table">
                        <thead><tr id="${moduleName}TableHead"></tr></thead>
                        <tbody id="${moduleName}TableBody"></tbody>
                    </table>
                </div>
                <div class="table-footer">
                    <span class="table-count" id="${moduleName}Count">0 records</span>
                    <div class="pagination" id="${moduleName}Pagination"></div>
                </div>
            </div>
        `;

        // Initialize filter system
        if (typeof FilterSystem !== 'undefined') {
            window[`${moduleName}Filter`] = new FilterSystem(moduleName, `${moduleName}FilterContainer`);
            window[`${moduleName}Filter`].render();
            window[`${moduleName}Filter`].updateTable = (filteredItems) => this.renderTable(moduleName, filteredItems);
        }

        this.renderTable(moduleName, items);
    }

    renderTable(collection, items) {
        const tableHead = document.getElementById(`${collection}TableHead`);
        const tableBody = document.getElementById(`${collection}TableBody`);
        const tableCount = document.getElementById(`${collection}Count`);
        
        if (!tableHead || !tableBody) return;

        if (items.length === 0) {
            tableHead.innerHTML = '';
            tableBody.innerHTML = `
                <tr><td colspan="10" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No records found</p>
                </td></tr>
            `;
            if (tableCount) tableCount.textContent = '0 records';
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
                ${headers.map(h => `<td data-label="${h.replace(/([A-Z])/g, ' $1')}">${this.formatCellValue(item[h])}</td>`).join('')}
                <td class="actions-cell" data-label="Actions">
                    <button class="btn-icon-sm btn-view" onclick="app.viewItem('${collection}', '${item.id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon-sm btn-edit" onclick="app.editItem('${collection}', '${item.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon-sm btn-delete" onclick="app.deleteItem('${collection}', '${item.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        if (tableCount) tableCount.textContent = `${items.length} records`;
    }

    formatCellValue(value) {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? '<span class="status-badge active">Yes</span>' : '<span class="status-badge draft">No</span>';
        if (typeof value === 'object') return JSON.stringify(value).substring(0, 50) + '...';
        return value;
    }

    // ==========================================
    // MODALS
    // ==========================================

    showModal(type, data = null) {
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        if (!overlay || !container) return;
        
        container.innerHTML = this.getModalContent(type, data);
        overlay.classList.add('active');
        overlay.style.display = 'flex';
    }

    closeModal() {
        const overlay = document.getElementById('modalOverlay');
        if (!overlay) return;
        
        overlay.classList.add('closing');
        setTimeout(() => {
            overlay.classList.remove('active', 'closing');
            overlay.style.display = 'none';
        }, 300);
    }

    getModalContent(type, data) {
        const isEdit = data !== null;
        const title = type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        return `
            <div class="modal-header">
                <h3><i class="fas fa-${isEdit ? 'edit' : 'plus-circle'}"></i> ${isEdit ? 'Edit' : 'Add New'} ${title}</h3>
                <button class="btn-close" onclick="app.closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="modalForm" onsubmit="app.saveForm(event, '${type}', '${isEdit ? data.id : ''}')">
                    ${this.generateFormFields(type, data)}
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary btn-lift" form="modalForm" type="submit">
                    <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Save'}
                </button>
            </div>
        `;
    }

    generateFormFields(type, data) {
        if (data) {
            return Object.keys(data).map(key => {
                if (['id', 'createdAt', 'updatedAt'].includes(key)) return '';
                return `
                    <div class="form-group">
                        <label>${key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
                        <input type="text" class="form-input" name="${key}" value="${data[key] || ''}">
                    </div>
                `;
            }).join('');
        }
        
        return `
            <div class="form-group">
                <label>Name <span class="required">*</span></label>
                <input type="text" class="form-input" name="name" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-input form-textarea" name="description" rows="3"></textarea>
            </div>
        `;
    }

    saveForm(event, collection, id) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        
        if (id) {
            db.updateItem(collection, id, data);
            this.showToast('Record updated successfully', 'success');
        } else {
            db.addItem(collection, data);
            this.showToast('Record added successfully', 'success');
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

        const formatted = JSON.stringify(item, null, 2);
        
        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-eye"></i> View Record</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <pre style="white-space: pre-wrap; font-family: monospace; font-size: 13px; background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-md); max-height: 60vh; overflow-y: auto;">${formatted}</pre>
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
        }
    }

    deleteItem(collection, id) {
        this.showConfirm(
            'Delete Record',
            'Are you sure you want to delete this record? This action cannot be undone.',
            () => {
                db.deleteItem(collection, id);
                this.showToast('Record deleted successfully', 'success');
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
        
        if (!overlay || !titleEl || !messageEl) return;
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        overlay.style.display = 'flex';
        this._confirmCallback = callback;
    }

    closeConfirm() {
        const overlay = document.getElementById('confirmOverlay');
        if (overlay) {
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
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ==========================================
    // THEME (FIXED)
    // ==========================================

    switchTheme(theme) {
        console.log('Switching theme to:', theme);
        
        document.documentElement.setAttribute('data-theme', theme);
        
        // Save to database
        try {
            db.updateSettings({ theme });
        } catch(e) {
            console.warn('Could not save theme setting:', e);
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
            this.showToast('Backup created successfully', 'success');
        } catch (error) {
            this.showToast('Backup failed: ' + error.message, 'error');
        }
    }

    restoreData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            try {
                await db.restore(e.target.files[0]);
                this.showToast('Data restored successfully', 'success');
                this.navigateTo(this.currentModule);
            } catch (error) {
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
        const searchableModules = ['customers', 'suppliers', 'subGarments', 'production', 'finishing', 'payments', 'inventory'];
        
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
            this.showToast(`Found in ${results[0].module}`, 'info');
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
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const globalSearch = document.getElementById('globalSearch');
                if (globalSearch) globalSearch.focus();
            }
            
            if (e.key === 'Escape') {
                if (this.isMobile) this.closeMobileSidebar();
                this.closeModal();
                this.closeConfirm();
            }
        });
    }

    // ==========================================
    // AUTO SAVE & DATE TIME
    // ==========================================

    saveCurrentModule() {
        // Auto-save implementation per module if needed
    }

    setupAutoSave() {
        setInterval(() => this.saveCurrentModule(), 30000);
    }

    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        };
        const dateEl = document.getElementById('currentDate');
        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString('en-US', options);
        }
        setTimeout(() => this.updateDateTime(), 60000);
    }
}

// ==========================================
// GLOBAL FUNCTIONS (FIXED)
// ==========================================

function toggleSubmenu(event, submenuId) {
    event.preventDefault();
    event.stopPropagation();
    const navItem = event.target.closest('.has-submenu');
    if (navItem) {
        navItem.classList.toggle('open');
    }
}

function switchTheme(theme) {
    if (window.app) {
        window.app.switchTheme(theme);
    }
}

function backupData() {
    if (window.app) window.app.backupData();
}

function restoreData() {
    if (window.app) window.app.restoreData();
}

function navigateTo(module) {
    if (window.app) {
        window.app.navigateTo(module);
    }
}

// ==========================================
// INITIALIZE APP
// ==========================================

let app;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Hummingbird ERP...');
    
    setTimeout(() => {
        const loading = document.getElementById('app-loading');
        const appContainer = document.getElementById('appContainer');
        
        if (loading) loading.classList.add('hidden');
        if (appContainer) appContainer.style.display = 'flex';
        
        // Create app instance
        window.app = new HummingbirdERP();
        
        if (loading) {
            setTimeout(() => loading.remove(), 300);
        }
        
        console.log('Hummingbird ERP initialized successfully!');
    }, 500);
});

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Application Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
});
