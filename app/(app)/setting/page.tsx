import { SignOutCard } from "@/components/auth/sign-out-card";
import { ModeRadioGroup } from "@/components/mode-radio-group";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Page() {
	return (
		<div>
			<ModeRadioGroup />
			<SignOutCard />
		</div>
	);
}
