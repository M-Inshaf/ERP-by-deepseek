/**
 * Hummingbird Clothing ERP - Storage Engine
 * Local JSON Storage with Backup & Restore
 */

class StorageEngine {
    constructor() {
        this.dbName = 'hummingbird_erp';
        this.initializeDatabase();
    }

    // Initialize database structure
    initializeDatabase() {
        const defaultData = {
            customers: [],
            suppliers: [],
            inventory: [],
            fabric: [],
            accessories: [],
            subGarments: [],
            production: [],
            finishing: [],
            payments: [],
            ledger: [],
            expenses: [],
            cheques: [],
            staff: [],
            settings: {
                companyName: 'FujiSan Lanka Pvt Ltd',
                brand: 'Hummingbird Clothing',
                theme: 'light',
                accent: 'blue',
                badgePrefix: 'HB',
                currentYear: new Date().getFullYear(),
                lastBadgeNumber: 0,
            },
            metadata: {
                version: '2.0.0',
                lastBackup: null,
                createdAt: new Date().toISOString(),
            }
        };

        // Initialize each collection if not exists
        Object.keys(defaultData).forEach(key => {
            if (!localStorage.getItem(`${this.dbName}_${key}`)) {
                localStorage.setItem(`${this.dbName}_${key}`, JSON.stringify(defaultData[key]));
            }
        });
    }

    // Get data from a collection
    getCollection(collection) {
        const data = localStorage.getItem(`${this.dbName}_${collection}`);
        return data ? JSON.parse(data) : [];
    }

    // Get a single item by ID
    getItem(collection, id) {
        const items = this.getCollection(collection);
        return items.find(item => item.id === id) || null;
    }

    // Add item to collection
    addItem(collection, item) {
        const items = this.getCollection(collection);
        const newItem = {
            ...item,
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        items.push(newItem);
        localStorage.setItem(`${this.dbName}_${collection}`, JSON.stringify(items));
        return newItem;
    }

    // Update item in collection
    updateItem(collection, id, updates) {
        const items = this.getCollection(collection);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = {
                ...items[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            localStorage.setItem(`${this.dbName}_${collection}`, JSON.stringify(items));
            return items[index];
        }
        return null;
    }

    // Delete item from collection
    deleteItem(collection, id) {
        const items = this.getCollection(collection);
        const filtered = items.filter(item => item.id !== id);
        localStorage.setItem(`${this.dbName}_${collection}`, JSON.stringify(filtered));
        return true;
    }

    // Query items with filters
    queryItems(collection, filters = {}) {
        let items = this.getCollection(collection);

        // Apply search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            items = items.filter(item => {
                return Object.values(item).some(value => {
                    if (typeof value === 'string') {
                        return value.toLowerCase().includes(searchTerm);
                    }
                    if (typeof value === 'number') {
                        return value.toString().includes(searchTerm);
                    }
                    return false;
                });
            });
        }

        // Apply date range filter
        if (filters.dateFrom || filters.dateTo) {
            items = items.filter(item => {
                const itemDate = new Date(item.createdAt || item.date);
                if (filters.dateFrom && new Date(itemDate) < new Date(filters.dateFrom)) return false;
                if (filters.dateTo && new Date(itemDate) > new Date(filters.dateTo)) return false;
                return true;
            });
        }

        // Apply custom field filters
        Object.keys(filters).forEach(key => {
            if (key !== 'search' && key !== 'dateFrom' && key !== 'dateTo' && filters[key]) {
                items = items.filter(item => {
                    if (typeof filters[key] === 'string') {
                        return item[key] && item[key].toString().toLowerCase().includes(filters[key].toLowerCase());
                    }
                    return item[key] === filters[key];
                });
            }
        });

        return items;
    }

    // Generate auto Badge ID for Sub Garments
    generateBadgeId() {
        const settings = this.getCollection('settings');
        const year = new Date().getFullYear();
        const nextNumber = settings.lastBadgeNumber + 1;
        const badgeId = `${settings.badgePrefix}-${year}-${String(nextNumber).padStart(6, '0')}`;
        
        // Update last badge number
        settings.lastBadgeNumber = nextNumber;
        localStorage.setItem(`${this.dbName}_settings`, JSON.stringify(settings));
        
        return badgeId;
    }

    // Get settings
    getSettings() {
        return this.getCollection('settings');
    }

    // Update settings
    updateSettings(updates) {
        const settings = this.getSettings();
        const updated = { ...settings, ...updates };
        localStorage.setItem(`${this.dbName}_settings`, JSON.stringify(updated));
        return updated;
    }

    // Backup entire database
    backup() {
        const backup = {};
        const collections = [
            'customers', 'suppliers', 'inventory', 'fabric', 'accessories',
            'subGarments', 'production', 'finishing', 'payments', 'ledger',
            'expenses', 'cheques', 'staff', 'settings', 'metadata'
        ];

        collections.forEach(collection => {
            backup[collection] = this.getCollection(collection);
        });

        backup.backupDate = new Date().toISOString();
        backup.version = '2.0.0';

        const backupJson = JSON.stringify(backup, null, 2);
        const blob = new Blob([backupJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hummingbird_erp_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        return backup;
    }

    // Restore database from backup
    restore(backupFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    Object.keys(backup).forEach(key => {
                        if (key !== 'backupDate' && key !== 'version') {
                            localStorage.setItem(`${this.dbName}_${key}`, JSON.stringify(backup[key]));
                        }
                    });
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(backupFile);
        });
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Clear all data (dangerous!)
    clearAll() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.dbName)) {
                localStorage.removeItem(key);
            }
        });
    }
}

// Create global storage instance
const db = new StorageEngine();
