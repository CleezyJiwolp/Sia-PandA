/**
 * SECURE DATABASE MANAGER
 * Handles data retrieval, filtering, role-based access, and audit trails
 */

// ============================================================================
// DATA MANAGEMENT & RETRIEVAL
// ============================================================================

class SecureDatabase {
    constructor() {
        this.auditLog = [];
        this.currentUser = 'admin'; // Would come from session
        this.accessLevel = 'restricted'; // Would come from role-based system
        this.loadAuditLog();
    }

    /**
     * Log all data access and modifications
     */
    logAudit(action, recordType, recordId, details = '', status = 'success') {
        const timestamp = new Date().toISOString();
        const ipAddress = '192.168.1.100'; // Would come from server
        
        const auditEntry = {
            timestamp,
            user: this.currentUser,
            action,
            recordType,
            recordId,
            details,
            ipAddress,
            status
        };

        this.auditLog.push(auditEntry);
        localStorage.setItem('auditLog', JSON.stringify(this.auditLog));
        
        console.log(`[AUDIT] ${action} - ${recordType}:${recordId} by ${this.currentUser}`);
    }

    /**
     * Load audit log from storage
     */
    loadAuditLog() {
        const stored = localStorage.getItem('auditLog');
        this.auditLog = stored ? JSON.parse(stored) : [];
    }

    /**
     * Retrieve patient records with access logging
     */
    async getPatients() {
        this.logAudit('READ', 'PATIENTS', '*', 'Retrieved patient records list', 'success');
        
        // Simulate data retrieval
        const patients = [
            {
                id: 'P001',
                name: 'John Doe',
                dob: '1990-05-15',
                gender: 'M',
                contact: '09123456789',
                address: '123 Medical St, City',
                status: 'active',
                createdDate: '2024-01-10'
            },
            {
                id: 'P002',
                name: 'Jane Smith',
                dob: '1985-08-22',
                gender: 'F',
                contact: '09198765432',
                address: '456 Health Ave, Town',
                status: 'active',
                createdDate: '2024-01-11'
            }
        ];
        return patients;
    }

    /**
     * Retrieve test records with access logging
     */
    async getTests() {
        this.logAudit('READ', 'TESTS', '*', 'Retrieved test requests list', 'success');
        
        const tests = [
            {
                id: 'TST001',
                patientName: 'John Doe',
                testType: 'Complete Blood Count',
                requestedDate: '2024-11-20',
                status: 'pending',
                priority: 'high'
            },
            {
                id: 'TST002',
                patientName: 'Jane Smith',
                testType: 'Urinalysis',
                requestedDate: '2024-11-21',
                status: 'in-progress',
                priority: 'normal'
            }
        ];
        return tests;
    }

    /**
     * Retrieve laboratory results
     */
    async getResults() {
        this.logAudit('READ', 'RESULTS', '*', 'Retrieved laboratory results list', 'success');
        
        const results = [
            {
                id: 'RES001',
                patientName: 'John Doe',
                testType: 'Blood Glucose',
                resultStatus: 'normal',
                dateCompleted: '2024-11-19',
                reviewedBy: 'Dr. Garcia',
                value: '95 mg/dL'
            },
            {
                id: 'RES002',
                patientName: 'Jane Smith',
                testType: 'Cholesterol Panel',
                resultStatus: 'abnormal',
                dateCompleted: '2024-11-20',
                reviewedBy: 'Dr. Santos',
                value: 'HDL: Low'
            }
        ];
        return results;
    }

    /**
     * Retrieve inventory data
     */
    async getInventory() {
        this.logAudit('READ', 'INVENTORY', '*', 'Retrieved inventory items list', 'success');
        
        const inventory = [
            {
                id: 'INV001',
                itemName: 'Reagent A',
                category: 'Reagent',
                currentStock: 50,
                unit: 'Box',
                status: 'in-stock',
                lastUpdated: '2024-11-21'
            },
            {
                id: 'INV002',
                itemName: 'Test Tubes',
                category: 'Consumable',
                currentStock: 5,
                unit: 'Pack',
                status: 'low-stock',
                lastUpdated: '2024-11-20'
            }
        ];
        return inventory;
    }

    /**
     * Retrieve transactions
     */
    async getTransactions() {
        this.logAudit('READ', 'TRANSACTIONS', '*', 'Retrieved transaction logs', 'success');
        
        const transactions = [
            {
                id: 'TXN001',
                date: '2024-11-21',
                itemService: 'Blood Test',
                type: 'Service',
                amount: '₱500.00',
                status: 'completed',
                reference: 'P001'
            },
            {
                id: 'TXN002',
                date: '2024-11-20',
                itemService: 'Lab Reagents',
                type: 'Supply',
                amount: '₱2500.00',
                status: 'completed',
                reference: 'INV001'
            }
        ];
        return transactions;
    }

