# backend/linguaforge/authsvc/services/email_services.py

from django.conf import settings
from django.core.signing import dumps, loads, SignatureExpired, BadSignature

EMAIL_CONFIRM_SALT = "email-confirm-salt"
EMAIL_CONFIRM_MAX_AGE = getattr(settings, "EMAIL_CONFIRM_MAX_AGE", 60 * 60 * 24)

def make_email_confirmation_token(user):
    """
    Create a signed token for email confirmation.
    Token contains user.pk and a version flag to avoid reuse after state change.
    Format stored in token: "<user_pk>:<is_email_confirmed_flag>"
    """
    payload = f"{user.pk}:{int(user.is_email_confirmed)}"
    return dumps(payload, salt=EMAIL_CONFIRM_SALT)

def verify_email_confirmation_token(token, max_age=EMAIL_CONFIRM_MAX_AGE):
    """
    Verify signed token and return user_pk if valid.
    Raises SignatureExpired or BadSignature on invalid/expired tokens.
    """
    try:
        unsigned = loads(token, salt=EMAIL_CONFIRM_SALT, max_age=max_age)
    except (SignatureExpired, BadSignature):
        raise

    parts = unsigned.split(":")
    if len(parts) != 2:
        raise BadSignature("Malformed token")
    try:
        return int(parts[0])
    except ValueError:
        raise BadSignature("Invalid user id in token")