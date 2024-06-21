import {
    Card,
    CardContent,
  } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"

export function SearchBox() {
    return(
        <div className="w-full">
            <Card>
                <CardContent className="flex items-center p-2">
                    <SearchIcon className="mr-2"/>
                    <Input placeholder= "検索" />
                </CardContent>
            </Card>
        </div>
    )
}