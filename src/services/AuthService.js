const config = require('../config/auth.config');

class AuthService {
  constructor(authModel) {
    this.authModel = authModel;
  }

  async login(username, password) {
    try {
      // First attempt: SRP Auth
      const initialAuth = await this._initiateSRPAuth(username);
      
      if (initialAuth.ChallengeName === 'PASSWORD_VERIFIER') {
        const passwordAuthResult = await this._handlePasswordVerifier(
          username, 
          password, 
          initialAuth.Session
        );
        
        if (passwordAuthResult.AuthenticationResult) {
          this.authModel.setTokens(passwordAuthResult.AuthenticationResult);
          return passwordAuthResult;
        }
      }

      // Fallback: Direct Password Auth
      const directAuthResult = await this._initiateDirectAuth(username, password);
      
      if (directAuthResult.AuthenticationResult) {
        this.authModel.setTokens(directAuthResult.AuthenticationResult);
        return directAuthResult;
      }

      throw new Error('Failed to obtain authentication tokens');
    } catch (error) {
      throw new Error('Login failed: ' + error.message);
    }
  }

  async getUserInfo() {
    if (!this.authModel.isAuthenticated()) {
      throw new Error('No access token available. Please login first.');
    }

    const response = await fetch(config.COGNITO_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityProviderService.GetUser',
        'x-amz-user-agent': 'aws-amplify/5.0.4 js'
      },
      body: JSON.stringify({
        AccessToken: this.authModel.getTokens().accessToken
      })
    });

    return await response.json();
  }

  async getBalanceInfo() {
    if (!this.authModel.isAuthenticated()) {
      throw new Error('No tokens available. Please login first.');
    }

    const tokens = this.authModel.getTokens();
    const response = await fetch('https://mobile-api.idn.app/v3.1/balance-user', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'access-token': tokens.accessToken,
        'authorization': `Bearer ${tokens.idToken}`,
        'x-api-key': '1ccc5bc4-8bb4-414c-b524-92d11a85a818',
        'session-id': this.authModel.getDeviceKey(),
        'x-request-id': this.authModel.getDeviceKey()
      }
    });

    return await response.json();
  }

  async getTierProgress() {
    if (!this.authModel.isAuthenticated()) {
      throw new Error('No tokens available. Please login first.');
    }

    const tokens = this.authModel.getTokens();
    const response = await fetch('https://api.idn.app/api/v1/tier/progress?n=1', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'access-token': tokens.accessToken,
        'authorization': `Bearer ${tokens.idToken}`,
        'x-api-key': '123f4c4e-6ce1-404d-8786-d17e46d65b5c',
        'session-id': this.authModel.getDeviceKey(),
        'x-request-id': this.authModel.getDeviceKey()
      }
    });

    return await response.json();
  }

  async _initiateSRPAuth(username) {
    const response = await fetch(config.COGNITO_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        'x-amz-user-agent': 'aws-amplify/5.0.4 js'
      },
      body: JSON.stringify({
        AuthFlow: 'USER_SRP_AUTH',
        ClientId: config.CLIENT_ID,
        AuthParameters: {
          USERNAME: username,
          SRP_A: "123", // This should be properly calculated
        },
        ClientMetadata: {
          portal: 'idn-media',
          platform: 'desktop-web'
        }
      })
    });

    return await response.json();
  }

  async _handlePasswordVerifier(username, password, session) {
    const response = await fetch(config.COGNITO_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityProviderService.RespondToAuthChallenge'
      },
      body: JSON.stringify({
        ChallengeName: 'PASSWORD_VERIFIER',
        ClientId: config.CLIENT_ID,
        ChallengeResponses: {
          USERNAME: username,
          PASSWORD: password,
          TIMESTAMP: new Date().toISOString(),
          DEVICE_KEY: this.authModel.getDeviceKey()
        },
        Session: session
      })
    });

    return await response.json();
  }

  async _initiateDirectAuth(username, password) {
    const response = await fetch(config.COGNITO_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        'x-amz-user-agent': 'aws-amplify/5.0.4 js'
      },
      body: JSON.stringify({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: config.CLIENT_ID,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password
        }
      })
    });

    return await response.json();
  }
}

module.exports = AuthService; 