class InventoryModule {
    static render(container) {
        container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">Inventory Management</h2>
            </div>
            <div class="glass-card" style="padding: 40px; text-align: center;">
                <i class="fas fa-boxes" style="font-size: 4rem; color: var(--accent-color); opacity: 0.3;"></i>
                <h3 style="margin-top: 16px;">Inventory Module</h3>
                <p style="color: var(--text-tertiary);">Stock management with real-time updates coming soon.</p>
            </div>
        `;
    }
}
