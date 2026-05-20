#!/usr/bin/env python3
"""Smoke-test FoodRanked Google Docs service-account access."""

from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build


DEFAULT_CREDS = Path("/home/idk/.config/foodranked/google-service-account.json")
SCOPES = ["https://www.googleapis.com/auth/documents"]


def document_id_from(value: str) -> str:
    match = re.search(r"/document/d/([^/]+)", value)
    return match.group(1) if match else value


def read_text(content: list[dict]) -> str:
    chunks: list[str] = []
    for item in content:
        paragraph = item.get("paragraph")
        if not paragraph:
            continue
        for element in paragraph.get("elements", []):
            chunks.append(element.get("textRun", {}).get("content", ""))
    return "".join(chunks)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("document", help="Google Doc URL or document ID")
    parser.add_argument(
        "--credentials",
        default=os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", str(DEFAULT_CREDS)),
        help=f"service-account JSON path, default: {DEFAULT_CREDS}",
    )
    parser.add_argument("--append", help="append text to the end of the document")
    args = parser.parse_args()

    creds_path = Path(args.credentials).expanduser()
    if not creds_path.exists():
        print(f"Missing credentials file: {creds_path}", file=sys.stderr)
        return 2

    credentials = service_account.Credentials.from_service_account_file(
        str(creds_path),
        scopes=SCOPES,
    )
    docs = build("docs", "v1", credentials=credentials)
    document_id = document_id_from(args.document)

    doc = docs.documents().get(documentId=document_id).execute()
    title = doc.get("title", "(untitled)")
    body = doc.get("body", {}).get("content", [])
    text = read_text(body)

    print(f"Title: {title}")
    print(f"Characters: {len(text)}")
    if text.strip():
        print("Preview:")
        print(text.strip()[:500])

    if args.append:
        end_index = body[-1]["endIndex"] - 1 if body else 1
        docs.documents().batchUpdate(
            documentId=document_id,
            body={
                "requests": [
                    {
                        "insertText": {
                            "location": {"index": end_index},
                            "text": args.append,
                        }
                    }
                ]
            },
        ).execute()
        print("Append: ok")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
