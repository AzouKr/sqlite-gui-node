import type { Database } from "sqlite3";
declare function tableRoutes(db: Database): import("express-serve-static-core").Router;
export default tableRoutes;
