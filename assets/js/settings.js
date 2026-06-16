class SettingsModule {
    static render(container) {
        container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">Settings</h2>
            </div>
            <div class="glass-card" style="padding: 24px;">
                <h3 style="margin-bottom: 16px;">Theme Customization</h3>
                <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px;">
                    ${['blue', 'green', 'purple', 'orange', 'red', 'teal'].map(color => `
                        <button class="btn ${document.documentElement.getAttribute('data-accent') === color ? 'btn-primary' : 'btn-secondary'} btn-sm" 
                                onclick="document.documentElement.setAttribute('data-accent', '${color}'); db.updateSettings({accent: '${color}'});">
                            ${color.charAt(0).toUpperCase() + color.slice(1)}
                        </button>
                    `).join('')}
                </div>
                <h3 style="margin-bottom: 16px;">Backup & Restore</h3>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-primary" onclick="app.backupData()"><i class="fas fa-download"></i> Backup Data</button>
                    <button class="btn btn-secondary" onclick="app.restoreData()"><i class="fas fa-upload"></i> Restore Data</button>
                </div>
            </div>
        `;
    }
}
