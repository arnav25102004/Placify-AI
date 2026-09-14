const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export interface UserProfileData {
  id: number;
  email: string;
  role: string;
  campus_id: number;
  program?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user?: UserProfileData;
}

export interface BatchSummary {
  id: number;
  teacher_id: number;
  campus_id: number;
  created_at: string;
  file_count: number;
  status: string;
}

export interface DocumentStatusResponse {
  id: number;
  status: string;
  submission_source?: string;
  student_id?: number;
  batch_id?: number;
}

export interface ExtractionData {
  student_name: string;
  company: string;
  package?: number;
  role?: string;
  offer_type?: string;
  confidence: number;
}

export interface DocumentDetailResponse {
  id: number;
  status: string;
  drive_view_link: string;
  submission_source?: string;
  student_id?: number;
  batch_id?: number;
  extraction?: ExtractionData;
}

export interface VerifyActionPayload {
  action: "approve" | "reject" | "edit";
  reason?: string;
  student_name?: string;
  company?: string;
  package?: number;
  role?: string;
  offer_type?: string;
}

class ApiClient {
  private token: string | null = localStorage.getItem("placify_token");

  public setToken(token: string) {
    localStorage.setItem("placify_token", token);
    this.token = token;
  }

  public getToken(): string | null {
    return this.token || localStorage.getItem("placify_token");
  }

  public setUser(user: UserProfileData) {
    localStorage.setItem("placify_user", JSON.stringify(user));
  }

  public getUser(): UserProfileData | null {
    try {
      const raw = localStorage.getItem("placify_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public clearToken() {
    localStorage.removeItem("placify_token");
    localStorage.removeItem("placify_user");
    this.token = null;
  }

  private getHeaders(contentType: string | null = "application/json"): HeadersInit {
    const headers: Record<string, string> = {};
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    const currentToken = this.getToken();
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`;
    }
    return headers;
  }

  public async login(email: string, password: string): Promise<LoginResponse> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch (netErr: any) {
      throw new Error("Unable to connect to backend server. Please make sure the backend is running on port 8000.");
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(err.detail || "Invalid email or password");
    }

    const data: LoginResponse = await res.json();
    this.setToken(data.access_token);
    if (data.user) {
      this.setUser(data.user);
    }
    return data;
  }

  public async register(email: string, password: string, campus_id: number = 1): Promise<LoginResponse> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, campus_id }),
      });
    } catch (netErr: any) {
      throw new Error("Unable to connect to backend server. Please make sure the backend is running on port 8000.");
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Registration failed" }));
      throw new Error(err.detail || "Registration failed");
    }

    const data: LoginResponse = await res.json();
    this.setToken(data.access_token);
    if (data.user) {
      this.setUser(data.user);
    }
    return data;
  }

  public async getMe(): Promise<UserProfileData> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch authenticated profile");
    }

    return res.json();
  }

  public async uploadBatch(files: File[]): Promise<{ id: number; file_count: number; status: string }> {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    const res = await fetch(`${API_BASE_URL}/batches`, {
      method: "POST",
      headers: this.getHeaders(null), // multipart/form-data browser auto-boundary
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Batch upload failed" }));
      throw new Error(err.detail || "Batch upload failed");
    }

    return res.json();
  }

  public async listBatches(): Promise<BatchSummary[]> {
    const res = await fetch(`${API_BASE_URL}/batches`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch batches");
    }

    return res.json();
  }

  public async listBatchDocuments(batchId: number): Promise<DocumentStatusResponse[]> {
    const res = await fetch(`${API_BASE_URL}/batches/${batchId}/documents`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch batch documents");
    }

    return res.json();
  }

  public async getDocument(documentId: number): Promise<DocumentDetailResponse> {
    const res = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch document detail");
    }

    return res.json();
  }

  public async verifyDocument(documentId: number, payload: VerifyActionPayload): Promise<{ id: number; status: string }> {
    const res = await fetch(`${API_BASE_URL}/documents/${documentId}/verify`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Verification failed" }));
      throw new Error(err.detail || "Verification failed");
    }

    return res.json();
  }

  public async exportBatch(batchId: number, format: "json" | "csv" = "csv"): Promise<Blob | any> {
    const res = await fetch(`${API_BASE_URL}/batches/${batchId}/export?format=${format}`, {
      method: "POST",
      headers: this.getHeaders(format === "json" ? "application/json" : null),
    });

    if (!res.ok) {
      throw new Error("Export failed");
    }

    if (format === "csv") {
      return res.blob();
    }
    return res.json();
  }

  public async submitStudentOfferLetter(file: File): Promise<DocumentStatusResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/student/offer-letter`, {
      method: "POST",
      headers: this.getHeaders(null),
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Student submission failed" }));
      throw new Error(err.detail || "Submission failed");
    }

    return res.json();
  }

  public async listStudentSubmissions(): Promise<DocumentStatusResponse[]> {
    const res = await fetch(`${API_BASE_URL}/student/my-submissions`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch student submissions");
    }

    return res.json();
  }
}

export const api = new ApiClient();
