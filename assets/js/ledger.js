class LedgerModule {
    static render(container) {
        container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">Ledger</h2>
            </div>
            <div class="glass-card" style="padding: 40px; text-align: center;">
                <i class="fas fa-book" style="font-size: 4rem; color: var(--accent-color); opacity: 0.3;"></i>
                <h3 style="margin-top: 16px;">Double-Entry Ledger</h3>
                <p style="color: var(--text-tertiary);">Automated ledger entries from all modules coming soon.</p>
            </div>
        `;
    }

    static autoCreateEntry(source, data) {
        const entry = {
            source: source,
            reference: data.badgeId || data.id,
            description: `Auto-entry from ${source}`,
            debit: data.totalCost || 0,
            credit: 0,
            date: new Date().toISOString(),
        };
        db.addItem('ledger', entry);
    }
}
