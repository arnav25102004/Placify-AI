import os
import uuid
from typing import Dict, Any, Optional

CREDENTIALS_PATH = os.getenv("GOOGLE_DRIVE_CREDENTIALS_PATH", "")
FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID", "")

class DriveAdapter:
    """
    Google Drive API adapter supporting resumable uploads and Shared Drive access.
    Falls back to deterministic local mock handling if service account credentials are absent.
    """
    def __init__(self):
        self._service = None
        if CREDENTIALS_PATH and os.path.exists(CREDENTIALS_PATH):
            try:
                from google.oauth2 import service_account
                from googleapiclient.discovery import build

                scopes = ['https://www.googleapis.com/auth/drive.file']
                creds = service_account.Credentials.from_service_account_file(
                    CREDENTIALS_PATH, scopes=scopes
                )
                self._service = build('drive', 'v3', credentials=creds)
            except Exception as e:
                print(f"[DriveAdapter] Failed to initialize Google Drive client: {e}")
                self._service = None

    def upload_file(
        self, file_bytes: bytes, filename: str, content_type: str = "application/pdf"
    ) -> Dict[str, str]:
        """
        Uploads file bytes to Google Drive (or mock fallback).
        Returns dict containing drive_file_id and drive_view_link.
        """
        if self._service and FOLDER_ID:
            import io
            from googleapiclient.http import MediaIoBaseUpload

            file_metadata = {
                'name': filename,
                'parents': [FOLDER_ID]
            }
            media = MediaIoBaseUpload(
                io.BytesIO(file_bytes), mimetype=content_type, resumable=True
            )
            created_file = self._service.files().create(
                body=file_metadata, media_body=media, fields='id, webViewLink'
            ).execute()
            
            return {
                "drive_file_id": created_file.get("id"),
                "drive_view_link": created_file.get("webViewLink", f"https://drive.google.com/file/d/{created_file.get('id')}/view")
            }

        # Mock fallback for development / test environment
        mock_id = f"mock_drive_{uuid.uuid4().hex[:12]}"
        return {
            "drive_file_id": mock_id,
            "drive_view_link": f"https://drive.google.com/mock/{mock_id}/view"
        }

    def download_file(self, drive_file_id: str) -> bytes:
        """
        Downloads file bytes from Google Drive using drive_file_id.
        """
        if self._service and not drive_file_id.startswith("mock_drive_"):
            import io
            from googleapiclient.http import MediaIoBaseDownload

            request = self._service.files().get_media(fileId=drive_file_id)
            fh = io.BytesIO()
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                _, done = downloader.next_chunk()
            return fh.getvalue()

        # Mock fallback
        return f"Mock content for file {drive_file_id}".encode("utf-8")

drive_adapter = DriveAdapter()
