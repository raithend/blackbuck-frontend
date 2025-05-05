'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RotatableHourglass } from "./rotatable-hourglass";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [selectedEra, setSelectedEra] = useState<Era>(geologicalAgesData.eras[0]);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(geologicalAgesData.eras[0].periods[0]);
  const [selectedEpoch, setSelectedEpoch] = useState<Epoch>(geologicalAgesData.eras[0].periods[0].epochs[0]);
  const [selectedAge, setSelectedAge] = useState<GeologicalAge | null>(null);

  const handleEraChange = (eraId: string) => {
    const era = geologicalAgesData.eras.find(e => e.id === eraId);
    if (era) {
      setSelectedEra(era);
      setSelectedPeriod(era.periods[0]);
      setSelectedEpoch(era.periods[0].epochs[0]);
      setSelectedAge(era.periods[0].epochs[0].ages?.[0] || null);
    }
  };

  const handlePeriodChange = (periodId: string) => {
    const period = selectedEra.periods.find(p => p.id === periodId);
    if (period) {
      setSelectedPeriod(period);
      setSelectedEpoch(period.epochs[0]);
      setSelectedAge(period.epochs[0].ages?.[0] || null);
    }
  };

  const handleEpochChange = (epochId: string) => {
    const epoch = selectedPeriod.epochs.find(e => e.id === epochId);
    if (epoch) {
      setSelectedEpoch(epoch);
      setSelectedAge(epoch.ages?.[0] || null);
    }
  };

  const handleAgeChange = (ageId: string) => {
    if (selectedEpoch.ages) {
      const age = selectedEpoch.ages.find(a => a.id === ageId);
      if (age) {
        setSelectedAge(age);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>地質時代</CardTitle>
          <RotatableHourglass />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-4">
            <Select
              value={selectedEra.id}
              onValueChange={handleEraChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="代を選択" />
              </SelectTrigger>
              <SelectContent>
                {geologicalAgesData.eras.map((era) => (
                  <SelectItem key={era.id} value={era.id}>
                    {era.name} ({era.nameEn})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedPeriod.id}
              onValueChange={handlePeriodChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="紀を選択" />
              </SelectTrigger>
              <SelectContent>
                {selectedEra.periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name} ({period.nameEn})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedEpoch.id}
              onValueChange={handleEpochChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="世を選択" />
              </SelectTrigger>
              <SelectContent>
                {selectedPeriod.epochs.map((epoch) => (
                  <SelectItem key={epoch.id} value={epoch.id}>
                    {epoch.name} ({epoch.nameEn})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedEpoch.ages && (
              <Select
                value={selectedAge?.id || ''}
                onValueChange={handleAgeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="期を選択" />
                </SelectTrigger>
                <SelectContent>
                  {selectedEpoch.ages.map((age) => (
                    <SelectItem key={age.id} value={age.id}>
                      {age.name} ({age.nameEn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">基底年代:</span>
            <span className="text-sm font-medium">
              {selectedAge ? selectedAge.baseAge : selectedEpoch.baseAge} Ma
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}