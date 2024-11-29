import type { DataItem } from "../types";

// Consider null, undefined and "" as empty, but not 0
export const isEmpty = (value: string | number | null | undefined) =>
  !value && value !== 0;

export const quoteValue = (item: DataItem): string => {
  const shouldQuote =
    ["text", "blob", "datetime"].includes(item.type.toLocaleLowerCase()) ||
    item.type.match(/^varchar/i);

  if (isEmpty(item.value)) return "NULL";

  return shouldQuote
    ? `'${String(item.value).replace(/'/g, "''")}'`
    : String(item.value);
};

export const quoteColumn = (columnOrTable: string) => "`" + columnOrTable + "`";
