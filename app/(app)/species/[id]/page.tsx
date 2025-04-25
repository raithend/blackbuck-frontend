import { notFound } from "next/navigation";
import { Globe } from "@/components/species/globe";
import { Cladogram } from "@/components/species/cladogram";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SpeciesDetail {
  name: string;
  scientificName: string;
  description: string;
  habitat: string;
  diet: string;
}

async function getSpecies(id: string): Promise<SpeciesDetail> {
  const response = await fetch(`${process.env.API_URL}/api/species/${id}`, {
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

export default async function SpeciesDetailPage({ params }: { params: { id: string } }) {
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
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">説明</h2>
            <p>{species.description}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold">生息地</h2>
            <p>{species.habitat}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold">食性</h2>
            <p>{species.diet}</p>
          </div>
        </div>
        <div className="flex justify-center">
          <Globe />
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold">系統樹</h2>
          <Cladogram speciesId={id} />
        </div>
      </CardContent>
    </Card>
  );
} 