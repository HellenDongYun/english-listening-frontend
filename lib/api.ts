// lib/api.ts

// 统一 API Base URL（来自 .env）
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

// 通用 fetch 封装（推荐用这个）
export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE_URL}${path}`, options);

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res;
}

// 返回 JSON 的版本（最常用🔥）
export async function apiFetchJson<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await apiFetch(path, options);
  return res.json();
}
