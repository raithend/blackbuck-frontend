'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from "@/components/ui/slider";
import geologicalAgesData from '@/data/geological-ages.json';

interface GeologicalAge {
  id: string;
  name: string;
  nameEn: string;
  baseAge: number;
  description?: string;
  descriptionEn?: string;
}

interface Epoch {
  id: string;
  name: string;
  nameEn: string;
  baseAge: number;
  description?: string;
  descriptionEn?: string;
  ages?: GeologicalAge[];
}

interface Period {
  id: string;
  name: string;
  nameEn: string;
  baseAge: number;
  epochs: Epoch[];
}

interface Era {
  id: string;
  name: string;
  nameEn: string;
  baseAge: number;
  periods: Period[];
}

export function GeologicalAgeCard() {
  const [selectedEra, setSelectedEra] = useState<Era | undefined>(undefined);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | undefined>(undefined);
  const [selectedEpoch, setSelectedEpoch] = useState<Epoch | undefined>(undefined);
  const [selectedAge, setSelectedAge] = useState<GeologicalAge | null>(null);

  // 初期状態で最新の時代を選択
  React.useEffect(() => {
    handleSliderChange([1]);
  }, []);

  const handleEraChange = (eraId: string) => {
    if (eraId === "none") {
      setSelectedEra(undefined);
      setSelectedPeriod(undefined);
      setSelectedEpoch(undefined);
      setSelectedAge(null);
      return;
    }
    const era = geologicalAgesData.eras.find(e => e.id === eraId);
    if (era) {
      setSelectedEra(era);
      setSelectedPeriod(undefined);
      setSelectedEpoch(undefined);
      setSelectedAge(null);
    }
  };

  const handlePeriodChange = (periodId: string) => {
    if (periodId === "none") {
      setSelectedPeriod(undefined);
      setSelectedEpoch(undefined);
      setSelectedAge(null);
      return;
    }
    const period = selectedEra?.periods.find(p => p.id === periodId);
    if (period) {
      setSelectedPeriod(period);
      setSelectedEpoch(period.epochs[0]);
      setSelectedAge(period.epochs[0].ages?.[0] || null);
    }
  };

  const handleEpochChange = (epochId: string) => {
    if (epochId === "none") {
      setSelectedEpoch(undefined);
      setSelectedAge(null);
      return;
    }
    if (selectedPeriod) {
      const epoch = selectedPeriod.epochs.find(e => e.id === epochId);
      if (epoch) {
        setSelectedEpoch(epoch);
        setSelectedAge(epoch.ages?.[0] || null);
      }
    }
  };

  const handleAgeChange = (ageId: string) => {
    if (ageId === "none") {
      setSelectedAge(null);
      return;
    }
    if (selectedEpoch?.ages) {
      const age = selectedEpoch.ages.find(a => a.id === ageId);
      if (age) {
        setSelectedAge(age);
      }
    }
  };

  const handleSliderChange = (value: number[]) => {
    const reversedValue = 33 - value[0];
    const epochId = reversedValue.toString();
    
    // すべての時代から対応するepochを探す
    for (const era of geologicalAgesData.eras) {
      for (const period of era.periods) {
        const epoch = period.epochs.find(e => e.id === epochId);
        if (epoch) {
          setSelectedEra(era);
          setSelectedPeriod(period);
          setSelectedEpoch(epoch);
          setSelectedAge(epoch.ages?.[0] || null);
          return;
        }
      }
    }
  };

  return (
    <Card className="w-72">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>地質時代</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-4">
            <Select
              value={selectedEra?.id || undefined}
              onValueChange={handleEraChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="代を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">---</SelectItem>
                {geologicalAgesData.eras.map((era) => (
                  <SelectItem key={era.id} value={era.id}>
                    {era.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedPeriod?.id || undefined}
              onValueChange={handlePeriodChange}
              disabled={!selectedEra}
            >
              <SelectTrigger>
                <SelectValue placeholder="紀を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">---</SelectItem>
                {selectedEra?.periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedEpoch?.id || undefined}
              onValueChange={handleEpochChange}
              disabled={!selectedPeriod}
            >
              <SelectTrigger>
                <SelectValue placeholder="世を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">---</SelectItem>
                {selectedPeriod?.epochs.map((epoch) => (
                  <SelectItem key={epoch.id} value={epoch.id}>
                    {epoch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedAge?.id || undefined}
              onValueChange={handleAgeChange}
              disabled={!selectedEpoch || !selectedEpoch.ages}
            >
              <SelectTrigger>
                <SelectValue placeholder="期を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">---</SelectItem>
                {selectedEpoch?.ages?.map((age) => (
                  <SelectItem key={age.id} value={age.id}>
                    {age.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">基底年代:</span>
            <span className="text-sm font-medium">
              {selectedAge ? selectedAge.baseAge : 
               selectedEpoch ? selectedEpoch.baseAge :
               selectedPeriod ? selectedPeriod.baseAge :
               selectedEra ? selectedEra.baseAge : '-'} Ma
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="w-full">
          <Slider
            defaultValue={[1]}
            max={32}
            min={1}
            step={1}
            onValueChange={handleSliderChange}
            className="w-full"
          />
        </div>
      </CardFooter>
    </Card>
  );
}