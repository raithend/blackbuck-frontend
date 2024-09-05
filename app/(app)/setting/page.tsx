import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ModeRadioGroup } from "@/components/mode-radio-group";
import { SignOutCard } from "@/components/auth/sign-out-card";

export default function Page() {
    return(
        <div>
			<ModeRadioGroup/>
            <SignOutCard/>
        </div>
    )
}