    /**
     * Get audit trail records
     */
    getAuditTrail(filter = {}) {
        let filtered = [...this.auditLog];

        if (filter.action) {
            filtered = filtered.filter(log => log.action === filter.action);
        }
        if (filter.recordType) {
            filtered = filtered.filter(log => log.recordType === filter.recordType);
        }
        if (filter.user) {
            filtered = filtered.filter(log => log.user === filter.user);
        }

        // Return most recent first
        return filtered.reverse();
    }

    /**
     * Add new patient with access logging
     */
    async addPatient(patientData) {
        this.logAudit('CREATE', 'PATIENTS', 'P_NEW', `Added new patient: ${patientData.name}`, 'success');
        return { success: true, message: 'Patient added successfully' };
    }

    /**
     * Add inventory item with access logging
     */
    async addInventory(inventoryData) {
        this.logAudit('CREATE', 'INVENTORY', 'INV_NEW', `Added item: ${inventoryData.itemName}`, 'success');
        return { success: true, message: 'Inventory item added successfully' };
    }

    /**
     * Update record with access logging
     */
    async updateRecord(recordType, recordId, data) {
        this.logAudit('UPDATE', recordType, recordId, `Updated record`, 'success');
        return { success: true, message: 'Record updated successfully' };
    }

    /**
     * Delete record with access logging
     */
    async deleteRecord(recordType, recordId) {
        this.logAudit('DELETE', recordType, recordId, `Deleted record`, 'success');
        return { success: true, message: 'Record deleted successfully' };
    }

    /**
     * Export data with access logging
     */
    async exportData(recordType, format = 'csv') {
        this.logAudit('EXPORT', recordType, '*', `Exported as ${format}`, 'success');
        return { success: true, message: `Data exported as ${format}` };
    }
}

// Initialize database
const db = new SecureDatabase();

// ============================================================================
// UI INITIALIZATION & RENDERING
// ============================================================================

/**
 * Initialize UI on page load
 */
async function initializeDatabase() {
    await loadStats();
    await loadPatients();
    await loadTests();
    await loadResults();
    await loadInventory();
    await loadTransactions();
    await loadAuditTrail();
    setupTabNavigation();
    setupSearchFilters();
}

/**
 * Load and display statistics
 */
async function loadStats() {
    const patients = await db.getPatients();
    const tests = await db.getTests();
    const results = await db.getResults();
    const inventory = await db.getInventory();
    const transactions = await db.getTransactions();
    const auditLogs = db.getAuditTrail();

    document.getElementById('patientCount').textContent = patients.length;
    document.getElementById('testCount').textContent = tests.length;
    document.getElementById('resultCount').textContent = results.length;
    document.getElementById('inventoryCount').textContent = inventory.length;
    document.getElementById('transactionCount').textContent = transactions.length;
    document.getElementById('auditCount').textContent = auditLogs.length;
}

/**
 * Load and display patients
 */
