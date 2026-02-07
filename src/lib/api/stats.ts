import apiClient from "./client";
import { ApiResponse } from "@/types/api";
import { Stats } from "@/types/stats";

export async function getStats(): Promise<Stats> {
  const response = await apiClient.get<ApiResponse<Stats>>("/stats");
  return response.data.data;
}
