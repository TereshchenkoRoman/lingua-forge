import secrets
from urllib.parse import urlencode

import requests
from django.conf import settings
from django.core import signing
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import User

OAUTH_STATE_COOKIE = "oauth_state"


def build_google_oauth_url(request):
    client_id = settings.GOOGLE_CLIENT_ID
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    scope = "openid email profile"
    state = secrets.token_urlsafe(32)
    signed_state = signing.dumps({"state": state, "ts": timezone.now().timestamp()})
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": scope,
        "access_type": "offline",
        "prompt": "select_account",
        "state": state,
    }
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)
    return url, signed_state, state


def exchange_code_for_tokens(code):
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    resp = requests.post(token_url, data=data, timeout=10)
    resp.raise_for_status()
    return resp.json()


def get_google_userinfo(access_token=None, id_token=None):
    if access_token:
        headers = {"Authorization": f"Bearer {access_token}"}
        userinfo_url = "https://openidconnect.googleapis.com/v1/userinfo"
        resp = requests.get(userinfo_url, headers=headers, timeout=10)
        resp.raise_for_status()
        return resp.json()
    if id_token:
        resp = requests.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": id_token},
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()
    raise ValueError("Either access_token or id_token must be provided")


def create_or_update_user(userinfo):
    email = userinfo.get("email")
    if not email:
        raise ValueError("Google userinfo did not contain email")
    first_name = userinfo.get("given_name", "")
    last_name = userinfo.get("family_name", "")

    user, created = User.objects.get_or_create(
        email=email,
        defaults={"first_name": first_name, "last_name": last_name, "is_active": True},
    )

    if not created:
        changed = False
        if user.first_name != first_name:
            user.first_name = first_name
            changed = True
        if user.last_name != last_name:
            user.last_name = last_name
            changed = True
        if not user.is_active:
            user.is_active = True
            changed = True
        if changed:
            user.save()

    return user


def issue_jwt_tokens(user):
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    refresh_str = str(refresh)
    jti = refresh.get("jti", None)
    return {"access": access, "refresh": refresh_str, "refresh_jti": jti}