class PaymentsModule {
    static render(container) {
        container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">Payments Management</h2>
            </div>
            <div class="glass-card" style="padding: 40px; text-align: center;">
                <i class="fas fa-money-bill-wave" style="font-size: 4rem; color: var(--accent-color); opacity: 0.3;"></i>
                <h3 style="margin-top: 16px;">Payments Module</h3>
                <p style="color: var(--text-tertiary);">Customer and supplier payment tracking coming soon.</p>
            </div>
        `;
    }
}
