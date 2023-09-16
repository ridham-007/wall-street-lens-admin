import CryptoJS from "crypto-js";
const SECRET_KEY = "my_secret_key";

export enum LoginStorageKeys {
  "token" = "token",
  "user" = "user",
}

function encryptString(str: any) {
  const encrypted = CryptoJS.AES.encrypt(str, SECRET_KEY);
  return encrypted.toString();
}
function decryptString(str: any) {
  const decrypted = CryptoJS.AES.decrypt(str, SECRET_KEY);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

export class LoginService {
  static saveToken(token: string) {
    localStorage.setItem(LoginStorageKeys.token, encryptString(token));
  }

  static deleteToken() {
    localStorage.removeItem(LoginStorageKeys.token);
  }

  static getToken() {
    try {
      const decryptToken = localStorage.getItem(LoginStorageKeys.token);
      var token = decryptString(decryptToken || "")
      if (!token) throw token;
      return token;
    } catch (err) {
      return null;
    }
  }

  static deleteUser() {
    localStorage.removeItem(LoginStorageKeys.user);
  }

  static saveUser(user: any) {
    try {
      if (user)
        localStorage.setItem(LoginStorageKeys.user, encryptString(JSON.stringify(user)));
      return user;
    } catch {
      return null;
    }
  }

  static getUser() {
    try {
      const decryptUserData = localStorage.getItem(LoginStorageKeys.user) || "";
      var user = decryptString(decryptUserData || "");

      if (!user) throw user;
      return JSON.parse(user);
    } catch (err) {
      return null;
    }
  }
}
