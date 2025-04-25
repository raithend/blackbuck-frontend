import { NextResponse } from "next/server";

const speciesData = {
  lion: {
    name: "ライオン",
    scientificName: "Panthera leo",
    description: "アフリカの草原に生息する大型のネコ科動物です。",
    habitat: "アフリカのサバンナ",
    diet: "主に草食動物（シマウマ、ヌーなど）",
  },
  elephant: {
    name: "ゾウ",
    scientificName: "Loxodonta africana",
    description: "地球上で最も大きな陸上動物です。",
    habitat: "アフリカのサバンナや森林",
    diet: "草、葉、樹皮、果実",
  },
  penguin: {
    name: "ペンギン",
    scientificName: "Spheniscidae",
    description: "南極に生息する飛べない鳥です。",
    habitat: "南極大陸とその周辺の島々",
    diet: "魚、イカ、オキアミ",
  },
};

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  const species = speciesData[id as keyof typeof speciesData];

  if (!species) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.json(species);
} 