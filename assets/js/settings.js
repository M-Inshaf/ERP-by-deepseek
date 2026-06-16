/**
 * Hummingbird ERP - Settings Module
 * Theme • Accent • Backup • Company Info
 */
console.log('⚙️ settings.js loaded');

class SettingsModule {
    static render(container) {
        const settings = db.getSettings();
        const currentAccent = document.documentElement.getAttribute('data-accent') || 'blue';
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        
        container.innerHTML = `
            <div style="margin-bottom: 20px;">
                <button class="btn btn-secondary btn-lift" onclick="app.navigateTo('dashboard')">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </button>
            </div>

            <div style="display: grid; gap: 24px; max-width: 900px;">
                
                <!-- Theme Settings -->
                <div class="glass-card" style="padding: 24px;">
                    <h3 style="margin-bottom: 16px;"><i class="fas fa-palette" style="color: var(--accent-color);"></i> Theme Settings</h3>
                    <div style="margin-bottom: 20px;">
                        <label style="font-weight: 600; display: block; margin-bottom: 8px;">Display Mode</label>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn ${currentTheme === 'light' ? 'btn-primary' : 'btn-secondary'} btn-lift" 
                                    onclick="SettingsModule.setTheme('light')" style="flex:1;">
                                <i class="fas fa-sun"></i> Light Mode
                            </button>
                            <button class="btn ${currentTheme === 'dark' ? 'btn-primary' : 'btn-secondary'} btn-lift" 
                                    onclick="SettingsModule.setTheme('dark')" style="flex:1;">
                                <i class="fas fa-moon"></i> Dark Mode
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Accent Colors -->
                <div class="glass-card" style="padding: 24px;">
                    <h3 style="margin-bottom: 16px;"><i class="fas fa-swatchbook" style="color: var(--accent-color);"></i> Accent Color</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                        ${[
                            { name: 'Blue', color: 'blue', bg: '#3b82f6' },
                            { name: 'Green', color: 'green', bg: '#10b981' },
                            { name: 'Purple', color: 'purple', bg: '#8b5cf6' },
                            { name: 'Orange', color: 'orange', bg: '#f97316' },
                            { name: 'Red', color: 'red', bg: '#ef4444' },
                            { name: 'Teal', color: 'teal', bg: '#14b8a6' },
                        ].map(accent => `
                            <button class="btn ${currentAccent === accent.color ? 'btn-primary' : 'btn-secondary'} btn-lift" 
                                    onclick="SettingsModule.setAccent('${accent.color}')"
                                    style="display: flex; align-items: center; gap: 8px; justify-content: center;">
                                <span style="width: 16px; height: 16px; border-radius: 50%; background: ${accent.bg}; display: inline-block;"></span>
                                ${accent.name}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Backup & Restore -->
                <div class="glass-card" style="padding: 24px;">
                    <h3 style="margin-bottom: 16px;"><i class="fas fa-database" style="color: var(--accent-color);"></i> Data Management</h3>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <button class="btn btn-primary btn-lift" onclick="app.backupData()">
                            <i class="fas fa-download"></i> Backup All Data
                        </button>
                        <button class="btn btn-secondary btn-lift" onclick="app.restoreData()">
                            <i class="fas fa-upload"></i> Restore Data
                        </button>
                    </div>
                </div>

                <!-- Company Info -->
                <div class="glass-card" style="padding: 24px;">
                    <h3 style="margin-bottom: 16px;"><i class="fas fa-building" style="color: var(--accent-color);"></i> Company Information</h3>
                    <form onsubmit="SettingsModule.saveCompanyInfo(event)" style="display: grid; gap: 16px;">
                        <div class="form-group">
                            <label>Company Name</label>
                            <input type="text" class="form-input" id="companyName" value="${settings.companyName || 'FujiSan Lanka Pvt Ltd'}">
                        </div>
                        <div class="form-group">
                            <label>Brand Name</label>
                            <input type="text" class="form-input" id="brandName" value="${settings.brand || 'Hummingbird Clothing'}">
                        </div>
                        <button type="submit" class="btn btn-primary btn-lift">
                            <i class="fas fa-save"></i> Save Company Info
                        </button>
                    </form>
                </div>

                <!-- System Info -->
                <div class="glass-card" style="padding: 24px;">
                    <h3 style="margin-bottom: 16px;"><i class="fas fa-info-circle" style="color: var(--accent-color);"></i> System Information</h3>
                    <div style="display: grid; gap: 8px; font-size: 0.9rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Version:</span>
                            <span style="font-weight: 600;">2.0.0</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Platform:</span>
                            <span style="font-weight: 600;">Web Browser</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Storage:</span>
                            <span style="font-weight: 600;">Local JSON</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static setTheme(theme) {
        if (window.app) {
            app.switchTheme(theme);
            // Re-render settings
            const container = document.getElementById('moduleContainer');
            if (container) SettingsModule.render(container);
        }
    }

    static setAccent(accent) {
        console.log('🎨 Setting accent:', accent);
        document.documentElement.setAttribute('data-accent', accent);
        
        try {
            db.updateSettings({ accent: accent });
        } catch(e) {}
        
        localStorage.setItem('hummingbird_accent', accent);
        
        if (window.app) {
            app.showToast(`Accent: ${accent}`, 'success');
        }
        
        // Re-render settings
        const container = document.getElementById('moduleContainer');
        if (container) SettingsModule.render(container);
    }

    static saveCompanyInfo(event) {
        event.preventDefault();
        const companyName = document.getElementById('companyName').value;
        const brandName = document.getElementById('brandName').value;
        
        db.updateSettings({ companyName, brand: brandName });
        
        if (window.app) {
            app.showToast('Company info saved!', 'success');
        }
    }
}
