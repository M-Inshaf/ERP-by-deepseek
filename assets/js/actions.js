/**
 * Hummingbird ERP - Universal Action Buttons
 * View • Edit • Delete • Print • PDF
 */

class ActionsEngine {
    static getButtons(collection, itemId, extraButtons = []) {
        return `
            <div class="actions-cell">
                <button class="btn-icon-sm btn-view" onclick="ActionsEngine.viewItem('${collection}', '${itemId}')" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon-sm btn-edit" onclick="ActionsEngine.editItem('${collection}', '${itemId}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                ${extraButtons.map(btn => `
                    <button class="btn-icon-sm ${btn.class || ''}" onclick="${btn.onclick}" title="${btn.title || ''}">
                        <i class="fas ${btn.icon}"></i>
                    </button>
                `).join('')}
                <button class="btn-icon-sm btn-delete" onclick="ActionsEngine.deleteItem('${collection}', '${itemId}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    static viewItem(collection, id) {
        const item = db.getItem(collection, id);
        if (!item) {
            app.showToast('Record not found', 'error');
            return;
        }

        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');

        const excludeKeys = ['id', 'updatedAt'];
        const details = Object.keys(item)
            .filter(key => !excludeKeys.includes(key))
            .map(key => {
                let value = item[key];
                if (typeof value === 'object') value = JSON.stringify(value, null, 2);
                if (key === 'createdAt') value = new Date(value).toLocaleString();
                return { key: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()), value };
            });

        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-eye"></i> View Record</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <table style="width: 100%; border-collapse: collapse;">
                    ${details.map(d => `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 10px 16px; font-weight: 600; color: var(--text-secondary); width: 40%;">${d.key}</td>
                            <td style="padding: 10px 16px; color: var(--text-primary);">${d.value || '-'}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
            </div>
        `;

        overlay.classList.add('active');
    }

    static editItem(collection, id) {
        app.editItem(collection, id);
    }

    static deleteItem(collection, id) {
        app.deleteItem(collection, id);
    }
}
