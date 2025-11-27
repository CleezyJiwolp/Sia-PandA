// Check session and load user info
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    loadDashboardData();
});

// Check if user is logged in and is staff
function checkSession() {
    fetch('../php/check_session.php')
        .then(response => response.json())
        .then(data => {
            if (data.role !== 'staff') {
                alert('Access denied. Staff privileges required.');
                window.location.href = '../html/login.html';
                return;
            }
            
            // Display user info
            document.getElementById('staffName').textContent = data.fullname || data.username;
            document.getElementById('staffUsername').textContent = data.username;
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = '../html/login.html';
        });
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

// Load different pages
function loadPage(pageName) {
    // Hide all page sections
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected page
    const targetPage = document.getElementById(pageName);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update active menu item
    const menuItems = document.querySelectorAll('.menu li');
    menuItems.forEach(item => item.classList.remove('active'));
    event.target.closest('li').classList.add('active');
    
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 600) {
        document.getElementById('sidebar').classList.add('collapsed');
    }
}

// Load dashboard statistics
function loadDashboardData() {
    // Simulate loading data (replace with actual API calls)
    setTimeout(() => {
        document.getElementById('pendingRequests').textContent = '8';
        document.getElementById('completedResults').textContent = '24';
        document.getElementById('lowStockSupplies').textContent = '5';
        document.getElementById('todayTransactions').textContent = '12';
    }, 500);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '../php/logout.php';
    }
}

// ========== PATIENT TEST REQUESTS FUNCTIONS ==========
function filterTestRequests(searchValue) {
    const table = document.getElementById('testRequestsTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const text = rows[i].textContent.toLowerCase();
        rows[i].style.display = text.includes(searchValue.toLowerCase()) ? '' : 'none';
    }
}

function filterByStatus(status) {
    const table = document.getElementById('testRequestsTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        if (status === '') {
            rows[i].style.display = '';
        } else {
            const statusBadge = rows[i].querySelector('.status-badge');
            if (statusBadge) {
                const rowStatus = statusBadge.textContent.toLowerCase();
                rows[i].style.display = rowStatus.includes(status) ? '' : 'none';
            }
        }
    }
}

function openAddTestRequestModal() {
    alert('Add Test Request functionality - Connect to backend');
}

function viewTestRequest(id) {
    alert('View Test Request: ' + id);
}

function processTestRequest(id) {
    if (confirm('Mark this test request as processing?')) {
        alert('Test Request ' + id + ' is now processing');
    }
}

function completeTestRequest(id) {
    if (confirm('Mark this test request as completed?')) {
        alert('Test Request ' + id + ' completed');
    }
}

function viewResults(id) {
    alert('View Results for: ' + id);
}

// ========== LABORATORY RESULTS FUNCTIONS ==========
function filterResults(searchValue) {
    const table = document.getElementById('labResultsTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const text = rows[i].textContent.toLowerCase();
        rows[i].style.display = text.includes(searchValue.toLowerCase()) ? '' : 'none';
    }
}

function filterResultsByType(type) {
    const table = document.getElementById('labResultsTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        if (type === '') {
            rows[i].style.display = '';
        } else {
            const text = rows[i].textContent.toLowerCase();
            rows[i].style.display = text.includes(type) ? '' : 'none';
        }
    }
}

function openAddResultModal() {
    alert('Add Laboratory Result functionality - Connect to backend');
}

function viewResult(id) {
    alert('View Result: ' + id);
}

function printResult(id) {
    alert('Print Result: ' + id);
}

// ========== INVENTORY FUNCTIONS ==========
function filterInventory(searchValue) {
    const table = document.getElementById('inventoryTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const text = rows[i].textContent.toLowerCase();
        rows[i].style.display = text.includes(searchValue.toLowerCase()) ? '' : 'none';
    }
}

function filterInventoryByStatus(status) {
    const table = document.getElementById('inventoryTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        if (status === '') {
            rows[i].style.display = '';
        } else {
            const statusBadge = rows[i].querySelector('.status-badge');
            if (statusBadge) {
                const rowStatus = statusBadge.textContent.toLowerCase();
                rows[i].style.display = rowStatus.includes(status) ? '' : 'none';
            }
        }
    }
}

// ========== TRANSACTION FUNCTIONS ==========
function filterTransactions(searchValue) {
    const table = document.getElementById('transactionsTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const text = rows[i].textContent.toLowerCase();
        rows[i].style.display = text.includes(searchValue.toLowerCase()) ? '' : 'none';
    }
}

function filterByDate(date) {
    const table = document.getElementById('transactionsTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        if (date === '') {
            rows[i].style.display = '';
        } else {
            const dateCell = rows[i].cells[1];
            if (dateCell) {
                const rowDate = dateCell.textContent.split(' ')[0];
                rows[i].style.display = rowDate === date ? '' : 'none';
            }
        }
    }
}

function filterByType(type) {
    const table = document.getElementById('transactionsTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        if (type === '') {
            rows[i].style.display = '';
        } else {
            const typeCell = rows[i].cells[2];
            if (typeCell) {
                const rowType = typeCell.textContent.toLowerCase();
                rows[i].style.display = rowType.includes(type) ? '' : 'none';
            }
        }
    }
}

function viewTransaction(id) {
    alert('View Transaction: ' + id);
}

function printReceipt(id) {
    alert('Print Receipt: ' + id);
}

function exportTransactions() {
    alert('Export Transactions functionality - Connect to backend');
}

