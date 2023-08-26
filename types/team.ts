import { IDocument } from "./document";
import { ILeague } from "./league";
import { IUser } from "./user";

export interface ITeam extends IDocument {
  name: string;
  active: boolean;
  coachId: string;
  coach?: IUser;
  leagueId: string;
  league?: ILeague;
  players?: IUser[];
  teamLeaguesData?: any;
}
