// Reports & Analytics Module
class ReportsManager {
    constructor() {
        this.init();
    }

    init() {
        if (document.getElementById('reportsContent')) {
            this.loadReports();
            this.updateSummaryCards();
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Date filter
        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => this.filterByDate(e.target.value));
        }
    }

    updateSummaryCards() {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const testRequests = dataManager.get('testRequests') || [];
        const transactions = dataManager.get('transactions') || [];
        const inventory = dataManager.get('inventory') || [];
        const testResults = dataManager.get('testResults') || [];

        // This month's data
        const thisMonthTests = testRequests.filter(req => {
            const reqDate = new Date(req.requestedDate);
            return reqDate >= monthStart;
        });

        const thisMonthTransactions = transactions.filter(txn => {
            const txnDate = new Date(txn.date);
            return txnDate >= monthStart && txn.status === 'Paid';
        });

        const thisMonthRevenue = thisMonthTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

        // Last month's data
        const lastMonthTests = testRequests.filter(req => {
            const reqDate = new Date(req.requestedDate);
            return reqDate >= lastMonthStart && reqDate <= lastMonthEnd;
        });

        const lastMonthTransactions = transactions.filter(txn => {
            const txnDate = new Date(txn.date);
            return txnDate >= lastMonthStart && txnDate <= lastMonthEnd && txn.status === 'Paid';
        });

        const lastMonthRevenue = lastMonthTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

        // Calculate changes
        const testChange = lastMonthTests.length > 0 ? 
            ((thisMonthTests.length - lastMonthTests.length) / lastMonthTests.length * 100).toFixed(1) : 0;
        const revenueChange = lastMonthRevenue > 0 ? 
            ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;

        // Average per day
        const daysInMonth = now.getDate();
        const avgTestsPerDay = daysInMonth > 0 ? Math.round(thisMonthTests.length / daysInMonth) : 0;
        const avgRevenuePerDay = daysInMonth > 0 ? Math.round(thisMonthRevenue / daysInMonth) : 0;

        // Low stock items
        const lowStockItems = inventory.filter(item => item.currentStock <= item.minimumStock);

        if (document.getElementById('totalTests')) {
            document.getElementById('totalTests').textContent = thisMonthTests.length;
        }
        if (document.getElementById('testChange')) {
            document.getElementById('testChange').textContent = `+${testChange}% vs last month`;
        }
        if (document.getElementById('totalRevenue')) {
            document.getElementById('totalRevenue').textContent = `₱${(thisMonthRevenue / 1000).toFixed(0)}K`;
        }
        if (document.getElementById('revenueChange')) {
            document.getElementById('revenueChange').textContent = `+${revenueChange}% vs last month`;
        }
        if (document.getElementById('avgTestsPerDay')) {
            document.getElementById('avgTestsPerDay').textContent = `${avgTestsPerDay} tests`;
        }
        if (document.getElementById('avgRevenuePerDay')) {
            document.getElementById('avgRevenuePerDay').textContent = `₱${avgRevenuePerDay.toLocaleString()} daily`;
        }
        if (document.getElementById('lowStockCount')) {
            document.getElementById('lowStockCount').textContent = lowStockItems.length;
        }

        // Generate charts
        this.generateTestVolumeChart();
        this.generateRevenueChart();
    }

    generateTestVolumeChart() {
        const canvas = document.getElementById('testVolumeChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const testRequests = dataManager.get('testRequests') || [];
        
        // Get last 7 months of data
        const months = [];
        const data = [];
        const now = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            months.push(monthName);
            
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            const count = testRequests.filter(req => {
                const reqDate = new Date(req.requestedDate);
                return reqDate >= monthStart && reqDate <= monthEnd;
            }).length;
            
            data.push(count);
        }

        // Simple bar chart
        const maxValue = Math.max(...data, 1);
        const barWidth = (canvas.width - 100) / data.length;
        const chartHeight = canvas.height - 60;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw bars
        data.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = 50 + index * barWidth;
            const y = canvas.height - 40 - barHeight;
            
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x, y, barWidth - 10, barHeight);
            
            // Value label
            ctx.fillStyle = '#1f2937';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(value, x + (barWidth - 10) / 2, y - 5);
        });
        
        // Draw labels
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        months.forEach((month, index) => {
            const x = 50 + index * barWidth + (barWidth - 10) / 2;
            ctx.fillText(month, x, canvas.height - 20);
        });
    }

    generateRevenueChart() {
        const canvas = document.getElementById('revenueChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const transactions = dataManager.get('transactions') || [];
        
        // Get last 7 months of data
        const months = [];
        const data = [];
        const now = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            months.push(monthName);
            
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            const revenue = transactions
                .filter(txn => {
                    const txnDate = new Date(txn.date);
                    return txnDate >= monthStart && txnDate <= monthEnd && txn.status === 'Paid';
                })
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            data.push(revenue);
        }

        // Simple line chart
        const maxValue = Math.max(...data, 1);
        const chartWidth = canvas.width - 100;
        const chartHeight = canvas.height - 60;
        const pointSpacing = chartWidth / (data.length - 1);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw line
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((value, index) => {
            const x = 50 + index * pointSpacing;
            const y = canvas.height - 40 - (value / maxValue) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Draw points
        data.forEach((value, index) => {
            const x = 50 + index * pointSpacing;
            const y = canvas.height - 40 - (value / maxValue) * chartHeight;
            
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Value label
            ctx.fillStyle = '#1f2937';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`₱${(value / 1000).toFixed(0)}K`, x, y - 10);
        });
        
        // Draw labels
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        months.forEach((month, index) => {
            const x = 50 + index * pointSpacing;
            ctx.fillText(month, x, canvas.height - 20);
        });
    }

    loadReports() {
        // Charts will be generated in updateSummaryCards
        this.updateSummaryCards();
    }

    filterByDate(period) {
        // This would filter the data based on the selected period
        // For now, we'll just reload the reports
        this.updateSummaryCards();
    }
}

// Initialize reports manager
document.addEventListener('DOMContentLoaded', () => {
    new ReportsManager();
});

