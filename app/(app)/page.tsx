import { redirect } from "next/navigation";

export default function Page() {
	redirect(encodeURI("/classifications/脊椎動物"));
}
