import { IDocument } from "./document";
import { INet } from "./net";
import { ISub } from "./sub";
import { ITeam } from "./team";

export interface IRound extends IDocument {
  matchId: string;
  num: number;
  locked?: boolean;
  teamA?: ITeam;
  teamB?: ITeam;
  nets?: INet[];
  sub?: ISub;
  teamAScore?: number;
  teamBScore?: number;
}
