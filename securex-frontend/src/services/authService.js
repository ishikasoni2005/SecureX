class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || '/api/v1';
  }

  async login(email, password) {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Login failed');
    }
    const data = await res.json();
    const { token, user } = data;
    if (!token || !user) throw new Error('Invalid login response');
    this.currentUser = user;
    this.isAuthenticated = true;
    localStorage.setItem('securex_user', JSON.stringify(user));
    localStorage.setItem('securex_token', token);
    return user;
  }

  async register({ name, email, password, role, department }) {
    const res = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, department })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Registration failed');
    }
    const data = await res.json();
    const { token, user } = data;
    this.currentUser = user;
    this.isAuthenticated = true;
    localStorage.setItem('securex_user', JSON.stringify(user));
    localStorage.setItem('securex_token', token);
    return user;
  }

  async logout() {
    try {
      const token = localStorage.getItem('securex_token');
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (_) {
      // ignore network errors on logout
    }
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem('securex_user');
    localStorage.removeItem('securex_token');
  }

  async getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Check localStorage
    const storedUser = localStorage.getItem('securex_user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      this.isAuthenticated = true;
      return this.currentUser;
    }

    return null;
  }

  async checkAuth() {
    const user = await this.getCurrentUser();
    return !!user;
  }

  // Mock token validation
  async validateToken() {
    const token = localStorage.getItem('securex_token');
    return !!token;
  }

  // Role-based access control
  hasPermission(requiredRole) {
    if (!this.currentUser) return false;
    
    const roleHierarchy = {
      viewer: ['viewer'],
      analyst: ['viewer', 'analyst'],
      administrator: ['viewer', 'analyst', 'administrator']
    };

    const userRoles = roleHierarchy[this.currentUser.role] || [];
    return userRoles.includes(requiredRole);
  }

  // Password strength validation
  validatePassword(password) {
    const requirements = {
      minLength: 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    return {
      isValid: password.length >= requirements.minLength &&
               requirements.hasUpperCase &&
               requirements.hasLowerCase &&
               requirements.hasNumbers &&
               requirements.hasSpecialChar,
      requirements
    };
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService;