export interface DataItem {
  field: string;
  name: string;
  type: string;
  value?: string | number | null; // Optional value based on type
  pk?: string; // Optional primary key constraint
  fk: string;
  default?: string | number | null; // Optional default value
}
