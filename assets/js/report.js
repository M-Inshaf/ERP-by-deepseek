class ReportsModule {
    static render(container) {
        container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">Reports & Analytics</h2>
            </div>
            <div class="glass-card" style="padding: 40px; text-align: center;">
                <i class="fas fa-chart-bar" style="font-size: 4rem; color: var(--accent-color); opacity: 0.3;"></i>
                <h3 style="margin-top: 16px;">Reports Module</h3>
                <p style="color: var(--text-tertiary);">Comprehensive reports and analytics coming soon.</p>
            </div>
        `;
    }
}
