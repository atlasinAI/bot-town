import type { BuildingId } from './bots';

export type BuildingDef = {
  id: BuildingId;
  name: string;
  short: string;
  theme: {
    roof: string;
    roofDark: string;
    wall: string;
    wallDark: string;
    trim: string;
    floor: string;
    floorDark: string;
    accent: string;
  };
  x: number;
  y: number;
};

export const BUILDINGS: BuildingDef[] = [
  {
    id: 'office',
    name: '办公楼',
    short: '办公',
    theme: {
      roof: '#3d5a80',
      roofDark: '#293d5a',
      wall: '#e8eef6',
      wallDark: '#c5d0de',
      trim: '#2c3d55',
      floor: '#d7c4a3',
      floorDark: '#c4ae86',
      accent: '#5b8bd4',
    },
    x: 560,
    y: 28,
  },
  {
    id: 'finance',
    name: '会计楼',
    short: '会计',
    theme: {
      roof: '#2d6a4f',
      roofDark: '#1b4332',
      wall: '#e6f4ea',
      wallDark: '#c4e0cd',
      trim: '#1b4332',
      floor: '#d4c4a8',
      floorDark: '#c0ad8c',
      accent: '#40916c',
    },
    x: 220,
    y: 150,
  },
  {
    id: 'sales',
    name: '销售楼',
    short: '销售',
    theme: {
      roof: '#c2410c',
      roofDark: '#7c2d12',
      wall: '#fff1e6',
      wallDark: '#f0d2b8',
      trim: '#7c2d12',
      floor: '#e2c9a0',
      floorDark: '#cdaf80',
      accent: '#ea580c',
    },
    x: 900,
    y: 150,
  },
  {
    id: 'marketing',
    name: '营销楼',
    short: '营销',
    theme: {
      roof: '#9d174d',
      roofDark: '#6b0f33',
      wall: '#fde8f0',
      wallDark: '#f0c4d4',
      trim: '#6b0f33',
      floor: '#e6d0b8',
      floorDark: '#d0b898',
      accent: '#db2777',
    },
    x: 220,
    y: 450,
  },
  {
    id: 'engineering',
    name: '工程楼',
    short: '工程',
    theme: {
      roof: '#b45309',
      roofDark: '#78350f',
      wall: '#ece7dc',
      wallDark: '#d1c9b6',
      trim: '#44403c',
      floor: '#b8b0a0',
      floorDark: '#9a9282',
      accent: '#d97706',
    },
    x: 900,
    y: 450,
  },
  {
    id: 'life',
    name: '生活楼',
    short: '生活',
    theme: {
      roof: '#ca8a04',
      roofDark: '#854d0e',
      wall: '#fff8e1',
      wallDark: '#efe0b0',
      trim: '#854d0e',
      floor: '#f0d9b5',
      floorDark: '#ddc398',
      accent: '#eab308',
    },
    x: 560,
    y: 608,
  },
];

export const BUILDING_BY_ID: Record<BuildingId, BuildingDef> = Object.fromEntries(
  BUILDINGS.map((b) => [b.id, b]),
) as Record<BuildingId, BuildingDef>;

export const TOWN_W = 1280;
export const TOWN_H = 800;

export const BLDG_W = 160;
export const BLDG_H = 144;

export function doorZone(b: BuildingDef): { x: number; y: number; w: number; h: number } {
  return { x: b.x + BLDG_W / 2 - 22, y: b.y + BLDG_H - 8, w: 44, h: 28 };
}
