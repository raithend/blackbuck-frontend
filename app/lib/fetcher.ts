export const fetcher = async <T>(url: string): Promise<T | null> => {
	try {
		const res = await fetch(url);
		if (!res.ok) {
			throw new Error("APIリクエストに失敗しました");
		}
		return res.json();
	} catch (error) {
		// ネットワークエラーの場合は既存データを保持するため、nullを返す
		if (error instanceof TypeError && error.message.includes('fetch')) {
			console.warn('ネットワークエラーが発生しましたが、既存のデータを保持します:', error);
			return null; // nullを返すことで、既存のデータを保持
		}
		throw error;
	}
};
