export const fetcher = async <T>(url: string): Promise<T> => {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error("APIリクエストに失敗しました");
	}
	return res.json();
};
