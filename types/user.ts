import { IDocument } from "./document";
import { ILeague } from "./league";
import { ITeam } from "./team";

/**
 * User Roles
 */
export enum UserRole {
  "admin" = "admin",
  "coach" = "coach",
  "manager" = "manager",
  "player" = "player",
}

/**
 * Admin
 */
export interface IAdmin { }

/**
 * Coach
 */
export interface ICoach {
  team?: ITeam;
}

/**
 * Manager
 */
export interface IManager { }

/**
 * Player
 */
export interface IPlayer {
  shirtNumber: number;
  rank: number;
  leagueId?: string;
  league?: ILeague;
  teamId?: string;
  team?: ITeam;
}

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
  coach?: ICoach;
  admin?: IAdmin;
  manager?: IManager;
  player?: IPlayer;
  login?: ILogin;
  active: boolean;
}

export interface IPlayerList extends IDocument {
  selectedList: string[];
  dangerList: string[];
}
