export interface ApiHealthResponse {
  status: string;
  app?: string;
  env?: string;
  scope?: string;
}

export async function getHealth(baseUrl = ""): Promise<ApiHealthResponse> {
  const response = await fetch(`${baseUrl}/api/v1/health`);

  if (!response.ok) {
    throw new Error(`Health check failed with ${response.status}`);
  }

  return response.json() as Promise<ApiHealthResponse>;
}

