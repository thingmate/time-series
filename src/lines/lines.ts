export type Lines = readonly string[];

export function indent(lines: Lines, indent: string = '  '): Lines {
  return lines.map((line: string): string => `${indent}${line}`);
}

export function join(lines: Lines, jointure: string = '\n'): string {
  return lines.join(jointure);
}
