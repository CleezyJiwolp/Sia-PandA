// Test Results Management Module
class ResultsManager {
    constructor() {
        this.init();
    }

    init() {
        if (document.getElementById('resultsList')) {
            this.loadResults();
            this.updateSummaryCards();
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Upload results button
        const uploadBtn = document.getElementById('uploadResultsBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.showUploadResultsModal());
        }

        // Search
        const searchInput = document.getElementById('resultsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterResults(e.target.value));
        }

        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-result-btn')) {
                const resultId = e.target.closest('.view-result-btn').dataset.resultId;
                this.viewResult(resultId);
            }
            if (e.target.closest('.edit-result-btn')) {
                const resultId = e.target.closest('.edit-result-btn').dataset.resultId;
                this.editResult(resultId);
            }
            if (e.target.closest('.download-result-btn')) {
                const resultId = e.target.closest('.download-result-btn').dataset.resultId;
                this.downloadResult(resultId);
            }
            if (e.target.closest('.print-result-btn')) {
                const resultId = e.target.closest('.print-result-btn').dataset.resultId;
                this.printResult(resultId);
            }
            if (e.target.closest('.like-btn') && e.target.closest('.like-btn').dataset.resultId) {
                const resultId = e.target.closest('.like-btn').dataset.resultId;
                this.toggleFavorite(resultId);
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

        const results = dataManager.get('testResults') || [];
        const testRequests = dataManager.get('testRequests') || [];

        const releasedToday = results.filter(res => {
            const resDate = new Date(res.releasedDate).toDateString();
            return resDate === today && res.status === 'Released';
        });

        const inProgress = testRequests.filter(req => req.status === 'Processing').length;

        const weekResults = results.filter(res => {
            const resDate = new Date(res.releasedDate);
            return resDate >= weekStart && res.status === 'Released';
        });

        const monthResults = results.filter(res => {
            const resDate = new Date(res.releasedDate);
            return resDate >= monthStart && res.status === 'Released';
        });

        if (document.getElementById('releasedToday')) {
            document.getElementById('releasedToday').textContent = releasedToday.length;
        }
        if (document.getElementById('inProgress')) {
            document.getElementById('inProgress').textContent = inProgress;
        }
        if (document.getElementById('weekResults')) {
            document.getElementById('weekResults').textContent = weekResults.length;
        }
        if (document.getElementById('monthResults')) {
            document.getElementById('monthResults').textContent = monthResults.length;
        }
    }

    loadResults() {
        const results = dataManager.get('testResults') || [];
        const sorted = results.sort((a, b) => new Date(b.releasedDate || b.createdAt) - new Date(a.releasedDate || a.createdAt));
        this.renderResults(sorted);
    }

    renderResults(results) {
        const container = document.getElementById('resultsList');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-8">No test results found. Click "Upload Results" to add results.</p>';
            return;
        }

        const favorites = dataManager.get('favorites') || { requests: [], results: [], transactions: [] };
        const isFavorited = (id) => favorites.results.includes(id);

        container.innerHTML = results.map(result => {
            const favorited = isFavorited(result.id);
            return `
                <div class="result-card">
                    <div class="result-icon">
                        <i class="icon-document">📄</i>
                    </div>
                    <div class="result-details">
                        <div class="result-header-row">
                            <h3>${result.patientName}</h3>
                            <button class="like-btn ${favorited ? 'liked' : ''}" data-result-id="${result.id}" title="${favorited ? 'Remove from favorites' : 'Add to favorites'}">
                                ${favorited ? '❤️' : '🤍'}
                            </button>
                        </div>
                        <span class="status-badge status-${result.status.toLowerCase()}">${result.status}</span>
                        <div class="result-meta">
                            <span class="document-type">${result.documentType || 'PDF'}</span>
                        </div>
                        <p class="result-test">${result.testType}</p>
                        <p class="result-info">${result.age}y, ${result.gender}</p>
                        <p class="result-meta-text">${dataManager.formatDateTime(result.releasedDate || result.createdAt)}</p>
                        <p class="result-meta-text">${result.requestId} • Performed by: ${result.performedBy}</p>
                        ${result.resultSummary ? `
                            <div class="result-summary">
                                ${Object.entries(result.resultSummary).slice(0, 4).map(([key, value]) => `
                                    <span class="result-param"><strong>${key}:</strong> ${value}</span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="result-actions">
                        <button class="btn btn-outline view-result-btn" data-result-id="${result.id}">View Details</button>
                        <button class="btn btn-outline edit-result-btn" data-result-id="${result.id}">Edit</button>
                        <button class="btn btn-outline download-result-btn" data-result-id="${result.id}">Download</button>
                        <button class="btn btn-primary print-result-btn" data-result-id="${result.id}">Print</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    toggleFavorite(resultId) {
        const favorites = dataManager.get('favorites') || { requests: [], results: [], transactions: [] };
        const index = favorites.results.indexOf(resultId);
        
        if (index > -1) {
            favorites.results.splice(index, 1);
            dataManager.showNotification('Removed from favorites', 'info');
        } else {
            favorites.results.push(resultId);
            dataManager.showNotification('Added to favorites', 'success');
        }
        
        dataManager.set('favorites', favorites);
        this.loadResults();
    }

    showUploadResultsModal() {
        const testRequests = dataManager.get('testRequests') || [];
        const completedRequests = testRequests.filter(req => req.status === 'Completed' && !req.hasResult);

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>Upload Test Results</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="uploadResultsForm" class="modal-body">
                    <div class="form-group">
                        <label>Test Request *</label>
                        <select name="requestId" id="requestSelect" required>
                            <option value="">Select test request</option>
                            ${completedRequests.map(req => `
                                <option value="${req.id}" 
                                    data-patient="${req.patientName}"
                                    data-age="${req.age}"
                                    data-gender="${req.gender}"
                                    data-test="${req.testType}"
                                    data-requestid="${req.requestId}">
                                    ${req.requestId} - ${req.patientName} - ${req.testType}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Patient Name *</label>
                        <input type="text" name="patientName" id="patientNameInput" required readonly>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Age</label>
                            <input type="number" name="age" id="ageInput" readonly>
                        </div>
                        <div class="form-group">
                            <label>Gender</label>
                            <input type="text" name="gender" id="genderInput" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Test Type *</label>
                        <input type="text" name="testType" id="testTypeInput" required readonly>
                    </div>
                    <div class="form-group">
                        <label>Status *</label>
                        <select name="status" required>
                            <option value="In Progress">In Progress</option>
                            <option value="Released" selected>Released</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Released Date & Time *</label>
                        <input type="datetime-local" name="releasedDate" value="${new Date().toISOString().slice(0, 16)}" required>
                    </div>
                    <div class="form-group">
                        <label>Document Type</label>
                        <select name="documentType">
                            <option value="PDF" selected>PDF</option>
                            <option value="Image">Image</option>
                            <option value="Text">Text</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Result Summary (Key-Value pairs, one per line)</label>
                        <textarea name="resultSummary" id="resultSummaryInput" rows="8" placeholder="Color: Yellow&#10;Transparency: Clear&#10;PH: 6.0&#10;Specific Gravity: 1.015&#10;Protein: Negative&#10;Glucose: Negative"></textarea>
                        <small>Format: Parameter: Value (one per line)</small>
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea name="notes" rows="3"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Upload Results</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Auto-fill form when request is selected
        const requestSelect = modal.querySelector('#requestSelect');
        requestSelect.addEventListener('change', (e) => {
            const option = e.target.selectedOptions[0];
            if (option.value) {
                modal.querySelector('#patientNameInput').value = option.dataset.patient;
                modal.querySelector('#ageInput').value = option.dataset.age;
                modal.querySelector('#genderInput').value = option.dataset.gender;
                modal.querySelector('#testTypeInput').value = option.dataset.test;
            }
        });

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('#uploadResultsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createResult(new FormData(e.target));
            modal.remove();
        });
    }

    createResult(formData) {
        const currentUser = dataManager.getCurrentUser();
        const requestId = formData.get('requestId');
        
        // Parse result summary
        const summaryText = formData.get('resultSummary');
        const resultSummary = {};
        if (summaryText) {
            summaryText.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length > 0) {
                    resultSummary[key.trim()] = valueParts.join(':').trim();
                }
            });
        }

        const result = {
            id: dataManager.generateId('RES'),
            requestId: formData.get('requestId') ? 
                (document.querySelector(`#requestSelect option[value="${formData.get('requestId')}"]`)?.dataset.requestid || dataManager.generateId('TR')) : 
                dataManager.generateId('TR'),
            patientName: formData.get('patientName'),
            age: parseInt(formData.get('age')) || null,
            gender: formData.get('gender') || null,
            testType: formData.get('testType'),
            status: formData.get('status'),
            releasedDate: formData.get('releasedDate'),
            documentType: formData.get('documentType') || 'PDF',
            resultSummary: Object.keys(resultSummary).length > 0 ? resultSummary : null,
            notes: formData.get('notes') || '',
            performedBy: currentUser.name,
            performedById: currentUser.id,
            createdAt: new Date().toISOString()
        };

        const results = dataManager.get('testResults') || [];
        results.push(result);
        dataManager.set('testResults', results);

        // Mark request as having result
        if (requestId) {
            const requests = dataManager.get('testRequests') || [];
            const request = requests.find(r => r.id === requestId);
            if (request) {
                request.hasResult = true;
                if (result.status === 'Released') {
                    request.status = 'Completed';
                }
                dataManager.set('testRequests', requests);
            }
        }

        // Log activity
        dataManager.logActivity(
            'Test Result Uploaded',
            'Test Results',
            `Test result uploaded for ${result.requestId} - ${result.patientName}`,
            currentUser.id,
            currentUser.name,
            currentUser.role,
            { resultId: result.id, requestId: result.requestId }
        );

        dataManager.showNotification('Test result uploaded successfully', 'success');
        this.loadResults();
        this.updateSummaryCards();
    }

