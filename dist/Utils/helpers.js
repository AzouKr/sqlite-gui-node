"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quoteColumn = exports.quoteValue = exports.isEmpty = void 0;
// Consider null, undefined and "" as empty, but not 0
const isEmpty = (value) => !value && value !== 0;
exports.isEmpty = isEmpty;
const quoteValue = (item) => {
    const shouldQuote = item.type === "text" ||
        item.type === "blob" ||
        item.type.match(/^varchar/i);
    if ((0, exports.isEmpty)(item.value))
        return "NULL";
    return shouldQuote
        ? `'${String(item.value).replace(/'/g, "''")}'`
        : String(item.value);
};
exports.quoteValue = quoteValue;
const quoteColumn = (columnOrTable) => "`" + columnOrTable + "`";
exports.quoteColumn = quoteColumn;
