import { IDocument } from "./document";
import { ILeague } from "./league";
import { IRound } from "./round";
import { ITeam } from "./team";

export interface IMatch extends IDocument {
  teamAId: string;
  teamBId: string;
  leagueId: string;
  date: Date;
  location: string;
  numberOfNets: number;
  numberOfRounds: number;
  netRange: number;
  pairLimit: number;
  teamA?: ITeam;
  teamB?: ITeam;
  rounds: IRound[];
  league?: ILeague;
  winner?: ITeam;
  teamAScore?: number;
  teamBScore?: number;
  active: boolean;
}
