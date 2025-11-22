// Dashboard Module
class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        if (document.getElementById('dashboard')) {
            this.loadDashboard();
        }
    }

    loadDashboard() {
        this.updateSummaryCards();
        this.loadRecentTestRequests();
        this.loadLowStockAlerts();
    }

    updateSummaryCards() {
        const today = new Date().toDateString();
        const testRequests = dataManager.get('testRequests') || [];
        const transactions = dataManager.get('transactions') || [];
        const inventory = dataManager.get('inventory') || [];

        // Test Requests Today
        const todayRequests = testRequests.filter(req => {
            const reqDate = new Date(req.requestedDate).toDateString();
            return reqDate === today;
        });
        document.getElementById('testRequestsToday').textContent = todayRequests.length;

        // Pending Results
        const pendingResults = testRequests.filter(req => req.status === 'Pending' || req.status === 'Processing');
        const urgentPending = pendingResults.filter(req => {
            const reqDate = new Date(req.requestedDate);
            const daysDiff = (new Date() - reqDate) / (1000 * 60 * 60 * 24);
            return daysDiff >= 1;
        });
        document.getElementById('pendingResults').textContent = pendingResults.length;
        const urgentText = document.querySelector('.urgent-text');
        if (urgentText) {
            urgentText.textContent = `${urgentPending.length} urgent`;
        }

        // Low Stock Items
        const lowStockItems = inventory.filter(item => {
            return item.currentStock <= item.minimumStock;
        });
        document.getElementById('lowStockItems').textContent = lowStockItems.length;

        // Today's Revenue
        const todayTransactions = transactions.filter(txn => {
            const txnDate = new Date(txn.date).toDateString();
            return txnDate === today && txn.status === 'Paid';
        });
        const todayRevenue = todayTransactions.reduce((sum, txn) => sum + parseFloat(txn.amount), 0);
        document.getElementById('todayRevenue').textContent = dataManager.formatCurrency(todayRevenue);
    }

    loadRecentTestRequests() {
        const requests = dataManager.get('testRequests') || [];
        const recentRequests = requests
            .sort((a, b) => new Date(b.requestedDate) - new Date(a.requestedDate))
            .slice(0, 3);

        const container = document.getElementById('recentRequests');
        if (!container) return;

        if (recentRequests.length === 0) {
            container.innerHTML = '<p class="text-gray-500">No recent test requests</p>';
            return;
        }

        container.innerHTML = recentRequests.map(req => `
            <div class="request-item">
                <div class="request-info">
                    <h4>${req.patientName}</h4>
                    <p class="test-type">${req.testType}</p>
                    <p class="request-meta">${req.requestId} • ${dataManager.formatTime(req.requestedDate)}</p>
                </div>
                <span class="status-badge status-${req.status.toLowerCase()}">${req.status}</span>
            </div>
        `).join('');
    }

    loadLowStockAlerts() {
        const inventory = dataManager.get('inventory') || [];
        const lowStockItems = inventory
            .filter(item => item.currentStock <= item.minimumStock)
            .slice(0, 3);

        const container = document.getElementById('lowStockAlerts');
        if (!container) return;

        if (lowStockItems.length === 0) {
            container.innerHTML = '<p class="text-gray-500">All items are well stocked</p>';
            return;
        }

        container.innerHTML = lowStockItems.map(item => {
            const stockInLogs = dataManager.get('stockInLogs') || [];
            const lastUpdate = stockInLogs
                .filter(log => log.items.some(i => i.itemId === item.id))
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

            return `
                <div class="stock-alert-item">
                    <div class="stock-info">
                        <h4>${item.name}</h4>
                        <p>Minimum: ${item.minimumStock} ${item.unit}</p>
                        ${lastUpdate ? `<p class="text-sm text-gray-500">Last updated by: ${lastUpdate.staffName} • ${dataManager.formatDate(lastUpdate.date)}</p>` : ''}
                    </div>
                    <span class="stock-badge">${item.currentStock} left</span>
                </div>
            `;
        }).join('');
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});

