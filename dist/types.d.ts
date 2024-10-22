export interface DataItem {
    field: string;
    name: string;
    type: string;
    value?: string | number | null;
    pk?: string;
    fk: string;
    default?: string | number | null;
}