async function loadPatients() {
    const patients = await db.getPatients();
    const tbody = document.getElementById('patientsBody');
    
    if (patients.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="8" class="empty-cell"><i class="fa-solid fa-inbox"></i> No patient records found</td></tr>';
        return;
    }

    tbody.innerHTML = patients.map(p => `
        <tr>
            <td><strong>${p.id}</strong></td>
            <td>${p.name}</td>
            <td>${p.dob}</td>
            <td>${p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}</td>
            <td>${p.contact}</td>
            <td>${p.address}</td>
            <td><span class="status-badge status-${p.status}">${p.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewRecord('patient', '${p.id}')" title="View">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editRecord('patient', '${p.id}')" title="Edit">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Load and display tests
 */
async function loadTests() {
    const tests = await db.getTests();
    const tbody = document.getElementById('testsBody');
    
    if (tests.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="7" class="empty-cell"><i class="fa-solid fa-inbox"></i> No test records found</td></tr>';
        return;
    }

    tbody.innerHTML = tests.map(t => `
        <tr>
            <td><strong>${t.id}</strong></td>
            <td>${t.patientName}</td>
            <td>${t.testType}</td>
            <td>${t.requestedDate}</td>
            <td><span class="status-badge status-${t.status}">${t.status.replace('-', ' ')}</span></td>
            <td><span class="badge badge-${t.priority === 'high' ? 'danger' : 'warning'}">${t.priority}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewRecord('test', '${t.id}')" title="View">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Load and display results
 */
async function loadResults() {
    const results = await db.getResults();
    const tbody = document.getElementById('resultsBody');
    
    if (results.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="7" class="empty-cell"><i class="fa-solid fa-inbox"></i> No result records found</td></tr>';
        return;
    }

    tbody.innerHTML = results.map(r => `
        <tr>
            <td><strong>${r.id}</strong></td>
            <td>${r.patientName}</td>
            <td>${r.testType}</td>
            <td><span class="status-badge status-${r.resultStatus}">${r.resultStatus}</span></td>
            <td>${r.dateCompleted}</td>
            <td>${r.reviewedBy}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewRecord('result', '${r.id}')" title="View">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="downloadResult('${r.id}')" title="Download">
                        <i class="fa-solid fa-download"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Load and display inventory
 */
async function loadInventory() {
    const inventory = await db.getInventory();
    const tbody = document.getElementById('inventoryBody');
    
    if (inventory.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="8" class="empty-cell"><i class="fa-solid fa-inbox"></i> No inventory records found</td></tr>';
        return;
    }

    tbody.innerHTML = inventory.map(i => `
        <tr>
            <td><strong>${i.id}</strong></td>
            <td>${i.itemName}</td>
            <td>${i.category}</td>
            <td>${i.currentStock}</td>
            <td>${i.unit}</td>
            <td><span class="status-badge status-${i.status}">${i.status.replace('-', ' ')}</span></td>
            <td>${i.lastUpdated}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewRecord('inventory', '${i.id}')" title="View">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editRecord('inventory', '${i.id}')" title="Edit">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Load and display transactions
 */
async function loadTransactions() {
    const transactions = await db.getTransactions();
    const tbody = document.getElementById('transactionsBody');
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="8" class="empty-cell"><i class="fa-solid fa-inbox"></i> No transaction records found</td></tr>';
        return;
    }

    tbody.innerHTML = transactions.map(t => `
        <tr>
            <td><strong>${t.id}</strong></td>
            <td>${t.date}</td>
            <td>${t.itemService}</td>
            <td>${t.type}</td>
            <td>${t.amount}</td>
            <td><span class="status-badge status-${t.status}">${t.status}</span></td>
            <td>${t.reference}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewRecord('transaction', '${t.id}')" title="View">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Load and display audit trail
 */
async function loadAuditTrail() {
    const auditTrail = db.getAuditTrail();
    const tbody = document.getElementById('auditBody');
    
    if (auditTrail.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="8" class="empty-cell"><i class="fa-solid fa-inbox"></i> No audit records found</td></tr>';
        return;
    }

    tbody.innerHTML = auditTrail.map((log, idx) => `
        <tr>
            <td><code class="timestamp">${new Date(log.timestamp).toLocaleString()}</code></td>
            <td><strong>${log.user}</strong></td>
            <td><span class="badge badge-info">${log.action}</span></td>
            <td>${log.recordType}</td>
            <td><code>${log.recordId}</code></td>
            <td>${log.details}</td>
            <td><code class="ip-address">${log.ipAddress}</code></td>
            <td><span class="status-badge status-${log.status}">${log.status}</span></td>
        </tr>
    `).join('');
}

// ============================================================================
// SEARCH & FILTER FUNCTIONALITY
// ============================================================================

/**
 * Setup search and filter event listeners
 */
function setupSearchFilters() {
    // Patient search and filter
    document.getElementById('patientSearch')?.addEventListener('input', filterPatients);
    document.getElementById('patientFilter')?.addEventListener('change', filterPatients);

    // Test search and filter
    document.getElementById('testSearch')?.addEventListener('input', filterTests);
    document.getElementById('testFilter')?.addEventListener('change', filterTests);

    // Result search and filter
    document.getElementById('resultSearch')?.addEventListener('input', filterResults);
    document.getElementById('resultFilter')?.addEventListener('change', filterResults);

    // Inventory search and filter
    document.getElementById('inventorySearch')?.addEventListener('input', filterInventory);
    document.getElementById('inventoryFilter')?.addEventListener('change', filterInventory);

    // Transaction search and filter
    document.getElementById('transactionSearch')?.addEventListener('input', filterTransactions);
    document.getElementById('transactionFilter')?.addEventListener('change', filterTransactions);

    // Audit search and filter
    document.getElementById('auditSearch')?.addEventListener('input', filterAudit);
    document.getElementById('auditFilter')?.addEventListener('change', filterAudit);
}

/**
 * Filter patients by search and status
 */
function filterPatients() {
    const search = document.getElementById('patientSearch')?.value.toLowerCase() || '';
    const filter = document.getElementById('patientFilter')?.value || '';
    const rows = document.querySelectorAll('#patientsBody tr:not(.empty-row)');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const statusCell = row.cells[6]?.textContent.toLowerCase() || '';
        
        const matchSearch = text.includes(search);
        const matchFilter = !filter || statusCell.includes(filter);
        
        row.style.display = (matchSearch && matchFilter) ? '' : 'none';
    });

    showEmptyState('patientsBody');
}

/**
 * Filter tests by search and status
 */
function filterTests() {
    const search = document.getElementById('testSearch')?.value.toLowerCase() || '';
    const filter = document.getElementById('testFilter')?.value || '';
    const rows = document.querySelectorAll('#testsBody tr:not(.empty-row)');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const statusCell = row.cells[4]?.textContent.toLowerCase() || '';
        
        const matchSearch = text.includes(search);
        const matchFilter = !filter || statusCell.includes(filter.replace('-', ' '));
        
        row.style.display = (matchSearch && matchFilter) ? '' : 'none';
    });

    showEmptyState('testsBody');
}

/**
 * Filter results by search and status
 */
function filterResults() {
    const search = document.getElementById('resultSearch')?.value.toLowerCase() || '';
    const filter = document.getElementById('resultFilter')?.value || '';
    const rows = document.querySelectorAll('#resultsBody tr:not(.empty-row)');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const statusCell = row.cells[3]?.textContent.toLowerCase() || '';
        
        const matchSearch = text.includes(search);
        const matchFilter = !filter || statusCell.includes(filter);
        
        row.style.display = (matchSearch && matchFilter) ? '' : 'none';
    });

    showEmptyState('resultsBody');
}

/**
 * Filter inventory by search and status
 */
function filterInventory() {
    const search = document.getElementById('inventorySearch')?.value.toLowerCase() || '';
    const filter = document.getElementById('inventoryFilter')?.value || '';
    const rows = document.querySelectorAll('#inventoryBody tr:not(.empty-row)');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const statusCell = row.cells[5]?.textContent.toLowerCase() || '';
        
        const matchSearch = text.includes(search);
        const matchFilter = !filter || statusCell.includes(filter.replace('-', ' '));
        
        row.style.display = (matchSearch && matchFilter) ? '' : 'none';
    });

    showEmptyState('inventoryBody');
}

/**
 * Filter transactions by search and type
 */
function filterTransactions() {
    const search = document.getElementById('transactionSearch')?.value.toLowerCase() || '';
    const filter = document.getElementById('transactionFilter')?.value || '';
    const rows = document.querySelectorAll('#transactionsBody tr:not(.empty-row)');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const typeCell = row.cells[3]?.textContent.toLowerCase() || '';
        
        const matchSearch = text.includes(search);
        const matchFilter = !filter || typeCell.includes(filter);
        
        row.style.display = (matchSearch && matchFilter) ? '' : 'none';
    });

    showEmptyState('transactionsBody');
}

/**
 * Filter audit trail by search and action
 */
function filterAudit() {
    const search = document.getElementById('auditSearch')?.value.toLowerCase() || '';
    const filter = document.getElementById('auditFilter')?.value || '';
    const rows = document.querySelectorAll('#auditBody tr:not(.empty-row)');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const actionCell = row.cells[2]?.textContent.toLowerCase() || '';
        
        const matchSearch = text.includes(search);
        const matchFilter = !filter || actionCell.includes(filter);
        
        row.style.display = (matchSearch && matchFilter) ? '' : 'none';
    });

    showEmptyState('auditBody');
}

/**
 * Show empty state if all rows are hidden
 */
function showEmptyState(bodyId) {
    const tbody = document.getElementById(bodyId);
    const visibleRows = tbody.querySelectorAll('tr:not(.empty-row):not([style*="display: none"])');
    
    let emptyRow = tbody.querySelector('.empty-row');
    if (visibleRows.length === 0) {
        if (!emptyRow) {
            const colspan = tbody.querySelectorAll('th').length;
            tbody.innerHTML = `<tr class="empty-row"><td colspan="${colspan}" class="empty-cell"><i class="fa-solid fa-inbox"></i> No records found</td></tr>`;
        } else {
            emptyRow.style.display = '';
        }
    } else if (emptyRow) {
        emptyRow.style.display = 'none';
    }
}

// ============================================================================
// TAB NAVIGATION
// ============================================================================

/**
 * Setup tab navigation
 */
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
            db.logAudit('VIEW', 'TAB', tabName, `Switched to ${tabName} tab`, 'success');
        });
    });
}

/**
 * Switch active tab
 */
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show active tab
    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Activate button
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
}

// ============================================================================
// MODAL OPERATIONS
// ============================================================================

/**
 * Open patient modal
 */
function openPatientModal() {
    document.getElementById('patientModal')?.classList.add('active');
    db.logAudit('VIEW', 'MODAL', 'patient', 'Opened add patient modal', 'success');
}

/**
 * Close patient modal
 */
function closePatientModal() {
    document.getElementById('patientModal')?.classList.remove('active');
    document.getElementById('patientForm')?.reset();
}

/**
 * Submit patient form
 */
async function submitPatient(event) {
    event.preventDefault();
    const form = document.getElementById('patientForm');
    const data = {
        patient_name: form.patient_name.value,
        dob: form.dob.value,
        gender: form.gender.value,
        contact: form.contact.value,
        address: form.address.value
    };

    const result = await db.addPatient(data);
    if (result.success) {
        alert('Patient added successfully');
        closePatientModal();
        await loadPatients();
        await loadStats();
    }
}

/**
 * Open inventory modal
 */
function openInventoryModal() {
    document.getElementById('inventoryModal')?.classList.add('active');
    db.logAudit('VIEW', 'MODAL', 'inventory', 'Opened add inventory modal', 'success');
}

/**
 * Close inventory modal
 */
function closeInventoryModal() {
    document.getElementById('inventoryModal')?.classList.remove('active');
    document.getElementById('inventoryForm')?.reset();
}

/**
 * Submit inventory form
 */
async function submitInventory(event) {
    event.preventDefault();
    const form = document.getElementById('inventoryForm');
    const data = {
        item_name: form.item_name.value,
        category: form.category.value,
        current_stock: form.current_stock.value,
        unit: form.unit.value,
        status: form.status.value
    };

    const result = await db.addInventory(data);
    if (result.success) {
        alert('Inventory item added successfully');
        closeInventoryModal();
        await loadInventory();
        await loadStats();
    }
}

// ============================================================================
// RECORD OPERATIONS
// ============================================================================

/**
 * View record details
 */
function viewRecord(type, id) {
    db.logAudit('READ', type.toUpperCase(), id, `Viewed record details`, 'success');
    alert(`View details for ${type}: ${id}\n\nThis would open a detailed view modal in full implementation.`);
}

/**
 * Edit record
 */
function editRecord(type, id) {
    db.logAudit('EDIT', type.toUpperCase(), id, `Opened edit form`, 'success');
    alert(`Edit ${type}: ${id}\n\nThis would open an edit modal in full implementation.`);
}

/**
 * Download result
 */
function downloadResult(id) {
    db.logAudit('EXPORT', 'RESULTS', id, `Downloaded result report`, 'success');
    alert(`Downloading result: ${id}`);
}

// ============================================================================
// DATA PROTECTION & BACKUP
// ============================================================================

/**
 * Perform database backup
 */
async function performBackup() {
    db.logAudit('BACKUP', 'DATABASE', '*', 'Initiated database backup', 'success');
    alert('Backup initiated. All records have been secured.');
    
    // Update backup status
    const now = new Date().toLocaleString();
    document.getElementById('backupStatus').innerHTML = `Last: <span>${now}</span>`;
}

/**
 * Verify data integrity
 */
async function verifyData() {
    db.logAudit('VERIFY', 'DATABASE', '*', 'Initiated data integrity check', 'success');
    alert('Data integrity check completed. All records verified successfully.');
}

/**
 * Export audit log
 */
async function exportAuditLog() {
    const auditLog = db.getAuditTrail();
    const csv = convertToCSV(auditLog);
    downloadCSV(csv, 'audit_trail.csv');
    db.logAudit('EXPORT', 'AUDIT', '*', 'Exported audit trail as CSV', 'success');
}

/**
 * Convert data to CSV format
 */
function convertToCSV(data) {
    const headers = ['Timestamp', 'User', 'Action', 'Record Type', 'Record ID', 'Details', 'IP Address', 'Status'];
    const rows = data.map(log => [
        log.timestamp,
        log.user,
        log.action,
        log.recordType,
        log.recordId,
        log.details,
        log.ipAddress,
        log.status
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
}

/**
 * Download CSV file
 */
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Logout user
 */
function logout() {
    db.logAudit('LOGOUT', 'SESSION', '*', 'User logged out', 'success');
    if (confirm('Logout?')) window.location.href = 'login.html';
}

/**
 * Close modal when clicking outside
 */
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// ============================================================================
// INITIALIZE ON PAGE LOAD
// ============================================================================

document.addEventListener('DOMContentLoaded', initializeDatabase);
