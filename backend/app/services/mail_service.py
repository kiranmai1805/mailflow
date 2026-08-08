from email.mime.text import MIMEText
import base64

from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request


def send_email(
    access_token: str,
    refresh_token: str,
    client_id: str,
    client_secret: str,
    recipient: str,
    subject: str,
    body: str,
):
    credentials = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=[
            "https://www.googleapis.com/auth/gmail.send"
        ],
    )

    # Automatically refresh the access token if it has expired
    if credentials.expired and credentials.refresh_token:
        credentials.refresh(Request())

    gmail = build(
        "gmail",
        "v1",
        credentials=credentials,
    )

    message = MIMEText(body)

    message["to"] = recipient
    message["subject"] = subject

    encoded_message = base64.urlsafe_b64encode(
        message.as_bytes()
    ).decode()

    result = gmail.users().messages().send(
        userId="me",
        body={
            "raw": encoded_message
        },
    ).execute()

    return result