    viewResult(resultId) {
        const results = dataManager.get('testResults') || [];
        const result = results.find(r => r.id === resultId);
        if (!result) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>Test Result Details</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="detail-view">
                        <div class="detail-row">
                            <span class="label">Request ID:</span>
                            <span class="value">${result.requestId}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Patient Name:</span>
                            <span class="value">${result.patientName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Age & Gender:</span>
                            <span class="value">${result.age}y, ${result.gender}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Test Type:</span>
                            <span class="value">${result.testType}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Status:</span>
                            <span class="value"><span class="status-badge status-${result.status.toLowerCase()}">${result.status}</span></span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Released Date:</span>
                            <span class="value">${dataManager.formatDateTime(result.releasedDate || result.createdAt)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Performed By:</span>
                            <span class="value">${result.performedBy}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Document Type:</span>
                            <span class="value">${result.documentType || 'PDF'}</span>
                        </div>
                        ${result.resultSummary ? `
                            <div class="detail-row">
                                <span class="label">Result Summary:</span>
                                <span class="value"></span>
                            </div>
                            <div class="result-summary-detail">
                                ${Object.entries(result.resultSummary).map(([key, value]) => `
                                    <div class="result-param-row">
                                        <strong>${key}:</strong> ${value}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        ${result.notes ? `
                            <div class="detail-row">
                                <span class="label">Notes:</span>
                                <span class="value">${result.notes}</span>
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

    editResult(resultId) {
        const results = dataManager.get('testResults') || [];
        const result = results.find(r => r.id === resultId);
        if (!result) return;

        const summaryText = result.resultSummary ? 
            Object.entries(result.resultSummary).map(([k, v]) => `${k}: ${v}`).join('\n') : '';

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>Edit Test Result</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="editResultForm" class="modal-body">
                    <div class="form-group">
                        <label>Status *</label>
                        <select name="status" required>
                            <option value="In Progress" ${result.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Released" ${result.status === 'Released' ? 'selected' : ''}>Released</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Released Date & Time *</label>
                        <input type="datetime-local" name="releasedDate" value="${new Date(result.releasedDate || result.createdAt).toISOString().slice(0, 16)}" required>
                    </div>
                    <div class="form-group">
                        <label>Result Summary (Key-Value pairs, one per line)</label>
                        <textarea name="resultSummary" rows="8">${summaryText}</textarea>
                        <small>Format: Parameter: Value (one per line)</small>
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea name="notes" rows="3">${result.notes || ''}</textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update Result</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('#editResultForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateResult(resultId, new FormData(e.target));
            modal.remove();
        });
    }

    updateResult(resultId, formData) {
        const currentUser = dataManager.getCurrentUser();
        const results = dataManager.get('testResults') || [];
        const resultIndex = results.findIndex(r => r.id === resultId);
        if (resultIndex === -1) return;

        // Parse result summary
        const summaryText = formData.get('resultSummary');
        const resultSummary = {};
        if (summaryText) {
            summaryText.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length > 0) {
                    resultSummary[key.trim()] = valueParts.join(':').trim();
                }
            });
        }

        results[resultIndex] = {
            ...results[resultIndex],
            status: formData.get('status'),
            releasedDate: formData.get('releasedDate'),
            resultSummary: Object.keys(resultSummary).length > 0 ? resultSummary : results[resultIndex].resultSummary,
            notes: formData.get('notes') || '',
            updatedAt: new Date().toISOString()
        };

        dataManager.set('testResults', results);

        // Log activity
        dataManager.logActivity(
            'Test Result Updated',
            'Test Results',
            `Test result ${results[resultIndex].requestId} updated`,
            currentUser.id,
            currentUser.name,
            currentUser.role,
            { resultId: results[resultIndex].id }
        );

        dataManager.showNotification('Test result updated successfully', 'success');
        this.loadResults();
        this.updateSummaryCards();
    }

    downloadResult(resultId) {
        const results = dataManager.get('testResults') || [];
        const result = results.find(r => r.id === resultId);
        if (!result) return;

        // Create a simple text file with result data
        let content = `P and A Laboratory\n`;
        content += `Test Result Report\n\n`;
        content += `Request ID: ${result.requestId}\n`;
        content += `Patient: ${result.patientName}\n`;
        content += `Test Type: ${result.testType}\n`;
        content += `Released Date: ${dataManager.formatDateTime(result.releasedDate || result.createdAt)}\n`;
        content += `Performed By: ${result.performedBy}\n\n`;
        
        if (result.resultSummary) {
            content += `Results:\n`;
            Object.entries(result.resultSummary).forEach(([key, value]) => {
                content += `${key}: ${value}\n`;
            });
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TestResult_${result.requestId}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);

        dataManager.showNotification('Result downloaded', 'success');
    }

    printResult(resultId) {
        const results = dataManager.get('testResults') || [];
        const result = results.find(r => r.id === resultId);
        if (!result) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Test Result - ${result.requestId}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #2563eb; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .detail { margin: 10px 0; }
                        .result-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        .result-table th, .result-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        .result-table th { background-color: #f3f4f6; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>P and A Laboratory</h1>
                        <p>Digos City, Davao del Sur, Philippines</p>
                        <h2>Test Result Report</h2>
                    </div>
                    <div class="detail"><strong>Request ID:</strong> ${result.requestId}</div>
                    <div class="detail"><strong>Patient Name:</strong> ${result.patientName}</div>
                    <div class="detail"><strong>Age & Gender:</strong> ${result.age}y, ${result.gender}</div>
                    <div class="detail"><strong>Test Type:</strong> ${result.testType}</div>
                    <div class="detail"><strong>Released Date:</strong> ${dataManager.formatDateTime(result.releasedDate || result.createdAt)}</div>
                    <div class="detail"><strong>Performed By:</strong> ${result.performedBy}</div>
                    ${result.resultSummary ? `
                        <table class="result-table">
                            <thead>
                                <tr><th>Parameter</th><th>Value</th></tr>
                            </thead>
                            <tbody>
                                ${Object.entries(result.resultSummary).map(([key, value]) => `
                                    <tr><td>${key}</td><td>${value}</td></tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : ''}
                    ${result.notes ? `<div class="detail"><strong>Notes:</strong> ${result.notes}</div>` : ''}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    filterResults(searchTerm) {
        const results = dataManager.get('testResults') || [];
        const filtered = results.filter(result =>
            result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.testType.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderResults(filtered);
    }
}

// Initialize results manager
document.addEventListener('DOMContentLoaded', () => {
    new ResultsManager();
});

