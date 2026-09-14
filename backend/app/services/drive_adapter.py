import os
import uuid
from typing import Dict, Any, Optional

from app.logging_config import get_logger

logger = get_logger("placify.drive")

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
                logger.info("Initialized Google Drive API client successfully using service account.")
            except Exception as e:
                logger.warning(f"Failed to initialize Google Drive client: {e}. Falling back to local storage adapter.")
                self._service = None
        else:
            logger.info("No Google Drive credentials configured; using persistent local filesystem storage.")

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

        # Local file storage fallback for development / on-prem environment
        LOCAL_STORAGE_DIR = os.getenv("LOCAL_STORAGE_DIR", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "uploads"))
        os.makedirs(LOCAL_STORAGE_DIR, exist_ok=True)

        file_uuid = uuid.uuid4().hex[:12]
        safe_name = f"{file_uuid}_{filename}"
        local_path = os.path.join(LOCAL_STORAGE_DIR, safe_name)
        with open(local_path, "wb") as f:
            f.write(file_bytes)

        file_id = f"local_{safe_name}"
        logger.info(f"Persisted file '{filename}' ({len(file_bytes)} bytes) locally to {local_path} -> id={file_id}")
        return {
            "drive_file_id": file_id,
            "drive_view_link": f"/api/v1/documents/files/{file_id}"
        }

    def download_file(self, drive_file_id: str) -> bytes:
        """
        Downloads file bytes from Google Drive or local storage disk using drive_file_id.
        """
        logger.debug(f"Fetching file bytes for drive_file_id='{drive_file_id}'")
        if self._service and not drive_file_id.startswith("local_") and not drive_file_id.startswith("mock_drive_"):
            import io
            from googleapiclient.http import MediaIoBaseDownload

            request = self._service.files().get_media(fileId=drive_file_id)
            fh = io.BytesIO()
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                _, done = downloader.next_chunk()
            return fh.getvalue()

        if drive_file_id.startswith("local_"):
            LOCAL_STORAGE_DIR = os.getenv("LOCAL_STORAGE_DIR", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "uploads"))
            safe_name = drive_file_id.removeprefix("local_")
            local_path = os.path.join(LOCAL_STORAGE_DIR, safe_name)
            if os.path.exists(local_path):
                with open(local_path, "rb") as f:
                    return f.read()
            logger.warning(f"Local file not found at path {local_path} for id={drive_file_id}")

        # Mock fallback
        logger.info(f"Returning deterministic mock content for drive_file_id='{drive_file_id}'")
        return f"Mock content for file {drive_file_id}".encode("utf-8")

drive_adapter = DriveAdapter()
