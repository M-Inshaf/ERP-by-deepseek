/**
 * Hummingbird ERP - Storage Engine v3.0
 * Soft Delete • Audit Trail • Auto Backup • Schema Validation • Recycle Bin
 */
console.log('💾 storage.js loading...');

class StorageEngine {
    constructor() {
        this.dbName = 'hummingbird_erp';
        this.version = '3.0.0';
        this.maxStorageMB = 4.5;
        this.initializeDatabase();
        this.runMigrations();
        this.validateAllCollections();
        this.scheduleAutoBackup();
    }

    initializeDatabase() {
        const schemas = {
            customers: { name: '', phone: '', email: '', address: '', code: '', status: 'active', deleted: false, deletedAt: null, history: [] },
            suppliers: { name: '', phone: '', email: '', address: '', code: '', status: 'active', deleted: false, deletedAt: null, history: [] },
            inventory: { name: '', category: '', quantity: 0, unit: 'pcs', unitCost: 0, minStock: 10, deleted: false, deletedAt: null, history: [] },
            fabric: { name: '', type: '', color: '', width: '', stock: 0, costPerMeter: 0, supplier: '', notes: '', deleted: false, deletedAt: null, history: [] },
            accessories: { name: '', description: '', unit: 'pcs', quantity: 0, unitCost: 0, deleted: false, deletedAt: null, history: [] },
            subGarmentAgents: { name: '', phone: '', address: '', notes: '', cuttingEntries: [], finishingEntries: [], ledgerEntries: [], deleted: false, deletedAt: null, history: [] },
            production: { badgeId: '', customer: '', style: '', colour: '', cutQty: 0, producedQty: 0, completedQty: 0, damageQty: 0, rejectQty: 0, reworkQty: 0, fabricCost: 0, accessoriesCost: 0, cuttingCost: 0, totalCost: 0, status: 'in-progress', deleted: false, deletedAt: null, history: [] },
            finishing: { badgeId: '', receivedQty: 0, finishedQty: 0, damagedQty: 0, rejectedQty: 0, deleted: false, deletedAt: null, history: [] },
            payments: { type: '', party: '', amount: 0, method: '', date: '', reference: '', deleted: false, deletedAt: null, history: [] },
            ledger: { date: '', type: '', reference: '', description: '', amount: 0, source: '', deleted: false, deletedAt: null, history: [] },
            expenses: { date: '', category: '', amount: 0, paymentMethod: '', reference: '', status: 'pending', description: '', deleted: false, deletedAt: null, history: [] },
            cheques: { chequeNo: '', date: '', bank: '', amount: 0, payee: '', status: 'pending', clearanceDate: '', relatedTo: '', deleted: false, deletedAt: null, history: [] },
            staff: { name: '', role: '', phone: '', email: '', joinedDate: '', status: 'active', salary: 0, address: '', deleted: false, deletedAt: null, history: [] },
            settings: { companyName: 'FujiSan Lanka Pvt Ltd', brand: 'Hummingbird Clothing', theme: 'light', accent: 'blue', badgePrefix: 'HB', currentYear: 2026, lastBadgeNumber: 0, lastBackup: null },
            metadata: { version: this.version, createdAt: new Date().toISOString(), lastBackup: null },
            auditLog: [],
            recycleBin: []
        };

        Object.keys(schemas).forEach(key => {
            if (!localStorage.getItem(`${this.dbName}_${key}`)) {
                localStorage.setItem(`${this.dbName}_${key}`, JSON.stringify(key === 'settings' || key === 'metadata' ? schemas[key] : []));
            }
        });
    }

    runMigrations() {
        const metadata = this.getCollection('metadata');
        if (metadata.version !== this.version) {
            console.log('🔄 Running migrations to v' + this.version);
            this.backup('auto_migration');
            metadata.version = this.version;
            this.saveCollection('metadata', metadata);
        }
    }

