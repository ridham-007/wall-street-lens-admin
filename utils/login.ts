export enum LoginStorageKeys {
  "token" = "token",
  "user" = "user",
}

export class LoginService {
  static saveToken(token: string) {
    localStorage.setItem(LoginStorageKeys.token, token);
  }

  static deleteToken() {
    localStorage.removeItem(LoginStorageKeys.token);
  }

  static getToken() {
    try {
      const token = localStorage.getItem(LoginStorageKeys.token);
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
        localStorage.setItem(LoginStorageKeys.user, JSON.stringify(user));
      return user;
    } catch {
      return null;
    }
  }

  static getUser() {
    try {
      const user = JSON.parse(
        localStorage.getItem(LoginStorageKeys.user) || ""
      );

      if (!user) throw user;
      return user;
    } catch (err) {
      return null;
    }
  }
}
