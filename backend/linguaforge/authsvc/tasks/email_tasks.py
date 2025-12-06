from django.conf import settings
from django.core.mail import send_mail
from typing import List


def send_email_task(subject: str, message: str, recipient_list: List[str]) -> None:
    """Send email. In production convert to a Celery task and call .delay()."""
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list, fail_silently=False)