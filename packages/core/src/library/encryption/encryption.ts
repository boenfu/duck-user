import CryptoJS from 'crypto-js';

export function decrypt(content: string, key: string): string {
  return CryptoJS.AES.decrypt(content, key).toString();
}

export function encrypt(content: string, key: string): string {
  return CryptoJS.AES.encrypt(content, key).toString();
}
