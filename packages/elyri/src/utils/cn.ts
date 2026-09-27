export type ClassValue = string | number | null | undefined | false | ClassValue[];

export function cn(...values: ClassValue[]): string {
  const classes: string[] = [];

  for (const value of values) {
    if (!value) continue;
    classes.push(Array.isArray(value) ? cn(...value) : String(value));
  }

  return classes.filter(Boolean).join(' ');
}
