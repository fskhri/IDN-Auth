class AuthModel {
  constructor() {
    this.tokens = {
      accessToken: null,
      idToken: null,
      refreshToken: null
    };
    this.deviceKey = 'ap-southeast-1_e9b6d680-4931-45b6-837a-e6c9e697b9be';
  }

  setTokens(authResult) {
    this.tokens = {
      accessToken: authResult.AccessToken,
      idToken: authResult.IdToken,
      refreshToken: authResult.RefreshToken
    };
  }

  clearTokens() {
    this.tokens = {
      accessToken: null,
      idToken: null,
      refreshToken: null
    };
  }

  isAuthenticated() {
    return !!this.tokens.accessToken;
  }

  getTokens() {
    return this.tokens;
  }

  getDeviceKey() {
    return this.deviceKey;
  }
}

module.exports = new AuthModel(); 