// Notifications Module
class NotificationsManager {
    constructor() {
        this.init();
    }

    init() {
        if (document.getElementById('notificationsList')) {
            this.loadNotifications();
            this.setupEventListeners();
            this.checkForNewNotifications();
        }
    }

    setupEventListeners() {
        // Mark all as read
        const markAllReadBtn = document.getElementById('markAllReadBtn');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => this.markAllAsRead());
        }

        // Clear all
        const clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAll());
        }

        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.mark-read-btn')) {
                const notifId = e.target.closest('.mark-read-btn').dataset.notifId;
                this.markAsRead(notifId);
            }
            if (e.target.closest('.delete-notif-btn')) {
                const notifId = e.target.closest('.delete-notif-btn').dataset.notifId;
                this.deleteNotification(notifId);
            }
        });
    }

    checkForNewNotifications() {
        // Check for low stock items
        const inventory = dataManager.get('inventory') || [];
        const lowStockItems = inventory.filter(item => item.currentStock <= item.minimumStock);
        
        lowStockItems.forEach(item => {
            this.createNotification(
                'Low Stock Alert',
                `${item.name} is running low (${item.currentStock} ${item.unit} remaining)`,
                'warning',
                'inventory'
            );
        });

        // Check for pending test requests
        const testRequests = dataManager.get('testRequests') || [];
        const urgentRequests = testRequests.filter(req => {
            if (req.status !== 'Pending' && req.status !== 'Processing') return false;
            const reqDate = new Date(req.requestedDate);
            const daysDiff = (new Date() - reqDate) / (1000 * 60 * 60 * 24);
            return daysDiff >= 1;
        });

        urgentRequests.forEach(req => {
            this.createNotification(
                'Urgent Test Request',
                `Test request ${req.requestId} for ${req.patientName} is pending`,
                'danger',
                'test-requests'
            );
        });
    }

    createNotification(title, message, type = 'info', category = 'general') {
        const notifications = dataManager.get('notifications') || [];
        
        // Check if notification already exists
        const exists = notifications.some(n => 
            n.title === title && n.message === message && !n.read
        );
        
        if (exists) return;

        const notification = {
            id: dataManager.generateId('NOTIF'),
            title,
            message,
            type,
            category,
            read: false,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            time: new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };

        notifications.unshift(notification);
        // Keep only last 100 notifications
        if (notifications.length > 100) {
            notifications.splice(100);
        }
        dataManager.set('notifications', notifications);
        
        // Show browser notification if page is visible
        if (document.visibilityState === 'visible') {
            dataManager.showNotification(message, type);
        }
    }

    loadNotifications() {
        const notifications = dataManager.get('notifications') || [];
        const sorted = notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        this.renderNotifications(sorted);
        this.updateUnreadCount();
    }

    renderNotifications(notifications) {
        const container = document.getElementById('notificationsList');
        if (!container) return;

        if (notifications.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-8">No notifications</p>';
            return;
        }

        const unreadCount = notifications.filter(n => !n.read).length;

        container.innerHTML = `
            <div class="notifications-header">
                <h3>Notifications</h3>
                <p class="text-sm text-gray-500">${unreadCount} unread</p>
            </div>
            ${notifications.map(notif => `
                <div class="notification-item ${notif.read ? 'read' : 'unread'}">
                    <div class="notification-icon notification-${notif.type}">
                        ${notif.type === 'success' ? '✓' : notif.type === 'warning' ? '⚠' : notif.type === 'danger' ? '!' : 'ℹ'}
                    </div>
                    <div class="notification-content">
                        <h4>${notif.title}</h4>
                        <p>${notif.message}</p>
                        <p class="notification-time">${notif.date} • ${notif.time}</p>
                    </div>
                    <div class="notification-actions">
                        ${!notif.read ? `
                            <button class="btn btn-sm btn-outline mark-read-btn" data-notif-id="${notif.id}">Mark Read</button>
                        ` : ''}
                        <button class="btn btn-sm btn-danger delete-notif-btn" data-notif-id="${notif.id}">Delete</button>
                    </div>
                </div>
            `).join('')}
        `;
    }

    markAsRead(notifId) {
        const notifications = dataManager.get('notifications') || [];
        const notifIndex = notifications.findIndex(n => n.id === notifId);
        if (notifIndex === -1) return;

        notifications[notifIndex].read = true;
        dataManager.set('notifications', notifications);
        this.loadNotifications();
    }

    markAllAsRead() {
        const notifications = dataManager.get('notifications') || [];
        notifications.forEach(notif => {
            notif.read = true;
        });
        dataManager.set('notifications', notifications);
        this.loadNotifications();
        dataManager.showNotification('All notifications marked as read', 'success');
    }

    deleteNotification(notifId) {
        const notifications = dataManager.get('notifications') || [];
        const filtered = notifications.filter(n => n.id !== notifId);
        dataManager.set('notifications', filtered);
        this.loadNotifications();
        dataManager.showNotification('Notification deleted', 'success');
    }

    clearAll() {
        if (!confirm('Are you sure you want to clear all notifications?')) return;
        dataManager.set('notifications', []);
        this.loadNotifications();
        dataManager.showNotification('All notifications cleared', 'success');
    }

    updateUnreadCount() {
        const notifications = dataManager.get('notifications') || [];
        const unreadCount = notifications.filter(n => !n.read).length;
        
        // Update badge in sidebar
        const badge = document.querySelector('.sidebar-nav .nav-item[href="notifications.html"] .nav-badge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    }
}

// Initialize notifications manager
document.addEventListener('DOMContentLoaded', () => {
    new NotificationsManager();
});

// Auto-check for notifications every 5 minutes
setInterval(() => {
    const manager = new NotificationsManager();
    manager.checkForNewNotifications();
}, 5 * 60 * 1000);

