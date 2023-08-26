import { IDocument } from "./document";
import { IRound } from "./round";
import { IUser } from "./user";

export interface INet extends IDocument {
  roundId: string;
  num: number;
  teamAPlayerAId?: string;
  teamAPlayerBId?: string;
  teamBPlayerAId?: string;
  teamBPlayerBId?: string;
  points: number;
  teamAScore: number;
  teamBScore: number;
  locked?: boolean;
  round?: IRound;
  teamAPlayerA?: IUser;
  teamAPlayerB?: IUser;
  teamBPlayerA?: IUser;
  teamBPlayerB?: IUser;
  pairRange?: number;
  timestamp?: number;
}
