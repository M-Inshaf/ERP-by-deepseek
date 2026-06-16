/**
 * Hummingbird Clothing ERP - Main Application
 * Core routing, navigation, and app initialization
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
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.updateDateTime();
        this.navigateTo('dashboard');
        this.setupAutoSave();
    }

    // Load saved settings
    loadSettings() {
        const settings = db.getSettings();
        document.documentElement.setAttribute('data-theme', settings.theme || 'light');
        document.documentElement.setAttribute('data-accent', settings.accent || 'blue');
    }

    // Setup global event listeners
    setupEventListeners() {
        // Sidebar toggle
        document.getElementById('menuToggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebarCollapse').addEventListener('click', () => this.toggleSidebar());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'b':
                        e.preventDefault();
                        this.backupData();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveCurrentModule();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.navigateTo('dashboard');
                        break;
                }
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());
    }

    // Toggle sidebar
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('mobile-open');
        } else {
            sidebar.classList.toggle('collapsed');
        }
    }

    // Navigate to module
    navigateTo(moduleName) {
        if (!this.modules.includes(moduleName)) {
            this.showToast('Module not found', 'error');
            return;
        }

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const navItem = document.querySelector(`[data-module="${moduleName}"]`);
        if (navItem) navItem.classList.add('active');

        // Update page title
        const title = moduleName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        document.getElementById('pageTitle').textContent = title;
        document.title = `Hummingbird ERP - ${title}`;

        // Save current module state
        this.saveCurrentModule();

        // Load module content
        this.currentModule = moduleName;
        this.loadModule(moduleName);

        // Close mobile sidebar
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('mobile-open');
        }
    }

    // Load module content
    loadModule(moduleName) {
        const container = document.getElementById('moduleContainer');
        
        // Add fade animation
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

    // Generic module renderer for simpler modules
    renderGenericModule(container, moduleName) {
        const title = moduleName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const items = db.getCollection(moduleName);
        
        container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">${title} Management</h2>
                <div class="module-actions">
                    <button class="btn btn-primary" onclick="app.showModal('${moduleName}')">
                        <i class="fas fa-plus"></i> Add New
                    </button>
                </div>
            </div>
            
            <!-- Universal Filter System -->
            <div class="filter-bar glass-card">
                <div class="filter-row">
                    <div class="filter-group">
                        <input type="text" class="form-input" placeholder="Search..." 
                               oninput="app.filterModule('${moduleName}')" id="filterSearch">
                    </div>
                    <div class="filter-group">
                        <input type="date" class="form-input" 
                               onchange="app.filterModule('${moduleName}')" id="filterDateFrom">
                        <span class="filter-label">to</span>
                        <input type="date" class="form-input" 
                               onchange="app.filterModule('${moduleName}')" id="filterDateTo">
                    </div>
                    <div class="filter-actions">
                        <button class="btn btn-secondary btn-sm" onclick="app.filterModule('${moduleName}')">
                            <i class="fas fa-filter"></i> Apply
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="app.resetFilters('${moduleName}')">
                            <i class="fas fa-undo"></i> Reset
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Data Table -->
            <div class="data-table-container glass-card">
                <table class="data-table" id="${moduleName}Table">
                    <thead>
                        <tr id="${moduleName}TableHead"></tr>
                    </thead>
                    <tbody id="${moduleName}TableBody"></tbody>
                </table>
                <div class="table-footer">
                    <span class="table-count" id="${moduleName}Count">0 records</span>
                    <div class="pagination" id="${moduleName}Pagination"></div>
                </div>
            </div>
        `;

        this.renderTable(moduleName, items);
    }

    // Render data table
    renderTable(collection, items) {
        if (items.length === 0) {
            document.getElementById(`${collection}TableHead`).innerHTML = '';
            document.getElementById(`${collection}TableBody`).innerHTML = `
                <tr><td colspan="10" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No records found</p>
                </td></tr>
            `;
            document.getElementById(`${collection}Count`).textContent = '0 records';
            return;
        }

        // Generate headers from first item
        const headers = Object.keys(items[0]).filter(key => 
            key !== 'id' && key !== 'updatedAt'
        );
        
        document.getElementById(`${collection}TableHead`).innerHTML = `
            <th>#</th>
            ${headers.map(h => `<th>${h.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</th>`).join('')}
            <th>Actions</th>
        `;

        // Generate rows
        document.getElementById(`${collection}TableBody`).innerHTML = items.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                ${headers.map(h => `<td>${this.formatCellValue(item[h])}</td>`).join('')}
                <td class="actions-cell">
                    <button class="btn-icon-sm" onclick="app.viewItem('${collection}', '${item.id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon-sm" onclick="app.editItem('${collection}', '${item.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon-sm btn-danger" onclick="app.deleteItem('${collection}', '${item.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        document.getElementById(`${collection}Count`).textContent = `${items.length} records`;
    }

    // Format cell value
    formatCellValue(value) {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? '✓' : '✗';
        if (typeof value === 'object') return JSON.stringify(value);
        if (typeof value === 'number' && (String(value).includes('cost') || String(value).includes('price'))) {
            return `Rs. ${value.toLocaleString()}`;
        }
        return value;
    }

    // Filter module data
    filterModule(collection) {
        const filters = {
            search: document.getElementById('filterSearch')?.value,
            dateFrom: document.getElementById('filterDateFrom')?.value,
            dateTo: document.getElementById('filterDateTo')?.value,
        };
        
        const filtered = db.queryItems(collection, filters);
        this.renderTable(collection, filtered);
    }

    // Reset filters
    resetFilters(collection) {
        if (document.getElementById('filterSearch')) document.getElementById('filterSearch').value = '';
        if (document.getElementById('filterDateFrom')) document.getElementById('filterDateFrom').value = '';
        if (document.getElementById('filterDateTo')) document.getElementById('filterDateTo').value = '';
        
        const items = db.getCollection(collection);
        this.renderTable(collection, items);
    }

    // Show modal
    showModal(type, data = null) {
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        container.innerHTML = this.getModalContent(type, data);
        overlay.classList.add('active');
        
        // Add entrance animation
        container.classList.add('scale-in');
    }

    // Close modal
    closeModal() {
        document.getElementById('modalOverlay').classList.remove('active');
    }

    // Get modal content
    getModalContent(type, data) {
        const isEdit = data !== null;
        const title = type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        return `
            <div class="modal-header">
                <h3>${isEdit ? 'Edit' : 'Add New'} ${title}</h3>
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
                <button class="btn btn-primary" form="modalForm" type="submit">
                    ${isEdit ? 'Update' : 'Save'}
                </button>
            </div>
        `;
    }

    // Generate form fields dynamically
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
                <label>Name</label>
                <input type="text" class="form-input" name="name" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-input" name="description" rows="3"></textarea>
            </div>
        `;
    }

    // Save form data
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

    // View item
    viewItem(collection, id) {
        const item = db.getItem(collection, id);
        if (item) {
            alert(JSON.stringify(item, null, 2));
        }
    }

    // Edit item
    editItem(collection, id) {
        const item = db.getItem(collection, id);
        if (item) {
            this.showModal(collection, item);
        }
    }

    // Delete item
    deleteItem(collection, id) {
        if (confirm('Are you sure you want to delete this record?')) {
            db.deleteItem(collection, id);
            this.showToast('Record deleted successfully', 'success');
            this.navigateTo(collection);
        }
    }

    // Show toast notification
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
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideInRight reverse';
            setTimeout(() => toast.remove(), 250);
        }, 3000);
    }

    // Switch theme
    switchTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        db.updateSettings({ theme });
        
        // Update theme buttons
        document.querySelectorAll('.btn-theme').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === theme) btn.classList.add('active');
        });
    }

    // Backup data
    backupData() {
        try {
            db.backup();
            this.showToast('Backup created successfully', 'success');
        } catch (error) {
            this.showToast('Backup failed: ' + error.message, 'error');
        }
    }

    // Restore data
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

    // Save current module state
    saveCurrentModule() {
        // Implement auto-save for current module if needed
    }

    // Setup auto-save
    setupAutoSave() {
        setInterval(() => {
            this.saveCurrentModule();
        }, 30000); // Auto-save every 30 seconds
    }

    // Update date time display
    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
        
        // Update every minute
        setTimeout(() => this.updateDateTime(), 60000);
    }

    // Handle window resize
    handleResize() {
        if (window.innerWidth > 768) {
            document.getElementById('sidebar').classList.remove('mobile-open');
        }
    }
}

// Toggle submenu
function toggleSubmenu(event, submenuId) {
    event.preventDefault();
    const navItem = event.target.closest('.has-submenu');
    navItem.classList.toggle('open');
}

// Switch theme (global function)
function switchTheme(theme) {
    if (app) app.switchTheme(theme);
}

// Backup data (global function)
function backupData() {
    if (app) app.backupData();
}

// Restore data (global function)
function restoreData() {
    if (app) app.restoreData();
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new HummingbirdERP();
    
    // Expose app globally
    window.app = app;
    window.navigateTo = (module) => app.navigateTo(module);
});

// Inside the HummingbirdERP class, add:

constructor() {
    // ... existing code ...
    this.isMobile = false;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.initMobileDetection();
}

// Mobile detection
initMobileDetection() {
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
    
    // Add swipe gestures for sidebar
    document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
}

checkMobile() {
    this.isMobile = window.innerWidth <= 768;
    
    if (this.isMobile) {
        document.body.classList.add('is-mobile');
        document.body.classList.remove('is-desktop');
        // Add overlay for sidebar
        this.createSidebarOverlay();
        // Add close button to sidebar
        this.addMobileSidebarClose();
    } else {
        document.body.classList.remove('is-mobile');
        document.body.classList.add('is-desktop');
        document.getElementById('sidebar')?.classList.remove('mobile-open');
        this.removeSidebarOverlay();
    }
}

// Create overlay for mobile sidebar
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

// Add close button for mobile sidebar
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

// Toggle sidebar (updated for mobile)
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

// Swipe gestures
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

// Navigate to module (updated to close mobile sidebar)
navigateTo(moduleName) {
    // ... existing navigation code ...
    
    // Close mobile sidebar after navigation
    if (this.isMobile) {
        this.closeMobileSidebar();
    }
    
    // Scroll to top on mobile
    if (this.isMobile) {
        document.getElementById('moduleContainer').scrollTop = 0;
    }
}

// Handle resize
handleResize() {
    this.checkMobile();
    if (window.innerWidth > 768) {
        document.getElementById('sidebar').classList.remove('mobile-open');
        document.body.style.overflow = '';
    }
}

// Switch theme (updated for mobile)
switchTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    db.updateSettings({ theme });
    
    document.querySelectorAll('.btn-theme').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) btn.classList.add('active');
    });
    
    // Save preference
    localStorage.setItem('hummingbird_theme', theme);
}

// Global search
globalSearch(query) {
    if (!query || query.trim() === '') return;
    
    query = query.toLowerCase().trim();
    
    // Search across all modules
    const searchableModules = [
        'customers', 'suppliers', 'subGarments', 'production', 
        'finishing', 'payments', 'inventory', 'fabric'
    ];
    
    let results = [];
    
    searchableModules.forEach(module => {
        const items = db.getCollection(module);
        items.forEach(item => {
            const searchString = JSON.stringify(item).toLowerCase();
            if (searchString.includes(query)) {
                results.push({
                    module: module,
                    item: item,
                    id: item.id
                });
            }
        });
    });
    
    if (results.length === 1) {
        // Navigate to the module and highlight the item
        this.navigateTo(results[0].module);
        this.showToast(`Found in ${results[0].module}`, 'info');
    } else if (results.length > 1) {
        // Show results overview
        this.showToast(`Found ${results.length} results across ${[...new Set(results.map(r => r.module))].length} modules`, 'info');
    } else {
        this.showToast('No results found', 'warning');
    }
}

// Keyboard shortcut handler
setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+K or Cmd+K for global search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('globalSearch')?.focus();
        }
        
        // Escape to close modals/sidebar
        if (e.key === 'Escape') {
            if (this.isMobile) {
                this.closeMobileSidebar();
            }
            this.closeModal();
        }
    });
}

// Confirm dialog
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
