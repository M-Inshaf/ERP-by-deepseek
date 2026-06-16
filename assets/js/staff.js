/**
 * Hummingbird ERP - Staff Management
 */

class StaffModule {
    static render(container) {
        const staff = db.getCollection('staff');
        
        container.innerHTML = `
            <div class="module-header">
                <div>
                    <h2 class="module-title">Staff Management</h2>
                    <p class="module-subtitle">Employee records and contact information</p>
                </div>
                <div class="module-actions">
                    <button class="btn btn-primary btn-lift btn-glow" onclick="StaffModule.showAddForm()">
                        <i class="fas fa-user-plus"></i> Add Staff
                    </button>
                </div>
            </div>

            <!-- Staff Cards Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;" id="staffGrid">
                ${staff.length === 0 ? `
                    <div class="glass-card" style="padding: 60px; text-align: center; grid-column: 1/-1;">
                        <i class="fas fa-users" style="font-size: 4rem; opacity: 0.2; color: var(--accent-color);"></i>
                        <h3 style="margin-top: 16px;">No Staff Members</h3>
                        <p style="color: var(--text-tertiary);">Add your first staff member to get started</p>
                    </div>
                ` : staff.map(member => `
                    <div class="glass-card card-glow" style="padding: 24px; position: relative;">
                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                            <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: 700;">
                                ${(member.name || 'S')[0].toUpperCase()}
                            </div>
                            <div>
                                <h4 style="font-weight: 700;">${member.name || 'Unknown'}</h4>
                                <span class="status-badge ${member.status === 'active' ? 'active' : 'draft'}">${member.status || 'Active'}</span>
                            </div>
                        </div>
                        
                        <div style="display: grid; gap: 8px; font-size: 0.85rem;">
                            ${member.role ? `<div><i class="fas fa-briefcase" style="color: var(--text-tertiary); width: 20px;"></i> ${member.role}</div>` : ''}
                            ${member.phone ? `<div><i class="fas fa-phone" style="color: var(--text-tertiary); width: 20px;"></i> ${member.phone}</div>` : ''}
                            ${member.email ? `<div><i class="fas fa-envelope" style="color: var(--text-tertiary); width: 20px;"></i> ${member.email}</div>` : ''}
                            ${member.joinedDate ? `<div><i class="fas fa-calendar" style="color: var(--text-tertiary); width: 20px;"></i> Joined: ${new Date(member.joinedDate).toLocaleDateString()}</div>` : ''}
                        </div>

                        <div style="display: flex; gap: 8px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                            <button class="btn btn-secondary btn-sm" onclick="StaffModule.viewStaff('${member.id}')" style="flex:1;">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn btn-primary btn-sm" onclick="StaffModule.editStaff('${member.id}')" style="flex:1;">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn-icon-sm btn-delete" onclick="app.deleteItem('staff','${member.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    static showAddForm(editId = null) {
        const member = editId ? db.getItem('staff', editId) : null;
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        container.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-${editId ? 'user-edit' : 'user-plus'}"></i> ${editId ? 'Edit' : 'Add'} Staff Member</h3>
                <button class="btn-close" onclick="app.closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="staffForm" onsubmit="StaffModule.saveStaff(event, '${editId || ''}')">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Full Name <span class="required">*</span></label>
                            <input type="text" class="form-input" name="name" value="${member?.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Role / Designation</label>
                            <input type="text" class="form-input" name="role" value="${member?.role || ''}" placeholder="e.g., Cutter, Tailor, Supervisor">
                        </div>
                        <div class="form-group">
                            <label>Phone</label>
                            <input type="text" class="form-input" name="phone" value="${member?.phone || ''}">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" class="form-input" name="email" value="${member?.email || ''}">
                        </div>
                        <div class="form-group">
                            <label>Joined Date</label>
                            <input type="date" class="form-input" name="joinedDate" value="${member?.joinedDate || new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select class="form-input form-select" name="status">
                                <option value="active" ${member?.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="inactive" ${member?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                <option value="on-leave" ${member?.status === 'on-leave' ? 'selected' : ''}>On Leave</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Salary (Rs.)</label>
                            <input type="number" class="form-input" name="salary" value="${member?.salary || ''}" min="0" step="0.01">
                        </div>
                        <div class="form-group full-width">
                            <label>Address</label>
                            <textarea class="form-input" name="address" rows="2">${member?.address || ''}</textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary" type="submit" form="staffForm">${editId ? 'Update' : 'Save'} Staff</button>
            </div>
        `;

        overlay.classList.add('active');
        overlay.style.display = 'flex';
    }

    static saveStaff(event, editId) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        data.salary = parseFloat(data.salary) || 0;

        if (editId) {
            db.updateItem('staff', editId, data);
            app.showToast('Staff updated!', 'success');
        } else {
            db.addItem('staff', data);
            app.showToast('Staff added!', 'success');
        }

        app.closeModal();
        const container = document.getElementById('moduleContainer');
        if (container) StaffModule.render(container);
    }

    static viewStaff(id) {
        app.viewItem('staff', id);
    }

    static editStaff(id) {
        StaffModule.showAddForm(id);
    }
}
