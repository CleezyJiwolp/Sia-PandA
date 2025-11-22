// Inventory Management Module
class InventoryManager {
    constructor() {
        this.init();
    }

    init() {
        if (document.getElementById('inventoryList')) {
            this.loadInventory();
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Add new item button
        const addBtn = document.getElementById('addItemBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddItemModal());
        }

        // Stock In button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.stock-in-btn')) {
                const itemId = e.target.closest('.stock-in-btn').dataset.itemId;
                this.showStockInModal(itemId);
            }
        });

        // Stock Out button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.stock-out-btn')) {
                const itemId = e.target.closest('.stock-out-btn').dataset.itemId;
                this.showStockOutModal(itemId);
            }
        });

        // View logs button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-logs-btn')) {
                const itemId = e.target.closest('.view-logs-btn').dataset.itemId;
                this.showItemLogs(itemId);
            }
        });

        // Search and filter
        const searchInput = document.getElementById('inventorySearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterInventory(e.target.value));
        }

        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => this.filterByCategory(e.target.value));
        }
    }

    loadInventory() {
        const inventory = dataManager.get('inventory') || [];
        const container = document.getElementById('inventoryList');
        if (!container) return;

        // Update low stock alert
        const lowStockCount = inventory.filter(item => item.currentStock <= item.minimumStock).length;
        const alertBanner = document.getElementById('lowStockAlert');
        if (alertBanner) {
            if (lowStockCount > 0) {
                alertBanner.style.display = 'block';
                alertBanner.querySelector('.alert-count').textContent = lowStockCount;
            } else {
                alertBanner.style.display = 'none';
            }
        }

        if (inventory.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-8">No inventory items. Click "Add New Item" to get started.</p>';
            return;
        }

        container.innerHTML = inventory.map(item => {
            const isLowStock = item.currentStock <= item.minimumStock;
            return `
                <div class="inventory-card ${isLowStock ? 'low-stock' : ''}">
                    <div class="inventory-icon">
                        <i class="icon-box"></i>
                    </div>
                    <div class="inventory-details">
                        <h3>${item.name}</h3>
                        <p class="inventory-meta">${item.category} • ${item.id}</p>
                        <div class="inventory-stats">
                            <div>
                                <span class="label">Current Stock:</span>
                                <span class="value">${item.currentStock} ${item.unit}</span>
                            </div>
                            <div>
                                <span class="label">Minimum Stock:</span>
                                <span class="value">${item.minimumStock} ${item.unit}</span>
                            </div>
                            ${item.expirationDate ? `
                                <div>
                                    <span class="label">Expiration:</span>
                                    <span class="value">${dataManager.formatDate(item.expirationDate)}</span>
                                </div>
                            ` : ''}
                            ${item.lotNumber ? `
                                <div>
                                    <span class="label">Lot Number:</span>
                                    <span class="value">${item.lotNumber}</span>
                                </div>
                            ` : ''}
                        </div>
                        <p class="last-updated">Last updated: ${dataManager.formatDateTime(item.lastUpdated)}</p>
                    </div>
                    <div class="inventory-actions">
                        ${isLowStock ? '<span class="status-badge status-low">Low Stock</span>' : ''}
                        <div class="action-buttons">
                            <button class="btn btn-secondary stock-in-btn" data-item-id="${item.id}">
                                <i class="icon-arrow-up"></i> Stock In
                            </button>
                            <button class="btn btn-secondary stock-out-btn" data-item-id="${item.id}">
                                <i class="icon-arrow-down"></i> Stock Out
                            </button>
                            <button class="btn btn-outline view-logs-btn" data-item-id="${item.id}">
                                View Logs
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    showAddItemModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Add New Inventory Item</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="addItemForm" class="modal-body">
                    <div class="form-group">
                        <label>Item Name *</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Category *</label>
                        <select name="category" required>
                            <option value="">Select category</option>
                            <option value="Reagents">Reagents</option>
                            <option value="Medical Supplies">Medical Supplies</option>
                            <option value="Consumables">Consumables</option>
                            <option value="Equipment">Equipment</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Unit *</label>
                        <input type="text" name="unit" placeholder="e.g., pieces, boxes, bottles" required>
                    </div>
                    <div class="form-group">
                        <label>Initial Stock *</label>
                        <input type="number" name="currentStock" min="0" required>
                    </div>
                    <div class="form-group">
                        <label>Minimum Stock *</label>
                        <input type="number" name="minimumStock" min="0" required>
                    </div>
                    <div class="form-group">
                        <label>Expiration Date</label>
                        <input type="date" name="expirationDate">
                    </div>
                    <div class="form-group">
                        <label>Lot Number</label>
                        <input type="text" name="lotNumber">
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea name="notes" rows="3"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Add Item</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('#addItemForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addItem(new FormData(e.target));
            modal.remove();
        });
    }

    addItem(formData) {
        const currentUser = dataManager.getCurrentUser();
        const item = {
            id: dataManager.generateId('INV'),
            name: formData.get('name'),
            category: formData.get('category'),
            unit: formData.get('unit'),
            currentStock: parseInt(formData.get('currentStock')),
            minimumStock: parseInt(formData.get('minimumStock')),
            expirationDate: formData.get('expirationDate') || null,
            lotNumber: formData.get('lotNumber') || null,
            notes: formData.get('notes') || '',
            lastUpdated: new Date().toISOString()
        };

        const inventory = dataManager.get('inventory') || [];
        inventory.push(item);
        dataManager.set('inventory', inventory);

        // Log activity
        dataManager.logActivity(
            'Item Added',
            'Inventory',
            `Added new item: ${item.name}`,
            currentUser.id,
            currentUser.name,
            currentUser.role,
            { itemId: item.id }
        );

        dataManager.showNotification('Item added successfully', 'success');
        this.loadInventory();
    }

    showStockInModal(itemId) {
        const inventory = dataManager.get('inventory') || [];
        const item = inventory.find(i => i.id === itemId);
        if (!item) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Stock In - ${item.name}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="stockInForm" class="modal-body">
                    <div class="form-group">
                        <label>Supplier/Company Name *</label>
                        <input type="text" name="supplierName" required>
                    </div>
                    <div class="form-group">
                        <label>Delivery Receipt No. (DR#) *</label>
                        <input type="text" name="deliveryReceipt" required>
                    </div>
                    <div class="form-group">
                        <label>Invoice No.</label>
                        <input type="text" name="invoiceNo">
                    </div>
                    <div class="form-group">
                        <label>Quantity Received *</label>
                        <input type="number" name="quantity" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>Date of Stock-In *</label>
                        <input type="date" name="date" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label>Expiration Date</label>
                        <input type="date" name="expirationDate">
                    </div>
                    <div class="form-group">
                        <label>Lot Number</label>
                        <input type="text" name="lotNumber">
                    </div>
                    <div class="form-group">
                        <label>Remarks/Notes</label>
                        <textarea name="remarks" rows="3"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Record Stock In</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('#stockInForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processStockIn(itemId, new FormData(e.target));
            modal.remove();
        });
    }

    processStockIn(itemId, formData) {
        const currentUser = dataManager.getCurrentUser();
        const inventory = dataManager.get('inventory') || [];
        const item = inventory.find(i => i.id === itemId);
        if (!item) return;

        const quantity = parseInt(formData.get('quantity'));
        const stockInLog = {
            id: dataManager.generateId('STK-IN'),
            itemId: itemId,
            itemName: item.name,
            quantity: quantity,
            supplierName: formData.get('supplierName'),
            deliveryReceipt: formData.get('deliveryReceipt'),
            invoiceNo: formData.get('invoiceNo') || null,
            date: formData.get('date'),
            expirationDate: formData.get('expirationDate') || null,
            lotNumber: formData.get('lotNumber') || null,
            remarks: formData.get('remarks') || '',
            staffId: currentUser.id,
            staffName: currentUser.name,
            timestamp: new Date().toISOString()
        };

        // Update inventory
        item.currentStock += quantity;
        if (formData.get('expirationDate')) {
            item.expirationDate = formData.get('expirationDate');
        }
        if (formData.get('lotNumber')) {
            item.lotNumber = formData.get('lotNumber');
        }
        item.lastUpdated = new Date().toISOString();

        const itemIndex = inventory.findIndex(i => i.id === itemId);
        inventory[itemIndex] = item;
        dataManager.set('inventory', inventory);

        // Save stock-in log
        const stockInLogs = dataManager.get('stockInLogs') || [];
        stockInLogs.push(stockInLog);
        dataManager.set('stockInLogs', stockInLogs);

        // Log activity
        dataManager.logActivity(
            'Stock-In',
            'Inventory',
            `${quantity} ${item.unit} of ${item.name} added from ${stockInLog.supplierName}`,
            currentUser.id,
            currentUser.name,
            currentUser.role,
            { itemId, quantity, deliveryReceipt: stockInLog.deliveryReceipt }
        );

        dataManager.showNotification('Stock-in recorded successfully', 'success');
        this.loadInventory();
    }

    showStockOutModal(itemId) {
        const inventory = dataManager.get('inventory') || [];
        const item = inventory.find(i => i.id === itemId);
        if (!item) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Stock Out - ${item.name}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="stockOutForm" class="modal-body">
                    <div class="form-group">
                        <label>Quantity Used *</label>
                        <input type="number" name="quantity" min="1" max="${item.currentStock}" required>
                        <small>Available: ${item.currentStock} ${item.unit}</small>
                    </div>
                    <div class="form-group">
                        <label>Purpose *</label>
                        <select name="purpose" required>
                            <option value="">Select purpose</option>
                            <option value="Hematology">Hematology</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Serology">Serology</option>
                            <option value="Urinalysis">Urinalysis</option>
                            <option value="Microscopy">Microscopy</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date and Time *</label>
                        <input type="datetime-local" name="dateTime" value="${new Date().toISOString().slice(0, 16)}" required>
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea name="notes" rows="3"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Record Stock Out</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('#stockOutForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processStockOut(itemId, new FormData(e.target));
            modal.remove();
        });
    }

    processStockOut(itemId, formData) {
        const currentUser = dataManager.getCurrentUser();
        const inventory = dataManager.get('inventory') || [];
        const item = inventory.find(i => i.id === itemId);
        if (!item) return;

        const quantity = parseInt(formData.get('quantity'));
        if (quantity > item.currentStock) {
            dataManager.showNotification('Insufficient stock', 'error');
            return;
        }

        const stockOutLog = {
            id: dataManager.generateId('STK-OUT'),
            itemId: itemId,
            itemName: item.name,
            quantity: quantity,
            purpose: formData.get('purpose'),
            dateTime: formData.get('dateTime'),
            notes: formData.get('notes') || '',
            staffId: currentUser.id,
            staffName: currentUser.name,
            timestamp: new Date().toISOString()
        };

        // Update inventory
        item.currentStock -= quantity;
        item.lastUpdated = new Date().toISOString();

        const itemIndex = inventory.findIndex(i => i.id === itemId);
        inventory[itemIndex] = item;
        dataManager.set('inventory', inventory);

        // Save stock-out log
        const stockOutLogs = dataManager.get('stockOutLogs') || [];
        stockOutLogs.push(stockOutLog);
        dataManager.set('stockOutLogs', stockOutLogs);

        // Log activity
        dataManager.logActivity(
            'Stock-Out',
            'Inventory',
            `${quantity} ${item.unit} of ${item.name} used for ${stockOutLog.purpose}`,
            currentUser.id,
            currentUser.name,
            currentUser.role,
            { itemId, quantity, purpose: stockOutLog.purpose }
        );

        dataManager.showNotification('Stock-out recorded successfully', 'success');
        this.loadInventory();
    }

    showItemLogs(itemId) {
        const inventory = dataManager.get('inventory') || [];
        const item = inventory.find(i => i.id === itemId);
        if (!item) return;

        const stockInLogs = (dataManager.get('stockInLogs') || []).filter(log => log.itemId === itemId);
        const stockOutLogs = (dataManager.get('stockOutLogs') || []).filter(log => log.itemId === itemId);
        const allLogs = [...stockInLogs, ...stockOutLogs].sort((a, b) => 
            new Date(b.timestamp || b.date || b.dateTime) - new Date(a.timestamp || a.date || a.dateTime)
        );

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>Usage History - ${item.name}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="logs-container">
                        ${allLogs.length === 0 ? '<p class="text-center text-gray-500">No logs available</p>' : ''}
                        ${allLogs.map(log => {
                            const isStockIn = log.deliveryReceipt !== undefined;
                            return `
                                <div class="log-item ${isStockIn ? 'log-stock-in' : 'log-stock-out'}">
                                    <div class="log-icon">${isStockIn ? '📥' : '📤'}</div>
                                    <div class="log-content">
                                        <h4>${isStockIn ? 'Stock In' : 'Stock Out'}</h4>
                                        <p><strong>Quantity:</strong> ${log.quantity} ${item.unit}</p>
                                        ${isStockIn ? `
                                            <p><strong>Supplier:</strong> ${log.supplierName}</p>
                                            <p><strong>DR#:</strong> ${log.deliveryReceipt}</p>
                                            ${log.invoiceNo ? `<p><strong>Invoice#:</strong> ${log.invoiceNo}</p>` : ''}
                                        ` : `
                                            <p><strong>Purpose:</strong> ${log.purpose}</p>
                                        `}
                                        <p><strong>Date:</strong> ${dataManager.formatDateTime(log.date || log.dateTime || log.timestamp)}</p>
                                        <p><strong>By:</strong> ${log.staffName}</p>
                                        ${log.remarks || log.notes ? `<p><strong>Notes:</strong> ${log.remarks || log.notes}</p>` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary modal-close-btn">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.remove());
    }

    filterInventory(searchTerm) {
        const inventory = dataManager.get('inventory') || [];
        const filtered = inventory.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderInventory(filtered);
    }

    filterByCategory(category) {
        const inventory = dataManager.get('inventory') || [];
        if (category === 'All Categories') {
            this.renderInventory(inventory);
        } else {
            const filtered = inventory.filter(item => item.category === category);
            this.renderInventory(filtered);
        }
    }

    renderInventory(items) {
        const container = document.getElementById('inventoryList');
        if (!container) return;

        if (items.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-8">No items found</p>';
            return;
        }

        container.innerHTML = items.map(item => {
            const isLowStock = item.currentStock <= item.minimumStock;
            return `
                <div class="inventory-card ${isLowStock ? 'low-stock' : ''}">
                    <div class="inventory-icon">
                        <i class="icon-box"></i>
                    </div>
                    <div class="inventory-details">
                        <h3>${item.name}</h3>
                        <p class="inventory-meta">${item.category} • ${item.id}</p>
                        <div class="inventory-stats">
                            <div>
                                <span class="label">Current Stock:</span>
                                <span class="value">${item.currentStock} ${item.unit}</span>
                            </div>
                            <div>
                                <span class="label">Minimum Stock:</span>
                                <span class="value">${item.minimumStock} ${item.unit}</span>
                            </div>
                            ${item.expirationDate ? `
                                <div>
                                    <span class="label">Expiration:</span>
                                    <span class="value">${dataManager.formatDate(item.expirationDate)}</span>
                                </div>
                            ` : ''}
                            ${item.lotNumber ? `
                                <div>
                                    <span class="label">Lot Number:</span>
                                    <span class="value">${item.lotNumber}</span>
                                </div>
                            ` : ''}
                        </div>
                        <p class="last-updated">Last updated: ${dataManager.formatDateTime(item.lastUpdated)}</p>
                    </div>
                    <div class="inventory-actions">
                        ${isLowStock ? '<span class="status-badge status-low">Low Stock</span>' : ''}
                        <div class="action-buttons">
                            <button class="btn btn-secondary stock-in-btn" data-item-id="${item.id}">
                                <i class="icon-arrow-up"></i> Stock In
                            </button>
                            <button class="btn btn-secondary stock-out-btn" data-item-id="${item.id}">
                                <i class="icon-arrow-down"></i> Stock Out
                            </button>
                            <button class="btn btn-outline view-logs-btn" data-item-id="${item.id}">
                                View Logs
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Initialize inventory manager
document.addEventListener('DOMContentLoaded', () => {
    new InventoryManager();
});

