import aiosmtplib

from email.message import EmailMessage


async def send_smtp_email(
    smtp_host: str,
    smtp_port: int,
    username: str,
    password: str,
    recipient: str,
    subject: str,
    body: str,
    use_tls: bool = True,
):
    message = EmailMessage()

    message["From"] = username
    message["To"] = recipient
    message["Subject"] = subject

    message.set_content(body)

    await aiosmtplib.send(
        message,
        hostname=smtp_host,
        port=smtp_port,
        username=username,
        password=password,
        start_tls=use_tls,
    )

    return {
        "message": "Email sent successfully",
        "recipient": recipient,
    }