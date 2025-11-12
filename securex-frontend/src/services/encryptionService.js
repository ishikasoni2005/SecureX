import CryptoJS from 'crypto-js';

class EncryptionService {
  constructor() {
    this.secretKey = process.env.REACT_APP_ENCRYPTION_KEY || 'fallback-secret-key';
  }

  encrypt(data) {
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), this.secretKey).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }

  decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  hash(data) {
    return CryptoJS.SHA256(data).toString();
  }

  // Secure storage with encryption
  setSecureItem(key, value) {
    const encrypted = this.encrypt(value);
    if (encrypted) {
      localStorage.setItem(key, encrypted);
      return true;
    }
    return false;
  }

  getSecureItem(key) {
    const encrypted = localStorage.getItem(key);
    if (encrypted) {
      return this.decrypt(encrypted);
    }
    return null;
  }

  removeSecureItem(key) {
    localStorage.removeItem(key);
  }

  // Generate secure tokens
  generateToken(length = 32) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return this.hash(result);
  }
}

export default new EncryptionService();