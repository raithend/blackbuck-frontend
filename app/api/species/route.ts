import { NextResponse } from "next/server";

const species = [
  { id: "lion", name: "ライオン", description: "アフリカの草原に生息する大型のネコ科動物" },
  { id: "elephant", name: "ゾウ", description: "地球上で最も大きな陸上動物" },
  { id: "penguin", name: "ペンギン", description: "南極に生息する飛べない鳥" },
];

export async function GET() {
  return NextResponse.json(species);
} 