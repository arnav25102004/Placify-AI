const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export interface UserProfileData {
  id: number;
  email: string;
  role: string;
  campus_id: number;
  program?: string;
  full_name?: string;
  phone?: string;
  department?: string;
  designation?: string;
  bio?: string;
  avatar_url?: string;
  linkedin_url?: string;
  github_url?: string;
}

export interface UpdateProfilePayload {
  full_name?: string;
  phone?: string;
  department?: string;
  designation?: string;
  bio?: string;
  avatar_url?: string;
  linkedin_url?: string;
  github_url?: string;
}

export interface SeniorProfile {
  id: number;
  name: string;
  batch: string;
  department: string;
  company: string;
  role: string;
  package_lpa: number;
  offer_type: string;
  skills: string[];
  interview_experience?: string;
  linkedin_url?: string;
  email?: string;
  referral_status: string;
  campus: string;
}

export interface CreateSeniorPayload {
  name: string;
  batch: string;
  department: string;
  company: string;
  role: string;
  package_lpa: number;
  offer_type?: string;
  skills?: string[];
  interview_experience?: string;
  linkedin_url?: string;
  email?: string;
  referral_status?: string;
  campus?: string;
}

export interface RecruitingCompany {
  id: number;
  name: string;
  industry: string;
  tier: string;
  avg_package_lpa: number;
  highest_package_lpa: number;
  total_offers: number;
  years_visited: string[];
  roles: string[];
  selection_process: string[];
  eligibility: string;
  website?: string;
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

  public async updateProfile(payload: UpdateProfilePayload): Promise<UserProfileData> {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to update profile" }));
      throw new Error(err.detail || "Failed to update profile");
    }

    const data: UserProfileData = await res.json();
    this.setUser(data);
    return data;
  }

  public async getSeniors(params?: {
    search?: string;
    company?: string;
    department?: string;
    batch?: string;
  }): Promise<SeniorProfile[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.company) query.append("company", params.company);
    if (params?.department) query.append("department", params.department);
    if (params?.batch) query.append("batch", params.batch);

    const qs = query.toString();
    const url = `${API_BASE_URL}/student/seniors${qs ? `?${qs}` : ""}`;
    const res = await fetch(url, { method: "GET", headers: this.getHeaders() });
    if (!res.ok) {
      throw new Error("Failed to fetch seniors directory");
    }
    return res.json();
  }

  public async createSenior(payload: CreateSeniorPayload): Promise<SeniorProfile> {
    const res = await fetch(`${API_BASE_URL}/student/seniors`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to create senior" }));
      throw new Error(err.detail || "Failed to create senior");
    }

    return res.json();
  }

  public async getPreviousCompanies(params?: {
    search?: string;
    industry?: string;
    tier?: string;
  }): Promise<RecruitingCompany[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.industry) query.append("industry", params.industry);
    if (params?.tier) query.append("tier", params.tier);

    const qs = query.toString();
    const url = `${API_BASE_URL}/student/companies${qs ? `?${qs}` : ""}`;
    const res = await fetch(url, { method: "GET", headers: this.getHeaders() });
    if (!res.ok) {
      throw new Error("Failed to fetch previous recruiting companies");
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

  // --- Dev / Test DB Studio Operations ---
  public async getDbTables(): Promise<{ tables: TableInfo[]; dialect: string }> {
    const res = await fetch(`${API_BASE_URL}/dev/db/tables`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to inspect database tables");
    }
    return res.json();
  }

  public async getDbTableRows(
    table: string,
    params?: {
      limit?: number;
      offset?: number;
      sort_by?: string;
      sort_dir?: "asc" | "desc";
      search?: string;
    }
  ): Promise<TableRowsResponse> {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.offset !== undefined) query.set("offset", String(params.offset));
    if (params?.sort_by) query.set("sort_by", params.sort_by);
    if (params?.sort_dir) query.set("sort_dir", params.sort_dir);
    if (params?.search) query.set("search", params.search);

    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/dev/db/tables/${encodeURIComponent(table)}/rows${qs}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to fetch rows" }));
      throw new Error(err.detail || "Failed to fetch rows");
    }
    return res.json();
  }

  public async insertDbTableRow(
    table: string,
    data: Record<string, any> | Record<string, any>[],
    autoHashPasswords = true
  ): Promise<{ status: string; table: string; inserted_count: number; results: any[] }> {
    const body = Array.isArray(data)
      ? { rows: data, auto_hash_passwords: autoHashPasswords }
      : { data, auto_hash_passwords: autoHashPasswords };

    const res = await fetch(`${API_BASE_URL}/dev/db/tables/${encodeURIComponent(table)}/rows`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Insert failed" }));
      throw new Error(typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail));
    }
    return res.json();
  }

  public async updateDbTableRow(
    table: string,
    primaryKey: Record<string, any>,
    data: Record<string, any>
  ): Promise<{ status: string; table: string; rows_updated: number }> {
    const res = await fetch(`${API_BASE_URL}/dev/db/tables/${encodeURIComponent(table)}/rows`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ primary_key: primaryKey, data }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Update failed" }));
      throw new Error(err.detail || "Update failed");
    }
    return res.json();
  }

  public async deleteDbTableRow(
    table: string,
    primaryKey: Record<string, any>
  ): Promise<{ status: string; rows_deleted: number }> {
    const res = await fetch(`${API_BASE_URL}/dev/db/tables/${encodeURIComponent(table)}/delete-row`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ primary_key: primaryKey }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Delete failed" }));
      throw new Error(err.detail || "Delete failed");
    }
    return res.json();
  }

  public async truncateDbTable(table: string): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/dev/db/tables/${encodeURIComponent(table)}/truncate`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Truncate failed" }));
      throw new Error(err.detail || "Truncate failed");
    }
    return res.json();
  }

  public async runCustomSql(
    query: string,
    params?: Record<string, any>
  ): Promise<CustomQueryResponse> {
    const res = await fetch(`${API_BASE_URL}/dev/db/query`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ query, params }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Query execution failed" }));
      const msg = typeof err.detail === "object" ? err.detail.error || JSON.stringify(err.detail) : err.detail;
      throw new Error(msg || "Query execution failed");
    }
    return res.json();
  }

  public async seedDbPreset(preset: string): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/dev/db/seed-preset`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ preset }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Seed failed" }));
      throw new Error(err.detail || "Seed failed");
    }
    return res.json();
  }
}

export interface TableColumnMeta {
  name: string;
  type: string;
  nullable: boolean;
  default?: string | null;
  primary_key: boolean;
}

export interface TableInfo {
  name: string;
  row_count: number;
  primary_keys: string[];
  column_count: number;
  columns: TableColumnMeta[];
  error?: string;
}

export interface TableRowsResponse {
  table: string;
  columns: string[];
  total_count: number;
  limit: number;
  offset: number;
  rows: Record<string, any>[];
}

export interface CustomQueryResponse {
  status: string;
  type: "select" | "dml_ddl";
  columns?: string[];
  rows?: any[][];
  row_count?: number;
  rows_affected?: number;
  execution_time_ms: number;
  message?: string;
}

export const api = new ApiClient();

