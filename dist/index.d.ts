import { Request, Response, NextFunction, type Application } from "express";
import type { Database } from "sqlite3";
export declare function SqliteGuiNode(db: Database, port?: number): Promise<void>;
export declare function createSqliteGuiApp(db: Database): Promise<Application>;
export declare function SqliteGuiNodeMiddleware(app: any, db: Database): (req: Request, res: Response, next: NextFunction) => Promise<void>;
