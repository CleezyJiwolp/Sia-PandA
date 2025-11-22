// Transaction Management Module
class TransactionManager {
    constructor() {
        this.init();
    }

    init() {
        if (document.getElementById('transactionsList')) {
            this.loadTransactions();
            this.updateSummaryCards();
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // New transaction button
        const newTxnBtn = document.getElementById('newTransactionBtn');
        if (newTxnBtn) {
            newTxnBtn.addEventListener('click', () => this.showNewTransactionModal());
        }

        // Search
        const searchInput = document.getElementById('transactionSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterTransactions(e.target.value));
        }

        // Filter tabs
        document.addEventListener('click', (e) => {
            if (e.target.closest('.filter-tab')) {
                const status = e.target.closest('.filter-tab').dataset.status;
                this.filterByStatus(status);
            }
        });

        // View receipt
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-receipt-btn')) {
                const txnId = e.target.closest('.view-receipt-btn').dataset.txnId;
                this.showReceipt(txnId);
            }
            if (e.target.closest('.like-btn') && e.target.closest('.like-btn').dataset.txnId) {
                const txnId = e.target.closest('.like-btn').dataset.txnId;
                this.toggleFavorite(txnId);
            }
        });

        // Export buttons
        const exportExcelBtn = document.getElementById('exportExcel');
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', () => this.exportToExcel());
        }

        const exportPdfBtn = document.getElementById('exportPdf');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => this.exportToPdf());
        }
    }

    updateSummaryCards() {
        const today = new Date().toDateString();
        const transactions = dataManager.get('transactions') || [];
        
        const todayTxns = transactions.filter(txn => {
            const txnDate = new Date(txn.date).toDateString();
            return txnDate === today;
        });

        const paidToday = todayTxns.filter(t => t.status === 'Paid');
        const todayIncome = paidToday.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const cashToday = paidToday.filter(t => t.paymentMethod === 'Cash');
        const gcashToday = paidToday.filter(t => t.paymentMethod === 'GCash');
        const cashAmount = cashToday.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const gcashAmount = gcashToday.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const pendingTxns = transactions.filter(t => t.status === 'Pending');
        const pendingAmount = pendingTxns.reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const allCount = transactions.length;
        const paidCount = transactions.filter(t => t.status === 'Paid').length;

        if (document.getElementById('todayIncome')) {
            document.getElementById('todayIncome').textContent = dataManager.formatCurrency(todayIncome);
        }
        if (document.getElementById('todayTransactions')) {
            document.getElementById('todayTransactions').textContent = paidToday.length + ' transactions';
        }
        if (document.getElementById('cashPayments')) {
            document.getElementById('cashPayments').textContent = dataManager.formatCurrency(cashAmount);
        }
        if (document.getElementById('cashCount')) {
            document.getElementById('cashCount').textContent = cashToday.length + ' transactions';
        }
        if (document.getElementById('gcashPayments')) {
            document.getElementById('gcashPayments').textContent = dataManager.formatCurrency(gcashAmount);
        }
        if (document.getElementById('gcashCount')) {
            document.getElementById('gcashCount').textContent = gcashToday.length + ' transactions';
        }
        if (document.getElementById('pendingCount')) {
            document.getElementById('pendingCount').textContent = pendingTxns.length;
        }
        if (document.getElementById('pendingAmount')) {
            document.getElementById('pendingAmount').textContent = dataManager.formatCurrency(pendingAmount);
        }

        // Update filter tab counts
        const allCountEl = document.getElementById('allCount');
        const paidCountEl = document.getElementById('paidCount');
        const pendingTabCountEl = document.getElementById('pendingTabCount');
        if (allCountEl) allCountEl.textContent = allCount;
        if (paidCountEl) paidCountEl.textContent = paidCount;
        if (pendingTabCountEl) pendingTabCountEl.textContent = pendingTxns.length;
    }

    loadTransactions() {
        const transactions = dataManager.get('transactions') || [];
        const sorted = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.renderTransactions(sorted);
        this.updateSummaryCards();
    }

    renderTransactions(transactions) {
        const container = document.getElementById('transactionsList');
        if (!container) return;

        if (transactions.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-8">No transactions found</p>';
            return;
        }

        const favorites = dataManager.get('favorites') || { requests: [], results: [], transactions: [] };
        const isFavorited = (id) => favorites.transactions.includes(id);

        container.innerHTML = transactions.map(txn => {
            const favorited = isFavorited(txn.id);
            return `
                <div class="transaction-card">
                    <div class="transaction-icon">
                        <i class="icon-${txn.paymentMethod === 'Cash' ? 'cash' : 'gcash'}"></i>
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-header-row">
                            <h3>${txn.patientName}</h3>
                            <button class="like-btn ${favorited ? 'liked' : ''}" data-txn-id="${txn.id}" title="${favorited ? 'Remove from favorites' : 'Add to favorites'}">
                                ${favorited ? '❤️' : '🤍'}
                            </button>
                        </div>
                        <div class="transaction-tags">
                            <span class="status-badge status-${txn.status.toLowerCase()}">${txn.status}</span>
                            <span class="payment-badge">${txn.paymentMethod}</span>
                        </div>
                        <p class="transaction-service">${txn.testType || txn.service}</p>
                        <p class="transaction-meta">
                            TXN: ${txn.id} • Request: ${txn.requestId || 'N/A'}
                        </p>
                        <p class="transaction-meta">
                            ${dataManager.formatDateTime(txn.date)} • By: ${txn.cashierName}
                        </p>
                    </div>
                    <div class="transaction-amount">
                        <span class="amount">${dataManager.formatCurrency(txn.amount)}</span>
                        <div class="transaction-actions">
                            <button class="btn btn-outline view-receipt-btn" data-txn-id="${txn.id}">
                                View Receipt
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    toggleFavorite(txnId) {
        const favorites = dataManager.get('favorites') || { requests: [], results: [], transactions: [] };
        const index = favorites.transactions.indexOf(txnId);
        
        if (index > -1) {
            favorites.transactions.splice(index, 1);
            dataManager.showNotification('Removed from favorites', 'info');
        } else {
            favorites.transactions.push(txnId);
            dataManager.showNotification('Added to favorites', 'success');
        }
        
        dataManager.set('favorites', favorites);
        this.loadTransactions();
    }

    showNewTransactionModal() {
        const testRequests = dataManager.get('testRequests') || [];
        const pendingRequests = testRequests.filter(req => req.status === 'Completed' && !req.paid);

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>New Transaction</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="newTransactionForm" class="modal-body">
                    <div class="form-group">
                        <label>Test Request *</label>
                        <select name="requestId" required>
                            <option value="">Select test request</option>
                            ${pendingRequests.map(req => `
                                <option value="${req.id}" data-patient="${req.patientName}" data-test="${req.testType}" data-amount="${req.amount || ''}">
                                    ${req.requestId} - ${req.patientName} - ${req.testType}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Patient Name *</label>
                        <input type="text" name="patientName" id="patientNameInput" required readonly>
                    </div>
                    <div class="form-group">
                        <label>Test/Service *</label>
                        <input type="text" name="testType" id="testTypeInput" required readonly>
                    </div>
                    <div class="form-group">
                        <label>Amount (₱) *</label>
                        <input type="number" name="amount" id="amountInput" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label>Payment Method *</label>
                        <select name="paymentMethod" required>
                            <option value="">Select payment method</option>
                            <option value="Cash">Cash</option>
                            <option value="GCash">GCash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
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
                        <button type="submit" class="btn btn-primary">Record Transaction</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Auto-fill form when request is selected
        const requestSelect = modal.querySelector('select[name="requestId"]');
        requestSelect.addEventListener('change', (e) => {
            const option = e.target.selectedOptions[0];
            if (option.value) {
                modal.querySelector('#patientNameInput').value = option.dataset.patient;
                modal.querySelector('#testTypeInput').value = option.dataset.test;
                modal.querySelector('#amountInput').value = option.dataset.amount || '';
            }
        });

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('#newTransactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTransaction(new FormData(e.target));
            modal.remove();
        });
    }

    createTransaction(formData) {
        const currentUser = dataManager.getCurrentUser();
        const requestId = formData.get('requestId');
        
        const transaction = {
            id: dataManager.generateId('TXN'),
            requestId: requestId,
            patientName: formData.get('patientName'),
            testType: formData.get('testType'),
            service: formData.get('testType'),
            amount: parseFloat(formData.get('amount')),
            paymentMethod: formData.get('paymentMethod'),
            status: 'Paid',
            date: formData.get('dateTime'),
            cashierId: currentUser.id,
            cashierName: currentUser.name,
            notes: formData.get('notes') || '',
            timestamp: new Date().toISOString()
        };

        const transactions = dataManager.get('transactions') || [];
        transactions.push(transaction);
        dataManager.set('transactions', transactions);

        // Mark request as paid
        if (requestId) {
            const requests = dataManager.get('testRequests') || [];
            const request = requests.find(r => r.id === requestId);
            if (request) {
                request.paid = true;
                dataManager.set('testRequests', requests);
            }
        }

        // Log activity
        dataManager.logActivity(
            'Payment Processed',
            'Transaction',
            `Payment received for ${transaction.requestId || 'transaction'} (${dataManager.formatCurrency(transaction.amount)} - ${transaction.paymentMethod})`,
            currentUser.id,
            currentUser.name,
            currentUser.role,
            { transactionId: transaction.id, amount: transaction.amount, paymentMethod: transaction.paymentMethod }
        );

        dataManager.showNotification('Transaction recorded successfully', 'success');
        this.loadTransactions();
        this.updateSummaryCards();
    }

    showReceipt(txnId) {
        const transactions = dataManager.get('transactions') || [];
        const txn = transactions.find(t => t.id === txnId);
        if (!txn) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>Transaction Receipt</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="receipt-container">
                        <div class="receipt-header">
                            <h2>P and A Laboratory</h2>
                            <p>Digos City, Davao del Sur, Philippines</p>
                            <p class="receipt-type">OFFICIAL RECEIPT</p>
                        </div>
                        <div class="receipt-body">
                            <div class="receipt-row">
                                <span class="label">Transaction ID:</span>
                                <span class="value">${txn.id}</span>
                            </div>
                            <div class="receipt-row">
                                <span class="label">Date & Time:</span>
                                <span class="value">${dataManager.formatDateTime(txn.date)}</span>
                            </div>
                            <div class="receipt-row">
                                <span class="label">Patient Name:</span>
                                <span class="value">${txn.patientName}</span>
                            </div>
                            <div class="receipt-row">
                                <span class="label">Test/Service:</span>
                                <span class="value">${txn.testType || txn.service}</span>
                            </div>
                            ${txn.requestId ? `
                                <div class="receipt-row">
                                    <span class="label">Request ID:</span>
                                    <span class="value">${txn.requestId}</span>
                                </div>
                            ` : ''}
                            <div class="receipt-row">
                                <span class="label">Payment Method:</span>
                                <span class="value">${txn.paymentMethod}</span>
                            </div>
                            <div class="receipt-row receipt-total">
                                <span class="label">Amount Paid:</span>
                                <span class="value">${dataManager.formatCurrency(txn.amount)}</span>
                            </div>
                            <div class="receipt-row">
                                <span class="label">Cashier:</span>
                                <span class="value">${txn.cashierName}</span>
                            </div>
                            ${txn.notes ? `
                                <div class="receipt-row">
                                    <span class="label">Notes:</span>
                                    <span class="value">${txn.notes}</span>
                                </div>
                            ` : ''}
                        </div>
                        <div class="receipt-footer">
                            <p class="receipt-note">This is a digital receipt. Printing is disabled.</p>
                            <p class="receipt-note">Thank you for your business!</p>
                        </div>
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

    filterTransactions(searchTerm) {
        const transactions = dataManager.get('transactions') || [];
        const filtered = transactions.filter(txn =>
            txn.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (txn.requestId && txn.requestId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (txn.testType && txn.testType.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        this.renderTransactions(filtered);
    }

    filterByStatus(status) {
        const transactions = dataManager.get('transactions') || [];
        let filtered = transactions;
        
        if (status !== 'All') {
            filtered = transactions.filter(t => t.status === status);
        }

        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-status="${status}"]`).classList.add('active');

        this.renderTransactions(filtered);
    }

    exportToExcel() {
        const transactions = dataManager.get('transactions') || [];
        // Simple CSV export (Excel-compatible)
        const headers = ['Transaction ID', 'Date', 'Patient Name', 'Test/Service', 'Amount', 'Payment Method', 'Status', 'Cashier'];
        const rows = transactions.map(txn => [
            txn.id,
            dataManager.formatDateTime(txn.date),
            txn.patientName,
            txn.testType || txn.service,
            txn.amount,
            txn.paymentMethod,
            txn.status,
            txn.cashierName
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        dataManager.showNotification('Transactions exported to CSV', 'success');
    }

    exportToPdf() {
        dataManager.showNotification('PDF export feature coming soon', 'info');
    }
}

// Initialize transaction manager
document.addEventListener('DOMContentLoaded', () => {
    new TransactionManager();
});

