// Authentication Module
class AuthManager {
    constructor() {
        this.checkAuth();
    }

    checkAuth() {
        const currentUser = dataManager.getCurrentUser();
        const currentPage = window.location.pathname.split('/').pop();

        // If on login page and already logged in, redirect to dashboard
        if (currentPage === 'login.html' && currentUser) {
            window.location.href = '../html/index.html';
            return;
        }

        // If not on login page and not logged in, redirect to login
        if (currentPage !== 'login.html' && !currentUser) {
            window.location.href = '../html/login.html';
            return;
        }

        // If authenticated, update UI
        if (currentUser) {
            this.updateUserDisplay(currentUser);
        }
    }

    login(username, password) {
        const users = dataManager.get('users') || [];
        const user = users.find(u => 
            (u.username === username || u.email === username) && 
            u.password === password && 
            u.status === 'Active'
        );

        if (user) {
            const userData = { ...user };
            delete userData.password; // Don't store password in session
            dataManager.setCurrentUser(userData);
            
            // Log login activity
            dataManager.logActivity(
                'Login',
                'Authentication',
                `User logged in`,
                user.id,
                user.name,
                user.role
            );

            return { success: true, user: userData };
        }

        return { success: false, message: 'Invalid username or password' };
    }

    logout() {
        const currentUser = dataManager.getCurrentUser();
        if (currentUser) {
            // Log logout activity
            dataManager.logActivity(
                'Logout',
                'Authentication',
                `User logged out`,
                currentUser.id,
                currentUser.name,
                currentUser.role
            );
        }
        dataManager.setCurrentUser(null);
        window.location.href = '../html/login.html';
    }

    updateUserDisplay(user) {
        // Update user info in header
        const userNameElements = document.querySelectorAll('.user-name');
        const userRoleElements = document.querySelectorAll('.user-role');
        const userAvatarElements = document.querySelectorAll('.user-avatar');

        userNameElements.forEach(el => {
            if (el) el.textContent = user.name;
        });

        userRoleElements.forEach(el => {
            if (el) el.textContent = user.role;
        });

        userAvatarElements.forEach(el => {
            if (el) {
                const initials = user.name.split(' ').map(n => n[0]).join('');
                el.textContent = initials;
            }
        });
    }

    getCurrentUser() {
        return dataManager.getCurrentUser();
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Handle login form submission
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const result = authManager.login(username, password);
            if (result.success) {
                dataManager.showNotification('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = '../html/index.html';
                }, 500);
            } else {
                dataManager.showNotification(result.message || 'Login failed', 'error');
            }
        });
    }

    // Handle logout
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            authManager.logout();
        });
    });
});

