export interface Link {
  code: string;
  longUrl: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
}

export interface CreateLinkPayload {
  longUrl: string;
  code?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}
