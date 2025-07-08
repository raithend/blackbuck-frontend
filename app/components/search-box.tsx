"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
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
import { Search, User as UserIcon, MapPin, Tag, UserRound, Calendar } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import type { User } from "@/app/types/types";

interface Location {
	id: string;
	name: string;
	description?: string;
}

interface Event {
	id: string;
	name: string;
	description?: string;
}

interface SearchResults {
	users: User[];
	locations: Location[];
	events: Event[];
	classifications: string[];
}

const fetcher = async (url: string) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error('Failed to fetch data');
	}
	return response.json();
};

export function SearchBox() {
	const [isOpen, setIsOpen] = useState(false);
	const [userQuery, setUserQuery] = useState("");
	const [locationQuery, setLocationQuery] = useState("");
	const [eventQuery, setEventQuery] = useState("");
	const [classificationQuery, setClassificationQuery] = useState("");
	const [activeTab, setActiveTab] = useState("classifications");
	const router = useRouter();

	// リアルタイム検索
	const { data: userResults } = useSWR<{ users: User[] }>(
		userQuery.trim() ? `/api/users/search?q=${encodeURIComponent(userQuery.trim())}` : null,
		fetcher,
		{ 
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	);

	const { data: locationResults } = useSWR<{ locations: Location[] }>(
		locationQuery.trim() ? `/api/locations/search?q=${encodeURIComponent(locationQuery.trim())}` : null,
		fetcher,
		{ 
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	);

	const { data: eventResults } = useSWR<{ events: Event[] }>(
		eventQuery.trim() ? `/api/events/search?q=${encodeURIComponent(eventQuery.trim())}` : null,
		fetcher,
		{ 
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	);

	const { data: classificationResults } = useSWR<{ classifications: string[] }>(
		classificationQuery.trim() ? `/api/classifications/search?q=${encodeURIComponent(classificationQuery.trim())}` : null,
		fetcher,
		{ 
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	);

	const handleUserSelect = (user: User) => {
		router.push(`/users/${encodeURIComponent(user.account_id)}`);
		setIsOpen(false);
		setUserQuery("");
	};

	const handleLocationSelect = (location: Location) => {
		router.push(`/locations/${encodeURIComponent(location.name)}`);
		setIsOpen(false);
		setLocationQuery("");
	};

	const handleEventSelect = (event: Event) => {
		router.push(`/events/${encodeURIComponent(event.name)}`);
		setIsOpen(false);
		setEventQuery("");
	};

	const handleClassificationSelect = (classification: string) => {
		router.push(`/classifications/${encodeURIComponent(classification)}`);
		setIsOpen(false);
		setClassificationQuery("");
	};

	const handleKeyPress = (e: React.KeyboardEvent, searchFunction: () => void) => {
		if (e.key === "Enter") {
			searchFunction();
		}
	};

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

	const handleEventSearch = () => {
		if (eventQuery.trim()) {
			router.push(`/events/${encodeURIComponent(eventQuery.trim())}`);
			setIsOpen(false);
			setEventQuery("");
		}
	};

	const handleClassificationSearch = () => {
		if (classificationQuery.trim()) {
			router.push(`/classifications/${encodeURIComponent(classificationQuery.trim())}`);
			setIsOpen(false);
			setClassificationQuery("");
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
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="classifications" className="flex items-center gap-2">
							<Tag className="h-4 w-4" />
							<span>分類</span>
						</TabsTrigger>
						<TabsTrigger value="locations" className="flex items-center gap-2">
							<MapPin className="h-4 w-4" />
							<span>場所</span>
						</TabsTrigger>
						<TabsTrigger value="events" className="flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							<span>イベント</span>
						</TabsTrigger>
						<TabsTrigger value="users" className="flex items-center gap-2">
							<UserIcon className="h-4 w-4" />
							<span>ユーザー</span>
						</TabsTrigger>
					</TabsList>

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

						{/* 検索結果 */}
						{classificationQuery.trim() && classificationResults?.classifications && (
							<div className="space-y-2">
								<h4 className="text-sm font-medium">検索結果</h4>
								<div className="max-h-48 overflow-y-auto space-y-2">
									{classificationResults.classifications.length > 0 ? (
										classificationResults.classifications.map((classification) => (
											<button
												key={`classification-${classification}`}
												onClick={() => handleClassificationSelect(classification)}
												className="w-full flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
												type="button"
											>
												<Tag className="h-4 w-4 text-gray-500" />
												<div className="font-medium">{classification}</div>
											</button>
										))
									) : (
										<div className="text-sm text-gray-500 p-2">分類が見つかりません</div>
									)}
								</div>
							</div>
						)}

						<Button 
							onClick={handleClassificationSearch}
							disabled={!classificationQuery.trim()}
							className="w-full"
						>
							分類を検索
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

						{/* 検索結果 */}
						{locationQuery.trim() && locationResults?.locations && (
							<div className="space-y-2">
								<h4 className="text-sm font-medium">検索結果</h4>
								<div className="max-h-48 overflow-y-auto space-y-2">
									{locationResults.locations.length > 0 ? (
										locationResults.locations.map((location) => (
											<button
												key={location.id}
												onClick={() => handleLocationSelect(location)}
												className="w-full flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
												type="button"
											>
												<Avatar className="h-8 w-8">
													<AvatarFallback>
														<MapPin className="h-4 w-4" />
													</AvatarFallback>
												</Avatar>
												<div>
													<div className="font-medium">{location.name}</div>
													{location.description && (
														<div className="text-sm text-gray-500">{location.description}</div>
													)}
												</div>
											</button>
										))
									) : (
										<div className="text-sm text-gray-500 p-2">場所が見つかりません</div>
									)}
								</div>
							</div>
						)}

						<Button 
							onClick={handleLocationSearch}
							disabled={!locationQuery.trim()}
							className="w-full"
						>
							場所を検索
						</Button>
					</TabsContent>

					<TabsContent value="events" className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">イベント名</label>
							<Input
								placeholder="イベントを検索..."
								value={eventQuery}
								onChange={(e) => setEventQuery(e.target.value)}
								onKeyPress={(e) => handleKeyPress(e, handleEventSearch)}
							/>
						</div>

						{/* 検索結果 */}
						{eventQuery.trim() && eventResults?.events && (
							<div className="space-y-2">
								<h4 className="text-sm font-medium">検索結果</h4>
								<div className="max-h-48 overflow-y-auto space-y-2">
									{eventResults.events.length > 0 ? (
										eventResults.events.map((event) => (
											<button
												key={event.id}
												onClick={() => handleEventSelect(event)}
												className="w-full flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
												type="button"
											>
												<Avatar className="h-8 w-8">
													<AvatarFallback>
														<Calendar className="h-4 w-4" />
													</AvatarFallback>
												</Avatar>
												<div>
													<div className="font-medium">{event.name}</div>
													{event.description && (
														<div className="text-sm text-gray-500">{event.description}</div>
													)}
												</div>
											</button>
										))
									) : (
										<div className="text-sm text-gray-500 p-2">イベントが見つかりません</div>
									)}
								</div>
							</div>
						)}

						<Button 
							onClick={handleEventSearch}
							disabled={!eventQuery.trim()}
							className="w-full"
						>
							イベントを検索
						</Button>
					</TabsContent>

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
						
						{/* 検索結果 */}
						{userQuery.trim() && userResults?.users && (
							<div className="space-y-2">
								<h4 className="text-sm font-medium">検索結果</h4>
								<div className="max-h-48 overflow-y-auto space-y-2">
									{userResults.users.length > 0 ? (
										userResults.users.map((user) => (
											<button
												key={user.id}
												onClick={() => handleUserSelect(user)}
												className="w-full flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
												type="button"
											>
												<Avatar className="h-8 w-8">
													<AvatarImage src={user.avatar_url || undefined} />
													<AvatarFallback>
														<UserRound className="h-4 w-4" />
													</AvatarFallback>
												</Avatar>
												<div>
													<div className="font-medium">{user.username}</div>
													<div className="text-sm text-gray-500">{user.account_id}</div>
												</div>
											</button>
										))
									) : (
										<div className="text-sm text-gray-500 p-2">ユーザーが見つかりません</div>
									)}
								</div>
							</div>
						)}

						<Button 
							onClick={handleUserSearch}
							disabled={!userQuery.trim()}
							className="w-full"
						>
							ユーザーを検索
						</Button>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
} 