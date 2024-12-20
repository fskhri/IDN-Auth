const AuthModel = require('../models/AuthModel');
const AuthService = require('../services/AuthService');

class AuthController {
  constructor() {
    this.authService = new AuthService(AuthModel);
  }

  async login(username, password) {
    try {
      console.log('🔄 Initiating login...');
      const result = await this.authService.login(username, password);
      console.log('✅ Login successful');
      return result;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      throw error;
    }
  }

  async getUserInfo() {
    try {
      console.log('🔄 Fetching user info...');
      return await this.authService.getUserInfo();
    } catch (error) {
      console.error('❌ Failed to get user info:', error.message);
      throw error;
    }
  }

  async getBalanceInfo() {
    try {
      console.log('🔄 Fetching balance info...');
      return await this.authService.getBalanceInfo();
    } catch (error) {
      console.error('❌ Failed to get balance info:', error.message);
      throw error;
    }
  }

  async getTierProgress() {
    try {
      console.log('🔄 Fetching tier progress...');
      return await this.authService.getTierProgress();
    } catch (error) {
      console.error('❌ Failed to get tier progress:', error.message);
      throw error;
    }
  }

  isAuthenticated() {
    const authenticated = AuthModel.isAuthenticated();
    console.log(authenticated ? '✅ User is authenticated' : '❌ User is not authenticated');
    return authenticated;
  }

  clearTokens() {
    console.log('🔄 Clearing tokens...');
    AuthModel.clearTokens();
    console.log('✅ Tokens cleared');
  }
}

module.exports = new AuthController(); 