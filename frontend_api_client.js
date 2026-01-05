// Simple API Client
class RecoverAIClient {
  constructor() {
    this.baseUrl = 'http://localhost:9000/api/v1';
    this.token = null;
  }

  async login(email, password) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    this.token = data.access_token;
    return data;
  }

  async getDashboard() {
    return this._request('GET', '/cases/dashboard/stats');
  }

  async getCases() {
    return this._request('GET', '/cases');
  }

  async _request(method, endpoint) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { 'Authorization': `Bearer ${this.token}` };
    
    const response = await fetch(url, { method, headers });
    return response.json();
  }
}

// Export
if (typeof window !== 'undefined') window.RecoverAIClient = RecoverAIClient;