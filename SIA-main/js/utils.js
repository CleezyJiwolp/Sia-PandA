// Utility Functions and Data Management
class DataManager {
    constructor() {
        this.initStorage();
    }

    initStorage() {
        // Initialize localStorage with default data if empty
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                {
                    id: 'USR-001',
                    name: 'Maria Santos',
                    username: 'maria_admin',
                    email: 'maria.santos@pandalab.ph',
                    role: 'Admin',
                    status: 'Active',
                    password: 'admin123', // In production, this should be hashed
                    createdAt: '2024-12-01',
                    lastLogin: null
                },
                {
                    id: 'USR-002',
                    name: 'Juan Dela Cruz',
                    username: 'Staff_Juan',
                    email: 'juan.delacruz@pandalab.ph',
                    role: 'Laboratory Staff',
                    status: 'Active',
                    password: 'staff123',
                    createdAt: '2024-12-05',
                    lastLogin: null
                }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }

        if (!localStorage.getItem('inventory')) {
            localStorage.setItem('inventory', JSON.stringify([]));
        }

        if (!localStorage.getItem('stockInLogs')) {
            localStorage.setItem('stockInLogs', JSON.stringify([]));
        }

        if (!localStorage.getItem('stockOutLogs')) {
            localStorage.setItem('stockOutLogs', JSON.stringify([]));
        }

        if (!localStorage.getItem('testRequests')) {
            localStorage.setItem('testRequests', JSON.stringify([]));
        }

        if (!localStorage.getItem('testResults')) {
            localStorage.setItem('testResults', JSON.stringify([]));
        }

        if (!localStorage.getItem('transactions')) {
            localStorage.setItem('transactions', JSON.stringify([]));
        }

        if (!localStorage.getItem('auditLogs')) {
            localStorage.setItem('auditLogs', JSON.stringify([]));
        }

        if (!localStorage.getItem('notifications')) {
            localStorage.setItem('notifications', JSON.stringify([]));
        }

        if (!localStorage.getItem('favorites')) {
            localStorage.setItem('favorites', JSON.stringify({
                requests: [],
                results: [],
                transactions: []
            }));
        }

        if (!localStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', JSON.stringify(null));
        }
    }

    // Generic get/set methods
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // ID Generators
    generateId(prefix) {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}-${year}-${random}`;
    }

    generateUserId() {
        const users = this.get('users') || [];
        const num = (users.length + 1).toString().padStart(3, '0');
        return `USR-${num}`;
    }

    // Audit Logging
    logActivity(action, module, description, userId, userName, userRole, details = {}) {
        const log = {
            id: this.generateId('LOG'),
            action,
            module,
            description,
            userId,
            userName,
            userRole,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            time: new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            ip: '192.168.1.' + Math.floor(Math.random() * 255), // Simulated IP
            details
        };

        const logs = this.get('auditLogs') || [];
        logs.unshift(log);
        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.splice(1000);
        }
        this.set('auditLogs', logs);
        return log;
    }

    // Date formatting
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    formatDateTime(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatTime(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    // Currency formatting
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    // Get current user
    getCurrentUser() {
        return this.get('currentUser');
    }

    setCurrentUser(user) {
        this.set('currentUser', user);
        if (user) {
            // Update last login
            const users = this.get('users');
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex].lastLogin = new Date().toISOString();
                this.set('users', users);
            }
        }
    }

    // Navigation helper
    navigateTo(page) {
        window.location.href = `../html/${page}.html`;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize global data manager
const dataManager = new DataManager();

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

