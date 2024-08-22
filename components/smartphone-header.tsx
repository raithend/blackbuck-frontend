import { SearchBox } from "./search-box";
import { UseProfileItem } from "./left-sidebar/use-profile-item";

export function SmartphoneHeader() {
    return(
        <div className="flex items-center justify-between">
            <SearchBox/>
            <UseProfileItem/>
        </div>
    )
}