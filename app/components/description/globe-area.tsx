import Globe from "./globe";

interface GlobeAreaProps {
	customGeographicFile?: string;
}

export default function GlobeArea({ customGeographicFile }: GlobeAreaProps) {
	return (
		<div className="h-[calc(100vh-4rem)]">
			<Globe customGeographicFile={customGeographicFile} />
		</div>
	);
}
