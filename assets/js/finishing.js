class FinishingModule {
    static render(container) {
        container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">Finishing Management</h2>
            </div>
            <div class="glass-card" style="padding: 40px; text-align: center;">
                <i class="fas fa-check-double" style="font-size: 4rem; color: var(--accent-color); opacity: 0.3;"></i>
                <h3 style="margin-top: 16px;">Finishing Module</h3>
                <p style="color: var(--text-tertiary);">Quality control and finishing tracking coming soon.</p>
            </div>
        `;
    }
}
