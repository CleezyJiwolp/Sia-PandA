// Audit Trail Module
class AuditManager {
    constructor() {
        this.init();
    }

    init() {
        if (document.getElementById('auditLogsList')) {
            this.loadAuditLogs();
            this.updateSummaryCards();
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('auditSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterLogs(e.target.value));
        }

        // Module filter
        const moduleFilter = document.getElementById('moduleFilter');
        if (moduleFilter) {
            moduleFilter.addEventListener('change', (e) => this.filterByModule(e.target.value));
        }

        // Export button
        const exportBtn = document.getElementById('exportAuditLog');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportLogs());
        }
    }

    updateSummaryCards() {
        const today = new Date().toDateString();
        const logs = dataManager.get('auditLogs') || [];
        
        const todayLogs = logs.filter(log => {
            const logDate = new Date(log.timestamp).toDateString();
            return logDate === today;
        });

        const inventoryChanges = todayLogs.filter(log => log.module === 'Inventory').length;
        const testActivities = todayLogs.filter(log => log.module === 'Test Requests' || log.module === 'Test Results').length;
        const transactions = todayLogs.filter(log => log.module === 'Transaction').length;
        const userLogins = todayLogs.filter(log => log.action === 'Login').length;

        document.getElementById('todayActivities').textContent = todayLogs.length;
        document.getElementById('inventoryChanges').textContent = inventoryChanges;
        document.getElementById('testActivities').textContent = testActivities;
        document.getElementById('transactions').textContent = transactions;
        document.getElementById('userLogins').textContent = userLogins;
    }

    loadAuditLogs() {
        const logs = dataManager.get('auditLogs') || [];
        this.renderLogs(logs);
    }

    renderLogs(logs) {
        const container = document.getElementById('auditLogsList');
        if (!container) return;

        if (logs.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-8">No audit logs found</p>';
            return;
        }

        const actionIcons = {
            'Stock-In': '📥',
            'Stock-Out': '📤',
            'Payment Processed': '💰',
            'Test Request Created': '📋',
            'Test Request Updated': '✏️',
            'Test Request Deleted': '🗑️',
            'Login': '🔐',
            'Logout': '🚪',
            'User Created': '👤',
            'User Updated': '✏️',
            'User Deleted': '🗑️'
        };

        const actionColors = {
            'Stock-In': 'orange',
            'Stock-Out': 'orange',
            'Payment Processed': 'green',
            'Test Request Created': 'blue',
            'Test Request Updated': 'blue',
            'Test Request Deleted': 'red',
            'Login': 'green',
            'Logout': 'gray',
            'User Created': 'purple',
            'User Updated': 'purple',
            'User Deleted': 'red'
        };

        container.innerHTML = logs.map(log => {
            const icon = actionIcons[log.action] || '📝';
            const color = actionColors[log.action] || 'gray';
            
            return `
                <div class="audit-log-item log-${color}">
                    <div class="log-icon">${icon}</div>
                    <div class="log-content">
                        <div class="log-header">
                            <h4>${log.action}</h4>
                            <span class="module-badge">${log.module}</span>
                        </div>
                        <p class="log-description">${log.description}</p>
                        <div class="log-details">
                            <p><strong>User:</strong> ${log.userName} (${log.userRole})</p>
                            <p><strong>Date & Time:</strong> ${log.date} – ${log.time}</p>
                            <p><strong>IP Address:</strong> ${log.ip}</p>
                            <p><strong>Log ID:</strong> ${log.id}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    filterLogs(searchTerm) {
        const logs = dataManager.get('auditLogs') || [];
        const filtered = logs.filter(log =>
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderLogs(filtered);
    }

    filterByModule(module) {
        const logs = dataManager.get('auditLogs') || [];
        if (module === 'All Modules') {
            this.renderLogs(logs);
        } else {
            const filtered = logs.filter(log => log.module === module);
            this.renderLogs(filtered);
        }
    }

    exportLogs() {
        const logs = dataManager.get('auditLogs') || [];
        const headers = ['Log ID', 'Action', 'Module', 'Description', 'User', 'Role', 'Date', 'Time', 'IP Address'];
        const rows = logs.map(log => [
            log.id,
            log.action,
            log.module,
            log.description,
            log.userName,
            log.userRole,
            log.date,
            log.time,
            log.ip
        ]);

        const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        dataManager.showNotification('Audit logs exported successfully', 'success');
    }
}

// Initialize audit manager
document.addEventListener('DOMContentLoaded', () => {
    new AuditManager();
});

