"use client";

import { Button } from "@/app/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Search, User, MapPin, Tag } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBox() {
	const [isOpen, setIsOpen] = useState(false);
	const [userQuery, setUserQuery] = useState("");
	const [locationQuery, setLocationQuery] = useState("");
	const [classificationQuery, setClassificationQuery] = useState("");
	const router = useRouter();

	const handleUserSearch = () => {
		if (userQuery.trim()) {
			router.push(`/users/${encodeURIComponent(userQuery.trim())}`);
			setIsOpen(false);
			setUserQuery("");
		}
	};

	const handleLocationSearch = () => {
		if (locationQuery.trim()) {
			router.push(`/locations/${encodeURIComponent(locationQuery.trim())}`);
			setIsOpen(false);
			setLocationQuery("");
		}
	};

	const handleClassificationSearch = () => {
		if (classificationQuery.trim()) {
			router.push(`/classifications/${encodeURIComponent(classificationQuery.trim())}`);
			setIsOpen(false);
			setClassificationQuery("");
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent, searchFunction: () => void) => {
		if (e.key === "Enter") {
			searchFunction();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="w-full max-w-sm justify-start text-muted-foreground"
				>
					<Search className="mr-2 h-4 w-4" />
					<span>検索...</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>検索</DialogTitle>
				</DialogHeader>
				<Tabs defaultValue="users" className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="users" className="flex items-center gap-2">
							<User className="h-4 w-4" />
							<span>ユーザー</span>
						</TabsTrigger>
						<TabsTrigger value="locations" className="flex items-center gap-2">
							<MapPin className="h-4 w-4" />
							<span>場所</span>
						</TabsTrigger>
						<TabsTrigger value="classifications" className="flex items-center gap-2">
							<Tag className="h-4 w-4" />
							<span>分類</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="users" className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">ユーザー名またはアカウントID</label>
							<Input
								placeholder="ユーザーを検索..."
								value={userQuery}
								onChange={(e) => setUserQuery(e.target.value)}
								onKeyPress={(e) => handleKeyPress(e, handleUserSearch)}
							/>
						</div>
						<Button 
							onClick={handleUserSearch}
							disabled={!userQuery.trim()}
							className="w-full"
						>
							ユーザーを検索
						</Button>
					</TabsContent>

					<TabsContent value="locations" className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">場所名</label>
							<Input
								placeholder="場所を検索..."
								value={locationQuery}
								onChange={(e) => setLocationQuery(e.target.value)}
								onKeyPress={(e) => handleKeyPress(e, handleLocationSearch)}
							/>
						</div>
						<Button 
							onClick={handleLocationSearch}
							disabled={!locationQuery.trim()}
							className="w-full"
						>
							場所を検索
						</Button>
					</TabsContent>

					<TabsContent value="classifications" className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">分類名</label>
							<Input
								placeholder="分類を検索..."
								value={classificationQuery}
								onChange={(e) => setClassificationQuery(e.target.value)}
								onKeyPress={(e) => handleKeyPress(e, handleClassificationSearch)}
							/>
						</div>
						<Button 
							onClick={handleClassificationSearch}
							disabled={!classificationQuery.trim()}
							className="w-full"
						>
							分類を検索
						</Button>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
