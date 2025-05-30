"use client";

import { HeartIcon } from "lucide-react";
import { useState } from "react";

export function HeartButton() {
	const [flag, setCount] = useState(false);

	const handleClick = async () => {
		try {
			// いいね処理
		} catch (error) {
			// エラー処理
		}
	};

	return (
		<div>
			<button type="button" onClick={() => setCount(!flag)}>
				<HeartIcon
					className={flag ? "color = text-red-600 fill-red-600 transition" : ""}
				/>
			</button>
		</div>
	);
}
