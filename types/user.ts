import { IDocument } from "./document";


/**
 * User Roles
 */
export enum UserRole {
  "admin" = "admin",
}

/**
 * Admin
 */
export interface IAdmin { }


/**
 * Manager
 */
export interface IManager { }



/**
 * Login
 */
export interface ILogin {
  email: string;
  password: string;
}

/**
 * User
 */
export interface IUser extends IDocument {
  firstName: string;
  lastName: string;
  role: UserRole;
  admin?: IAdmin;
  manager?: IManager;
  login?: ILogin;
  active: boolean;
}