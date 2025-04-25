import { notFound } from "next/navigation";

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
    <div className="container mx-auto py-8">
      <div>
        <h1 className="mb-2 text-4xl font-bold">{species.name}</h1>
        <p className="mb-4 text-lg text-muted-foreground">
          {species.scientificName}
        </p>
        <div className="space-y-4">
          <div>
            <h2 className="mb-2 text-xl font-semibold">説明</h2>
            <p>{species.description}</p>
          </div>
          <div>
            <h2 className="mb-2 text-xl font-semibold">生息地</h2>
            <p>{species.habitat}</p>
          </div>
          <div>
            <h2 className="mb-2 text-xl font-semibold">食性</h2>
            <p>{species.diet}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 