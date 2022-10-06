// Source:
// Suburbs with long/lat => https://developers.google.com/public-data/docs/canonical/suburbs_csv
// Suburbs images => https://github.com/djaiss/mapsicon

import { suburbs } from "./suburbs.position";
import { suburbCodesWithImage } from "./suburbs.image";

export interface Suburb {
  code: string;
  latitude: number;
  longitude: number;
  name: string;
}

export const suburbsWithImage = suburbs.filter((c) =>
  suburbCodesWithImage.includes(c.code.toLowerCase())
);

export function getSuburbName(language: string, suburb: Suburb) {
  return suburb.name;
}

export function sanitizeSuburbName(suburbName: string): string {
  return suburbName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[- '()]/g, "")
    .toLowerCase();
}