    validateAllCollections() {
        const collections = ['customers','suppliers','inventory','fabric','accessories','subGarmentAgents','production','finishing','payments','ledger','expenses','cheques','staff'];
        let issues = 0;
        collections.forEach(col => {
            try {
                const items = this.getCollection(col);
                if (!Array.isArray(items)) {
                    this.saveCollection(col, []);
                    issues++;
                }
            } catch(e) {
                this.saveCollection(col, []);
                issues++;
            }
        });
        if (issues > 0) console.warn('⚠️ Fixed ' + issues + ' collection issues');
    }

    checkStorageLimit() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key) && key.startsWith(this.dbName)) {
                total += localStorage.getItem(key).length;
            }
        }
        const usedMB = total / (1024 * 1024);
        if (usedMB > this.maxStorageMB) {
            throw new Error(`Storage limit reached (${usedMB.toFixed(1)}MB). Please backup and clear old data.`);
        }
        return usedMB;
    }

    getCollection(collection) {
        try {
            const data = localStorage.getItem(`${this.dbName}_${collection}`);
            return data ? JSON.parse(data) : [];
        } catch(e) {
            console.error(`Error reading ${collection}:`, e);
            return [];
        }
    }

    getActiveItems(collection) {
        return this.getCollection(collection).filter(item => !item.deleted);
    }

    getItem(collection, id) {
        return this.getCollection(collection).find(item => item.id === id) || null;
    }

    addItem(collection, item) {
        this.checkStorageLimit();
        const items = this.getCollection(collection);
        const newItem = {
            ...item,
            id: this.generateId(),
            deleted: false,
            deletedAt: null,
            history: [{ action: 'created', timestamp: new Date().toISOString(), data: { ...item } }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        items.push(newItem);
        this.saveCollection(collection, items);
        this.addAuditLog(collection, newItem.id, 'created');
        return newItem;
    }

    updateItem(collection, id, updates) {
        const items = this.getCollection(collection);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            const oldData = { ...items[index] };
            const history = items[index].history || [];
            history.push({ action: 'updated', timestamp: new Date().toISOString(), previous: oldData, changes: updates });
            
            items[index] = {
                ...items[index],
                ...updates,
                history: history,
                updatedAt: new Date().toISOString(),
            };
            this.saveCollection(collection, items);
            this.addAuditLog(collection, id, 'updated', { changes: Object.keys(updates) });
            return items[index];
        }
        return null;
    }

    softDelete(collection, id) {
        const items = this.getCollection(collection);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index].deleted = true;
            items[index].deletedAt = new Date().toISOString();
            items[index].history.push({ action: 'soft_deleted', timestamp: new Date().toISOString() });
            this.saveCollection(collection, items);
            
            // Add to recycle bin
            const bin = this.getCollection('recycleBin');
            bin.push({ collection, id, item: items[index], deletedAt: new Date().toISOString() });
            this.saveCollection('recycleBin', bin);
            
            this.addAuditLog(collection, id, 'deleted');
            return true;
        }
        return false;
    }

    restoreItem(collection, id) {
        const items = this.getCollection(collection);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1 && items[index].deleted) {
            items[index].deleted = false;
            items[index].deletedAt = null;
            items[index].history.push({ action: 'restored', timestamp: new Date().toISOString() });
            this.saveCollection(collection, items);
            
            // Remove from recycle bin
            const bin = this.getCollection('recycleBin').filter(b => !(b.collection === collection && b.id === id));
            this.saveCollection('recycleBin', bin);
            
            this.addAuditLog(collection, id, 'restored');
            return true;
        }
        return false;
    }

    permanentDelete(collection, id) {
        const items = this.getCollection(collection).filter(item => item.id !== id);
        this.saveCollection(collection, items);
        const bin = this.getCollection('recycleBin').filter(b => !(b.collection === collection && b.id === id));
        this.saveCollection('recycleBin', bin);
        this.addAuditLog(collection, id, 'permanently_deleted');
        return true;
    }

    deleteItem(collection, id) {
        return this.softDelete(collection, id);
    }

    saveCollection(collection, data) {
        try {
            localStorage.setItem(`${this.dbName}_${collection}`, JSON.stringify(data));
        } catch(e) {
            console.error(`Error saving ${collection}:`, e);
            if (e.name === 'QuotaExceededError') {
                throw new Error('Storage full. Please backup and clear old data.');
            }
        }
    }

    addAuditLog(collection, recordId, action, metadata = {}) {
        const logs = this.getCollection('auditLog');
        logs.push({
            id: this.generateId(),
            collection,
            recordId,
            action,
            metadata,
            timestamp: new Date().toISOString(),
            user: 'admin'
        });
        // Keep only last 5000 logs
        if (logs.length > 5000) logs.splice(0, logs.length - 5000);
        this.saveCollection('auditLog', logs);
    }

    getAuditLog(collection = null, recordId = null) {
        let logs = this.getCollection('auditLog');
        if (collection) logs = logs.filter(l => l.collection === collection);
        if (recordId) logs = logs.filter(l => l.recordId === recordId);
        return logs;
    }

    getRecycleBin() {
        return this.getCollection('recycleBin');
    }

    cleanRecycleBin(daysOld = 30) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysOld);
        const bin = this.getCollection('recycleBin').filter(b => new Date(b.deletedAt) < cutoff);
        bin.forEach(b => this.permanentDelete(b.collection, b.id));
        return bin.length;
    }

    queryItems(collection, filters = {}) {
        let items = this.getActiveItems(collection);
        if (filters.search) {
            const term = filters.search.toLowerCase();
            items = items.filter(item => JSON.stringify(item).toLowerCase().includes(term));
        }
        if (filters.dateFrom) {
            items = items.filter(item => new Date(item.date || item.createdAt) >= new Date(filters.dateFrom));
        }
        if (filters.dateTo) {
            items = items.filter(item => new Date(item.date || item.createdAt) <= new Date(filters.dateTo));
        }
        return items;
    }

    generateBadgeId() {
        const settings = this.getCollection('settings');
        const year = new Date().getFullYear();
        const nextNumber = settings.lastBadgeNumber + 1;
        const badgeId = `${settings.badgePrefix}-${year}-${String(nextNumber).padStart(6, '0')}`;
        settings.lastBadgeNumber = nextNumber;
        this.saveCollection('settings', settings);
        return badgeId;
    }

    getSettings() { return this.getCollection('settings'); }
    
    updateSettings(updates) {
        const settings = { ...this.getSettings(), ...updates };
        this.saveCollection('settings', settings);
        return settings;
    }

    backup(label = 'manual') {
        const backup = {};
        ['customers','suppliers','inventory','fabric','accessories','subGarmentAgents','production','finishing','payments','ledger','expenses','cheques','staff','settings','metadata','auditLog','recycleBin'].forEach(col => {
            backup[col] = this.getCollection(col);
        });
        backup.backupDate = new Date().toISOString();
        backup.version = this.version;
        backup.label = label;

        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hummingbird_erp_backup_${new Date().toISOString().split('T')[0]}_${label}.json`;
        a.click();
        URL.revokeObjectURL(url);

        const settings = this.getSettings();
        settings.lastBackup = new Date().toISOString();
        this.saveCollection('settings', settings);
        
        return backup;
    }

    restore(backupFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    // Backup current state first
                    this.backup('pre_restore');
                    Object.keys(backup).forEach(key => {
                        if (key !== 'backupDate' && key !== 'version' && key !== 'label') {
                            this.saveCollection(key, backup[key]);
                        }
                    });
                    resolve(true);
                } catch(error) { reject(error); }
            };
            reader.onerror = reject;
            reader.readAsText(backupFile);
        });
    }

    scheduleAutoBackup() {
        const settings = this.getSettings();
        const lastBackup = settings.lastBackup ? new Date(settings.lastBackup) : null;
        const now = new Date();
        if (!lastBackup || (now - lastBackup) > 24 * 60 * 60 * 1000) {
            this.backup('auto_daily');
        }
        // Check every hour
        setTimeout(() => this.scheduleAutoBackup(), 60 * 60 * 1000);
    }

    clearAll() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.dbName)) localStorage.removeItem(key);
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
}

const db = new StorageEngine();
console.log('💾 Storage engine ready - v3.0');
