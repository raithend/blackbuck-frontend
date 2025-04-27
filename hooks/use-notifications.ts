import { Notification } from "@/types/notification";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("APIがJSONを返していません");
  }

  return response.json();
};

export function useNotifications(type: "all" | "follows" | "likes" | "comments") {
  const { data: notifications, error, isLoading } = useSWR<Notification[]>(
    `/api/v1/notifications?type=${type}`,
    fetcher
  );

  return {
    notifications: notifications || [],
    loading: isLoading,
    error: error?.message || null,
  };
} 