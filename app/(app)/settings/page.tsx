import { LogoutButton } from "@/components/auth/logout-button";
import { ModeRadioGroup } from "@/components/mode-radio-group";

export default function Page() {
	return (
		<div>
			<ModeRadioGroup />
			<LogoutButton />
		</div>
	);
}
