"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Species {
  id: string;
  name: string;
  description: string;
}

export default function SpeciesPage() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await fetch("/api/species");
        if (!response.ok) {
          throw new Error("生物データの取得に失敗しました");
        }
        const data = await response.json();
        setSpecies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecies();
  }, []);

  if (loading) {
    return <div className="container mx-auto py-8">読み込み中...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-4xl font-bold">生物図鑑</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        様々な生物について学び、その生態や特徴を理解しましょう。
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {species.map((animal) => (
          <Link key={animal.id} href={`/species/${animal.id}`}>
            <div className="rounded-lg border p-4 transition-colors hover:bg-accent">
              <h2 className="mb-2 text-2xl font-semibold">{animal.name}</h2>
              <p className="text-muted-foreground">{animal.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 