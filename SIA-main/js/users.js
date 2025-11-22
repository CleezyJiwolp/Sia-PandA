// User Management Module
class UserManager {
    constructor() {
        this.init();
    }

    init() {
        if (document.getElementById('usersList')) {
            this.loadUsers();
            this.updateSummaryCards();
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Add new user button
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.showAddUserModal());
        }

        // Search
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterUsers(e.target.value));
        }

        // Role filter
        const roleFilter = document.getElementById('roleFilter');
        if (roleFilter) {
            roleFilter.addEventListener('change', (e) => this.filterByRole(e.target.value));
        }

        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-user-btn')) {
                const userId = e.target.closest('.edit-user-btn').dataset.userId;
                this.editUser(userId);
            }
            if (e.target.closest('.delete-user-btn')) {
                const userId = e.target.closest('.delete-user-btn').dataset.userId;
                this.deleteUser(userId);
            }
        });
    }

    updateSummaryCards() {
        const users = dataManager.get('users') || [];
        const activeUsers = users.filter(u => u.status === 'Active');
        const admins = users.filter(u => u.role === 'Admin');
        const staff = users.filter(u => u.role === 'Laboratory Staff' || u.role === 'Medical Technologist');

        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('activeUsers').textContent = activeUsers.length;
        document.getElementById('administrators').textContent = admins.length;
        document.getElementById('staffMembers').textContent = staff.length;
    }

    loadUsers() {
        const users = dataManager.get('users') || [];
        this.renderUsers(users);
    }

    renderUsers(users) {
        const container = document.getElementById('usersList');
        if (!container) return;

        if (users.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-8">No users found</p>';
            return;
        }

        const roleColors = {
            'Admin': 'blue',
            'Medical Technologist': 'purple',
            'Laboratory Staff': 'green',
            'Cashier': 'orange'
        };

        container.innerHTML = users.map(user => {
            const roleColor = roleColors[user.role] || 'gray';
            const initials = user.name.split(' ').map(n => n[0]).join('');
            
            return `
                <div class="user-card">
                    <div class="user-icon" style="background: var(--${roleColor}-500);">
                        <i class="icon-users"></i>
                    </div>
                    <div class="user-details">
                        <h3>${user.name}</h3>
                        <div class="user-badges">
                            <span class="role-badge role-${roleColor}">${user.role}</span>
                            <span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span>
                        </div>
                        <div class="user-info">
                            <p><strong>Username:</strong> ${user.username}</p>
                            <p><strong>Email:</strong> ${user.email}</p>
                            <p><strong>ID:</strong> ${user.id}</p>
                            <p><strong>Last login:</strong> ${user.lastLogin ? dataManager.formatDateTime(user.lastLogin) : 'Never'}</p>
                            <p><strong>Created:</strong> ${dataManager.formatDate(user.createdAt)}</p>
                        </div>
                    </div>
                    <div class="user-actions">
                        <button class="btn btn-outline edit-user-btn" data-user-id="${user.id}">
                            <i class="icon-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger delete-user-btn" data-user-id="${user.id}">
                            <i class="icon-delete"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    showAddUserModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Add New User</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="addUserForm" class="modal-body">
                    <div class="form-group">
                        <label>Full Name *</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Username *</label>
                        <input type="text" name="username" required>
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label>Password *</label>
                        <input type="password" name="password" required minlength="6">
                    </div>
                    <div class="form-group">
                        <label>Role *</label>
                        <select name="role" required>
                            <option value="">Select role</option>
                            <option value="Admin">Admin</option>
                            <option value="Medical Technologist">Medical Technologist</option>
                            <option value="Laboratory Staff">Laboratory Staff</option>
                            <option value="Cashier">Cashier</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status *</label>
                        <select name="status" required>
                            <option value="Active" selected>Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Add User</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('#addUserForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addUser(new FormData(e.target));
            modal.remove();
        });
    }

    addUser(formData) {
        const currentUser = dataManager.getCurrentUser();
        const users = dataManager.get('users') || [];
        
        // Check if username or email already exists
        const username = formData.get('username');
        const email = formData.get('email');
        if (users.some(u => u.username === username || u.email === email)) {
            dataManager.showNotification('Username or email already exists', 'error');
            return;
        }

        const user = {
            id: dataManager.generateUserId(),
            name: formData.get('name'),
            username: username,
            email: email,
            password: formData.get('password'), // In production, hash this
            role: formData.get('role'),
            status: formData.get('status'),
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        users.push(user);
        dataManager.set('users', users);

        // Log activity
        dataManager.logActivity(
            'User Created',
            'User Management',
            `New user created: ${user.name} (${user.role})`,
            currentUser.id,
            currentUser.name,
            currentUser.role,
            { userId: user.id, role: user.role }
        );

        dataManager.showNotification('User added successfully', 'success');
        this.loadUsers();
        this.updateSummaryCards();
    }

    editUser(userId) {
        const users = dataManager.get('users') || [];
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit User</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="editUserForm" class="modal-body">
                    <div class="form-group">
                        <label>Full Name *</label>
                        <input type="text" name="name" value="${user.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Username *</label>
                        <input type="text" name="username" value="${user.username}" required>
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" name="email" value="${user.email}" required>
                    </div>
                    <div class="form-group">
                        <label>New Password (leave blank to keep current)</label>
                        <input type="password" name="password" minlength="6">
                    </div>
                    <div class="form-group">
                        <label>Role *</label>
                        <select name="role" required>
                            <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                            <option value="Medical Technologist" ${user.role === 'Medical Technologist' ? 'selected' : ''}>Medical Technologist</option>
                            <option value="Laboratory Staff" ${user.role === 'Laboratory Staff' ? 'selected' : ''}>Laboratory Staff</option>
                            <option value="Cashier" ${user.role === 'Cashier' ? 'selected' : ''}>Cashier</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status *</label>
                        <select name="status" required>
                            <option value="Active" ${user.status === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="Inactive" ${user.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update User</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('#editUserForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateUser(userId, new FormData(e.target));
            modal.remove();
        });
    }

    updateUser(userId, formData) {
        const currentUser = dataManager.getCurrentUser();
        const users = dataManager.get('users') || [];
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) return;

        const username = formData.get('username');
        const email = formData.get('email');
        
        // Check if username or email already exists (excluding current user)
        if (users.some((u, idx) => idx !== userIndex && (u.username === username || u.email === email))) {
            dataManager.showNotification('Username or email already exists', 'error');
            return;
        }

        const password = formData.get('password');
        users[userIndex] = {
            ...users[userIndex],
            name: formData.get('name'),
            username: username,
            email: email,
            password: password ? password : users[userIndex].password,
            role: formData.get('role'),
            status: formData.get('status')
        };

        dataManager.set('users', users);

        // Log activity
        dataManager.logActivity(
            'User Updated',
            'User Management',
            `User ${users[userIndex].name} updated`,
            currentUser.id,
            currentUser.name,
            currentUser.role,
            { userId: users[userIndex].id }
        );

        dataManager.showNotification('User updated successfully', 'success');
        this.loadUsers();
        this.updateSummaryCards();
    }

    deleteUser(userId) {
        const currentUser = dataManager.getCurrentUser();
        
        // Prevent deleting own account
        if (userId === currentUser.id) {
            dataManager.showNotification('You cannot delete your own account', 'error');
            return;
        }

        if (!confirm('Are you sure you want to delete this user?')) return;

        const users = dataManager.get('users') || [];
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const filtered = users.filter(u => u.id !== userId);
        dataManager.set('users', filtered);

        // Log activity
        dataManager.logActivity(
            'User Deleted',
            'User Management',
            `User ${user.name} deleted`,
            currentUser.id,
            currentUser.name,
            currentUser.role,
            { userId: user.id }
        );

        dataManager.showNotification('User deleted successfully', 'success');
        this.loadUsers();
        this.updateSummaryCards();
    }

    filterUsers(searchTerm) {
        const users = dataManager.get('users') || [];
        const filtered = users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderUsers(filtered);
    }

    filterByRole(role) {
        const users = dataManager.get('users') || [];
        if (role === 'All Roles') {
            this.renderUsers(users);
        } else {
            const filtered = users.filter(user => user.role === role);
            this.renderUsers(filtered);
        }
    }
}

// Initialize user manager
document.addEventListener('DOMContentLoaded', () => {
    new UserManager();
});

