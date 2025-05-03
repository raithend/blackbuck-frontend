'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RotatableHourglass } from "./rotatable-hourglass";

export function GeologicalTimeCard() {
  return (
    <Card className="w-[300px] bg-background/80 backdrop-blur-sm">
        <CardHeader>
            <div className="flex items-center gap-2">
                <RotatableHourglass />
                <CardTitle>地質時代</CardTitle>
            </div>
            <CardDescription>現在の地質年代とその特徴</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
            <div>
                <h3 className="font-semibold">顕生代</h3>
                <p className="text-sm text-muted-foreground">約5.4億年前 - 現在</p>
            </div>
            <div>
                <h3 className="font-semibold">新生代</h3>
                <p className="text-sm text-muted-foreground">約6,600万年前 - 現在</p>
            </div>
            <div>
                <h3 className="font-semibold">第四紀</h3>
                <p className="text-sm text-muted-foreground">約258万年前 - 現在</p>
            </div>
            <div>
                <h3 className="font-semibold">完新世</h3>
                <p className="text-sm text-muted-foreground">約1.17万年前 - 現在</p>
            </div>
            </div>
        </CardContent>
    </Card>
  );
} 