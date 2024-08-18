import { Card, CardContent } from "@/components/ui/card";
import { SignOut } from "./sing-out";


export function SignOutCard() {
    return(
        <Card className="max-w-[600px]">
            <CardContent className="flex flex-col items-center">
                <SignOut/>                    
            </CardContent>
        </Card>
    )
}