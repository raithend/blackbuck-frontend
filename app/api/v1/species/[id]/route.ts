import { NextResponse } from "next/server";

const speciesData = {
	lion: {
		name: "ライオン",
		scientificName: "Panthera leo",
		description: "アフリカのサバンナに生息する大型のネコ科動物です。",
		habitat: "アフリカのサバンナや草原地帯に生息しています。",
		diet: "主にシマウマやヌーなどの草食動物を捕食します。"
	},
	elephant: {
		name: "アフリカゾウ",
		scientificName: "Loxodonta africana",
		description: "地球上で最も大きな陸上哺乳類です。",
		habitat: "アフリカのサバンナや森林地帯に生息しています。",
		diet: "草、葉、樹皮、果実などを食べます。"
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
	{ params }: { params: { id: string } }
) {
	const id = params.id;
	const species = speciesData[id as keyof typeof speciesData];

	if (!species) {
		return new NextResponse("Not Found", { status: 404 });
	}

	return NextResponse.json(species);
}
