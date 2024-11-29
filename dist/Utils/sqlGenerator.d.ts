import type { DataItem } from "../types";
declare function generateInsertSQL(db: any, tableName: string, data: DataItem[]): Promise<string>;
declare function generateUpdateSQL(tableName: string, data: DataItem[], id: number | string, id_label: string): string;
declare function generateCreateTableSQL(tableName: string, data: DataItem[]): string;
declare const _default: {
    generateInsertSQL: typeof generateInsertSQL;
    generateUpdateSQL: typeof generateUpdateSQL;
    generateCreateTableSQL: typeof generateCreateTableSQL;
};
export default _default;
