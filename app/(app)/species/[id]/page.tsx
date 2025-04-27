import { Cladogram } from "@/components/species/cladogram";
import { Globe } from "@/components/species/globe";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

interface SpeciesDetail {
	name: string;
	scientificName: string;
	description: string;
	habitat: string;
	diet: string;
}

async function getSpecies(id: string): Promise<SpeciesDetail> {
	const response = await fetch(`${process.env.API_URL}/api/v1/species/${id}`, {
		next: { revalidate: 3600 }, // 1時間キャッシュ
	});

	if (!response.ok) {
		if (response.status === 404) {
			notFound();
		}
		throw new Error("生物データの取得に失敗しました");
	}

	return response.json();
}

export default async function SpeciesDetailPage({
	params,
}: { params: { id: string } }) {
	const { id } = await params;
	const species = await getSpecies(id);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-4xl">{species.name}</CardTitle>
				<p className="text-lg text-muted-foreground">
					{species.scientificName}
				</p>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div>
						<h2 className="text-xl font-semibold">説明</h2>
						<p>{species.description}</p>
					</div>
					<div>
						<h2 className="text-xl font-semibold">食性</h2>
						<p>{species.diet}</p>
					</div>
					<Accordion type="single" collapsible className="w-full">
						<AccordionItem value="habitat">
							<AccordionTrigger className="text-xl font-semibold">
								生息地
							</AccordionTrigger>
							<AccordionContent>
								<p>{species.habitat}</p>
								<div className="mt-4">
									<Globe />
								</div>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="cladogram">
							<AccordionTrigger className="text-xl font-semibold">
								系統樹
							</AccordionTrigger>
							<AccordionContent>
								<Cladogram speciesId={id} />
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</CardContent>
		</Card>
	);
}
