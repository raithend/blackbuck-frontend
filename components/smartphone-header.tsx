import { UseProfileItem } from "./left-sidebar/use-profile-item";
import { SearchBox } from "./search-box";

export function SmartphoneHeader() {
	return (
		<div className="flex items-center justify-between">
			<SearchBox />
			<UseProfileItem />
		</div>
	);
}
