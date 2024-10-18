interface DataItem {
  field: string;
  name: string;
  type: string;
  value?: string | number | null; // Optional value based on type
  pk?: string; // Optional primary key constraint
  fk: string;
  default?: string | number | null; // Optional default value
}

// Consider null, undefined and "" as empty, but not 0
export const isEmpty = (value: string | number | null | undefined) =>
  !value && value !== 0;

export const quoteValue = (item: DataItem): string => {
  const shouldQuote =
    item.type === "text" ||
    item.type === "blob" ||
    item.type.match(/^varchar/i);

  if (isEmpty(item.value)) return "NULL";

  return shouldQuote
    ? `'${String(item.value).replace(/'/g, "''")}'`
    : String(item.value);
};

export const quoteColumn = (columnOrTable: string) => "`" + columnOrTable + "`";
