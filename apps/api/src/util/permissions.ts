import { Request } from "express";

export function belongsToUser(req: Request, ownerId?: any) {
  const uid = (req as any).userId;
  return ownerId?.toString && uid && ownerId.toString() === uid;
}
