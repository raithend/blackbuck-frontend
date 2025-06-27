import { GeologicalAgeCard } from "./geological-age-card";
import { GeologicalAgeProvider } from "./geological-context";

export default function DescriptionArea() {
	return (
		<GeologicalAgeProvider>
			<div className="fixed top-20 right-4 z-50">
				<GeologicalAgeCard />
			</div>
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">BlackBuckへようこそ</h1>
					<p className="text-xl text-gray-600 mb-8">
						古生物学の世界を探索し、化石や地質時代について学びましょう
					</p>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
						<div className="bg-white p-6 rounded-lg shadow-md">
							<h2 className="text-xl font-semibold mb-3">投稿を探す</h2>
							<p className="text-gray-600">
								他のユーザーが投稿した化石や地質に関する投稿を閲覧できます
							</p>
						</div>
						<div className="bg-white p-6 rounded-lg shadow-md">
							<h2 className="text-xl font-semibold mb-3">分類を探索</h2>
							<p className="text-gray-600">
								様々な生物分類のページで系統樹や地球儀を確認できます
							</p>
						</div>
						<div className="bg-white p-6 rounded-lg shadow-md">
							<h2 className="text-xl font-semibold mb-3">場所を発見</h2>
							<p className="text-gray-600">
								化石発見地や博物館などの場所情報を探索できます
							</p>
						</div>
					</div>
				</div>
			</div>
		</GeologicalAgeProvider>
	);
}
