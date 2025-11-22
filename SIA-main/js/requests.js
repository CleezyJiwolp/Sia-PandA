// Test Request Management Module
class RequestManager {
    constructor() {
        this.init();
    }

    init() {
        if (document.getElementById('requestsList')) {
            this.loadRequests();
            this.updateSummaryCards();
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // New request button
        const newRequestBtn = document.getElementById('newRequestBtn');
        if (newRequestBtn) {
            newRequestBtn.addEventListener('click', () => this.showNewRequestModal());
        }

        // Search
        const searchInput = document.getElementById('requestSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterRequests(e.target.value));
        }

        // Filter tabs
        document.addEventListener('click', (e) => {
            if (e.target.closest('.filter-tab')) {
                const status = e.target.closest('.filter-tab').dataset.status;
                this.filterByStatus(status);
            }
        });

        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-request-btn')) {
                const requestId = e.target.closest('.view-request-btn').dataset.requestId;
                this.viewRequest(requestId);
            }
            if (e.target.closest('.edit-request-btn')) {
                const requestId = e.target.closest('.edit-request-btn').dataset.requestId;
                this.editRequest(requestId);
            }
            if (e.target.closest('.delete-request-btn')) {
                const requestId = e.target.closest('.delete-request-btn').dataset.requestId;
                this.deleteRequest(requestId);
            }
            if (e.target.closest('.start-process-btn')) {
                const requestId = e.target.closest('.start-process-btn').dataset.requestId;
                this.updateStatus(requestId, 'Processing');
            }
            if (e.target.closest('.mark-complete-btn')) {
                const requestId = e.target.closest('.mark-complete-btn').dataset.requestId;
                this.updateStatus(requestId, 'Completed');
            }
            if (e.target.closest('.like-btn') && e.target.closest('.like-btn').dataset.requestId) {
                const requestId = e.target.closest('.like-btn').dataset.requestId;
                this.toggleFavorite(requestId);
            }
        });
    }

    updateSummaryCards() {
        const today = new Date().toDateString();
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const requests = dataManager.get('testRequests') || [];
        
        const todayRequests = requests.filter(req => {
            const reqDate = new Date(req.requestedDate).toDateString();
            return reqDate === today;
        });

        const weekRequests = requests.filter(req => {
            const reqDate = new Date(req.requestedDate);
            return reqDate >= weekStart;
        });

        const monthRequests = requests.filter(req => {
            const reqDate = new Date(req.requestedDate);
            return reqDate >= monthStart;
        });

        const pendingRequests = requests.filter(req => req.status === 'Pending');
        const processingRequests = requests.filter(req => req.status === 'Processing');
        const completedRequests = requests.filter(req => req.status === 'Completed');

        if (document.getElementById('todayRequests')) {
            document.getElementById('todayRequests').textContent = todayRequests.length;
        }
        if (document.getElementById('weekRequests')) {
            document.getElementById('weekRequests').textContent = weekRequests.length;
        }
        if (document.getElementById('monthRequests')) {
            document.getElementById('monthRequests').textContent = monthRequests.length;
        }
        if (document.getElementById('pendingRequests')) {
            document.getElementById('pendingRequests').textContent = pendingRequests.length;
        }

        // Update filter tab counts
        const allCountEl = document.getElementById('allRequestsCount');
        const pendingTabCountEl = document.getElementById('pendingTabCount');
        const processingCountEl = document.getElementById('processingCount');
        const completedCountEl = document.getElementById('completedCount');
        if (allCountEl) allCountEl.textContent = requests.length;
        if (pendingTabCountEl) pendingTabCountEl.textContent = pendingRequests.length;
        if (processingCountEl) processingCountEl.textContent = processingRequests.length;
        if (completedCountEl) completedCountEl.textContent = completedRequests.length;
    }

    loadRequests() {
        const requests = dataManager.get('testRequests') || [];
        const sorted = requests.sort((a, b) => new Date(b.requestedDate) - new Date(a.requestedDate));
        this.renderRequests(sorted);
        this.updateSummaryCards();
    }

    renderRequests(requests) {
        const container = document.getElementById('requestsList');
        if (!container) return;

        if (requests.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-8">No test requests found</p>';
            return;
        }

        const favorites = dataManager.get('favorites') || { requests: [], results: [], transactions: [] };
        const isFavorited = (id) => favorites.requests.includes(id);

        container.innerHTML = requests.map(req => {
            const favorited = isFavorited(req.id);
            return `
                <div class="request-card">
                    <div class="request-info">
                        <div class="request-header-row">
                            <h3>${req.patientName}</h3>
                            <button class="like-btn ${favorited ? 'liked' : ''}" data-request-id="${req.id}" title="${favorited ? 'Remove from favorites' : 'Add to favorites'}">
                                ${favorited ? '❤️' : '🤍'}
                            </button>
                        </div>
                        <span class="status-badge status-${req.status.toLowerCase()}">${req.status}</span>
                        <p class="request-test">${req.testType}</p>
                        <p class="request-meta">${req.age}y, ${req.gender} • ${dataManager.formatDate(req.requestedDate)} • ${dataManager.formatTime(req.requestedDate)}</p>
                        <p class="request-meta">${req.requestId} • Requested by: ${req.requestedBy}</p>
                    </div>
                    <div class="request-actions">
                        <button class="btn btn-outline view-request-btn" data-request-id="${req.id}">View</button>
                        ${req.status === 'Pending' ? `
                            <button class="btn btn-primary start-process-btn" data-request-id="${req.id}">Start Process</button>
                        ` : req.status === 'Processing' ? `
                            <button class="btn btn-primary mark-complete-btn" data-request-id="${req.id}">Mark Complete</button>
                        ` : ''}
                        <button class="btn btn-outline edit-request-btn" data-request-id="${req.id}">Edit</button>
                        <button class="btn btn-danger delete-request-btn" data-request-id="${req.id}">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    toggleFavorite(requestId) {
        const favorites = dataManager.get('favorites') || { requests: [], results: [], transactions: [] };
        const index = favorites.requests.indexOf(requestId);
        
        if (index > -1) {
            favorites.requests.splice(index, 1);
            dataManager.showNotification('Removed from favorites', 'info');
        } else {
            favorites.requests.push(requestId);
            dataManager.showNotification('Added to favorites', 'success');
        }
        
        dataManager.set('favorites', favorites);
        this.loadRequests();
    }

    showNewRequestModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>New Test Request</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="newRequestForm" class="modal-body">
                    <div class="form-group">
                        <label>Patient Name *</label>
                        <input type="text" name="patientName" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Age *</label>
                            <input type="number" name="age" min="0" max="150" required>
                        </div>
                        <div class="form-group">
                            <label>Gender *</label>
                            <select name="gender" required>
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Test Type *</label>
                        <select name="testType" required>
                            <option value="">Select test type</option>
                            <option value="Complete Blood Count">Complete Blood Count</option>
                            <option value="Urinalysis">Urinalysis</option>
                            <option value="X-Ray Chest PA">X-Ray Chest PA</option>
                            <option value="Lipid Profile">Lipid Profile</option>
                            <option value="Blood Chemistry">Blood Chemistry</option>
                            <option value="Hematology">Hematology</option>
                            <option value="Serology">Serology</option>
                            <option value="Microscopy">Microscopy</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Requested Date & Time *</label>
                        <input type="datetime-local" name="requestedDate" value="${new Date().toISOString().slice(0, 16)}" required>
                    </div>
                    <div class="form-group">
                        <label>Amount (₱)</label>
                        <input type="number" name="amount" step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea name="notes" rows="3"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Request</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('#newRequestForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createRequest(new FormData(e.target));
            modal.remove();
        });
    }

    createRequest(formData) {
        const currentUser = dataManager.getCurrentUser();
        const request = {
            id: dataManager.generateId('REQ'),
            requestId: dataManager.generateId('TR'),
            patientName: formData.get('patientName'),
            age: parseInt(formData.get('age')),
            gender: formData.get('gender'),
            testType: formData.get('testType'),
            status: 'Pending',
            requestedDate: formData.get('requestedDate'),
            amount: formData.get('amount') ? parseFloat(formData.get('amount')) : null,
            notes: formData.get('notes') || '',
            requestedBy: currentUser.name,
            requestedById: currentUser.id,
            paid: false,
            createdAt: new Date().toISOString()
        };

        const requests = dataManager.get('testRequests') || [];
        requests.push(request);
        dataManager.set('testRequests', requests);

        // Log activity
        dataManager.logActivity(
            'Test Request Created',
            'Test Requests',
            `New test request created: ${request.requestId} for ${request.patientName}`,
            currentUser.id,
            currentUser.name,
            currentUser.role,
            { requestId: request.requestId, testType: request.testType }
        );

        dataManager.showNotification('Test request created successfully', 'success');
        this.loadRequests();
        this.updateSummaryCards();
    }

    editRequest(requestId) {
        const requests = dataManager.get('testRequests') || [];
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Test Request</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="editRequestForm" class="modal-body">
                    <div class="form-group">
                        <label>Patient Name *</label>
                        <input type="text" name="patientName" value="${request.patientName}" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Age *</label>
                            <input type="number" name="age" value="${request.age}" min="0" max="150" required>
                        </div>
                        <div class="form-group">
                            <label>Gender *</label>
                            <select name="gender" required>
                                <option value="Male" ${request.gender === 'Male' ? 'selected' : ''}>Male</option>
                                <option value="Female" ${request.gender === 'Female' ? 'selected' : ''}>Female</option>
                                <option value="Other" ${request.gender === 'Other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Test Type *</label>
                        <input type="text" name="testType" value="${request.testType}" required>
                    </div>
                    <div class="form-group">
                        <label>Status *</label>
                        <select name="status" required>
                            <option value="Pending" ${request.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Processing" ${request.status === 'Processing' ? 'selected' : ''}>Processing</option>
                            <option value="Completed" ${request.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Requested Date & Time *</label>
                        <input type="datetime-local" name="requestedDate" value="${new Date(request.requestedDate).toISOString().slice(0, 16)}" required>
                    </div>
                    <div class="form-group">
                        <label>Amount (₱)</label>
                        <input type="number" name="amount" value="${request.amount || ''}" step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea name="notes" rows="3">${request.notes || ''}</textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update Request</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('#editRequestForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateRequest(requestId, new FormData(e.target));
            modal.remove();
        });
    }

    updateRequest(requestId, formData) {
        const currentUser = dataManager.getCurrentUser();
        const requests = dataManager.get('testRequests') || [];
        const requestIndex = requests.findIndex(r => r.id === requestId);
        if (requestIndex === -1) return;

        const oldRequest = { ...requests[requestIndex] };
        requests[requestIndex] = {
            ...requests[requestIndex],
            patientName: formData.get('patientName'),
            age: parseInt(formData.get('age')),
            gender: formData.get('gender'),
            testType: formData.get('testType'),
            status: formData.get('status'),
            requestedDate: formData.get('requestedDate'),
            amount: formData.get('amount') ? parseFloat(formData.get('amount')) : null,
            notes: formData.get('notes') || '',
            updatedAt: new Date().toISOString()
        };

        dataManager.set('testRequests', requests);

        // Log activity
        dataManager.logActivity(
            'Test Request Updated',
            'Test Requests',
            `Test request ${requests[requestIndex].requestId} updated`,
            currentUser.id,
            currentUser.name,
            currentUser.role,
            { requestId: requests[requestIndex].requestId, changes: { old: oldRequest, new: requests[requestIndex] } }
        );

        dataManager.showNotification('Test request updated successfully', 'success');
        this.loadRequests();
        this.updateSummaryCards();
    }

    deleteRequest(requestId) {
        if (!confirm('Are you sure you want to delete this test request?')) return;

        const currentUser = dataManager.getCurrentUser();
        const requests = dataManager.get('testRequests') || [];
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        const filtered = requests.filter(r => r.id !== requestId);
        dataManager.set('testRequests', filtered);

        // Log activity
        dataManager.logActivity(
            'Test Request Deleted',
            'Test Requests',
            `Test request ${request.requestId} deleted`,
            currentUser.id,
            currentUser.name,
            currentUser.role,
            { requestId: request.requestId }
        );

        dataManager.showNotification('Test request deleted successfully', 'success');
        this.loadRequests();
        this.updateSummaryCards();
    }

    updateStatus(requestId, newStatus) {
        const currentUser = dataManager.getCurrentUser();
        const requests = dataManager.get('testRequests') || [];
        const requestIndex = requests.findIndex(r => r.id === requestId);
        if (requestIndex === -1) return;

        const oldStatus = requests[requestIndex].status;
        requests[requestIndex].status = newStatus;
        requests[requestIndex].updatedAt = new Date().toISOString();
        dataManager.set('testRequests', requests);

        // Log activity
        dataManager.logActivity(
            'Test Request Status Updated',
            'Test Requests',
            `Test request ${requests[requestIndex].requestId} status changed from ${oldStatus} to ${newStatus}`,
            currentUser.id,
            currentUser.name,
            currentUser.role,
            { requestId: requests[requestIndex].requestId, oldStatus, newStatus }
        );

        dataManager.showNotification(`Request status updated to ${newStatus}`, 'success');
        this.loadRequests();
        this.updateSummaryCards();
    }

    viewRequest(requestId) {
        const requests = dataManager.get('testRequests') || [];
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Test Request Details</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="detail-view">
                        <div class="detail-row">
                            <span class="label">Request ID:</span>
                            <span class="value">${request.requestId}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Patient Name:</span>
                            <span class="value">${request.patientName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Age & Gender:</span>
                            <span class="value">${request.age}y, ${request.gender}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Test Type:</span>
                            <span class="value">${request.testType}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Status:</span>
                            <span class="value"><span class="status-badge status-${request.status.toLowerCase()}">${request.status}</span></span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Requested Date:</span>
                            <span class="value">${dataManager.formatDateTime(request.requestedDate)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Requested By:</span>
                            <span class="value">${request.requestedBy}</span>
                        </div>
                        ${request.amount ? `
                            <div class="detail-row">
                                <span class="label">Amount:</span>
                                <span class="value">${dataManager.formatCurrency(request.amount)}</span>
                            </div>
                        ` : ''}
                        ${request.notes ? `
                            <div class="detail-row">
                                <span class="label">Notes:</span>
                                <span class="value">${request.notes}</span>
                            </div>
                        ` : ''}
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

    filterRequests(searchTerm) {
        const requests = dataManager.get('testRequests') || [];
        const filtered = requests.filter(req =>
            req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.testType.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderRequests(filtered);
    }

    filterByStatus(status) {
        const requests = dataManager.get('testRequests') || [];
        let filtered = requests;
        
        if (status !== 'All') {
            filtered = requests.filter(r => r.status === status);
        }

        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-status="${status}"]`).classList.add('active');

        this.renderRequests(filtered);
    }
}

// Initialize request manager
document.addEventListener('DOMContentLoaded', () => {
    new RequestManager();
});

