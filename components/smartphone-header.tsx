import { ProfileNavbarItem } from "./left-sidebar/profile-navbar-item";
import { SearchBox } from "./search-box";

export function SmartphoneHeader() {
	return (
		<div className="flex items-center justify-between">
			<SearchBox />
			<ProfileNavbarItem />
		</div>
	);
}
