/**
 * Hummingbird Clothing ERP - Main Application
 * Core routing, navigation, mobile support, and app initialization
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
        this.navigateTo('dashboard');
        this.setupAutoSave();
    }

    loadSettings() {
        const settings = db.getSettings();
        document.documentElement.setAttribute('data-theme', settings.theme || 'light');
        document.documentElement.setAttribute('data-accent', settings.accent || 'blue');
    }

    setupEventListeners() {
        document.getElementById('menuToggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebarCollapse').addEventListener('click', () => this.toggleSidebar());

        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        window.addEventListener('resize', () => this.handleResize());
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
            document.getElementById('sidebar')?.classList.remove('mobile-open');
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
            sidebar.querySelector('.sidebar-header').appendChild(closeBtn);
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
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
        
        // Swipe right to open sidebar
        if (this.isMobile && 
            Math.abs(diffX) > Math.abs(diffY) && 
            Math.abs(diffX) > 80 && 
            diffX > 0 &&
            this.touchStartX < 40) {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.add('mobile-open');
            const overlay = document.getElementById('sidebarOverlay');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        // Swipe left to close sidebar
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
            document.getElementById('sidebar').classList.remove('mobile-open');
            document.body.style.overflow = '';
        }
    }

    // ==========================================
    // NAVIGATION
    // ==========================================

    navigateTo(moduleName) {
        if (!this.modules.includes(moduleName)) {
            this.showToast('Module not found', 'error');
            return;
        }

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const navItem = document.querySelector(`[data-module="${moduleName}"]`);
        if (navItem) navItem.classList.add('active');

        const title = moduleName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        document.getElementById('pageTitle').textContent = title;
        document.title = `Hummingbird ERP - ${title}`;

        this.saveCurrentModule();
        this.currentModule = moduleName;
        this.loadModule(moduleName);

        if (this.isMobile) {
            this.closeMobileSidebar();
            document.getElementById('moduleContainer').scrollTop = 0;
        }
    }

    loadModule(moduleName) {
        const container = document.getElementById('moduleContainer');
        container.style.opacity = '0';
        
        setTimeout(() => {
            switch(moduleName) {
                case 'dashboard':
                    DashboardModule.render(container);
                    break;
                case 'sub-garments':
                    SubGarmentsModule.render(container);
                    break;
                case 'production':
                    ProductionModule.render(container);
                    break;
                case 'finishing':
                    FinishingModule.render(container);
                    break;
                case 'payments':
                    PaymentsModule.render(container);
                    break;
                case 'ledger':
                    LedgerModule.render(container);
                    break;
                case 'inventory':
                    InventoryModule.render(container);
                    break;
                case 'reports':
                    ReportsModule.render(container);
                    break;
                case 'settings':
                    SettingsModule.render(container);
                    break;
                default:
                    this.renderGenericModule(container, moduleName);
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
        window[`${moduleName}Filter`] = new FilterSystem(moduleName, `${moduleName}FilterContainer`);
        window[`${moduleName}Filter`].render();
        window[`${moduleName}Filter`].updateTable = (items) => this.renderTable(moduleName, items);

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
        
        container.innerHTML = this.getModalContent(type, data);
        overlay.classList.add('active');
    }

    closeModal() {
        const overlay = document.getElementById('modalOverlay');
        overlay.classList.add('closing');
        setTimeout(() => {
            overlay.classList.remove('active', 'closing');
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
        if (item) {
            const formatted = JSON.stringify(item, null, 2);
            const modalContainer = document.getElementById('modalContainer');
            document.getElementById('modalOverlay').classList.add('active');
            modalContainer.innerHTML = `
                <div class="modal-header">
                    <h3><i class="fas fa-eye"></i> View Record</h3>
                    <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <pre style="white-space: pre-wrap; font-family: monospace; font-size: 13px; background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-md);">${formatted}</pre>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
                </div>
            `;
        }
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
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ==========================================
    // THEME & SETTINGS
    // ==========================================

    switchTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        db.updateSettings({ theme });
        localStorage.setItem('hummingbird_theme', theme);
        
        document.querySelectorAll('.btn-theme').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === theme) btn.classList.add('active');
        });
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
            this.showToast(`Found ${results.length} results across ${[...new Set(results.map(r => r.module))].length} modules`, 'info');
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
                document.getElementById('globalSearch')?.focus();
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
        // Implement auto-save per module if needed
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
        if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', options);
        setTimeout(() => this.updateDateTime(), 60000);
    }
}

// Global functions
function toggleSubmenu(event, submenuId) {
    event.preventDefault();
    const navItem = event.target.closest('.has-submenu');
    navItem.classList.toggle('open');
}

function switchTheme(theme) {
    if (window.app) window.app.switchTheme(theme);
}

function backupData() {
    if (window.app) window.app.backupData();
}

function restoreData() {
    if (window.app) window.app.restoreData();
}

// Initialize
let app;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loading = document.getElementById('app-loading');
        const appContainer = document.getElementById('appContainer');
        
        loading.classList.add('hidden');
        appContainer.style.display = 'flex';
        
        window.app = new HummingbirdERP();
        
        setTimeout(() => loading.remove(), 300);
    }, 500);
});

window.addEventListener('error', (e) => {
    console.error('Application Error:', e.error);
    if (window.app) window.app.showToast('An error occurred. Please try again.', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
    if (window.app) window.app.showToast('Operation failed. Please try again.', 'error');
});
