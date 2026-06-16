/**
 * Hummingbird ERP - Universal Filter System
 */

class FilterSystem {
    constructor(moduleName, containerId) {
        this.moduleName = moduleName;
        this.containerId = containerId;
        this.filters = {};
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="filter-bar glass-card">
                <div class="filter-row">
                    <div class="filter-group">
                        <div class="input-with-icon">
                            <i class="fas fa-search"></i>
                            <input type="text" class="form-input" 
                                   placeholder="Search ${this.moduleName}..." 
                                   id="${this.moduleName}Search"
                                   oninput="window.${this.moduleName}Filter?.applyFiltersDebounced()">
                        </div>
                    </div>
                    <div class="filter-group">
                        <input type="date" class="form-input" 
                               id="${this.moduleName}DateFrom"
                               onchange="window.${this.moduleName}Filter?.applyFilters()">
                        <span class="filter-separator">to</span>
                        <input type="date" class="form-input" 
                               id="${this.moduleName}DateTo"
                               onchange="window.${this.moduleName}Filter?.applyFilters()">
                    </div>
                    <div class="filter-group" id="${this.moduleName}ExtraFilters"></div>
                    <div class="filter-actions">
                        <button class="btn btn-primary btn-sm" onclick="window.${this.moduleName}Filter?.applyFilters()">
                            <i class="fas fa-filter"></i> Apply
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="window.${this.moduleName}Filter?.resetFilters()">
                            <i class="fas fa-undo"></i> Reset
                        </button>
                    </div>
                </div>
                <div class="filter-tags" id="${this.moduleName}FilterTags"></div>
            </div>
        `;
    }

    getFilterValues() {
        return {
            search: document.getElementById(`${this.moduleName}Search`)?.value || '',
            dateFrom: document.getElementById(`${this.moduleName}DateFrom`)?.value || '',
            dateTo: document.getElementById(`${this.moduleName}DateTo`)?.value || '',
        };
    }

    applyFilters() {
        const filters = this.getFilterValues();
        const items = db.queryItems(this.moduleName, filters);
        this.updateTable(items);
        this.updateFilterTags(filters);
    }

    applyFiltersDebounced() {
        clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => this.applyFilters(), 300);
    }

    resetFilters() {
        const searchInput = document.getElementById(`${this.moduleName}Search`);
        const dateFrom = document.getElementById(`${this.moduleName}DateFrom`);
        const dateTo = document.getElementById(`${this.moduleName}DateTo`);

        if (searchInput) searchInput.value = '';
        if (dateFrom) dateFrom.value = '';
        if (dateTo) dateTo.value = '';

        const items = db.getCollection(this.moduleName);
        this.updateTable(items);
        this.updateFilterTags({});
    }

    updateFilterTags(filters) {
        const tagsContainer = document.getElementById(`${this.moduleName}FilterTags`);
        if (!tagsContainer) return;

        let tags = [];
        if (filters.search) tags.push({ label: `Search: "${filters.search}"`, key: 'search' });
        if (filters.dateFrom) tags.push({ label: `From: ${filters.dateFrom}`, key: 'dateFrom' });
        if (filters.dateTo) tags.push({ label: `To: ${filters.dateTo}`, key: 'dateTo' });

        tagsContainer.innerHTML = tags.map(tag => `
            <span class="filter-tag">
                ${tag.label}
                <i class="fas fa-times" onclick="window.${this.moduleName}Filter?.removeFilter('${tag.key}')"></i>
            </span>
        `).join('');

        tagsContainer.style.display = tags.length > 0 ? 'flex' : 'none';
    }

    removeFilter(key) {
        const input = document.getElementById(`${this.moduleName}${key.charAt(0).toUpperCase() + key.slice(1)}`);
        if (input) input.value = '';
        this.applyFilters();
    }

    updateTable(items) {
        // This should be overridden by the module
        if (window.app) {
            app.renderTable(this.moduleName, items);
        }
    }
}
