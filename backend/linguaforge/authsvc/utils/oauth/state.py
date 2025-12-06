from django.core import signing
from django.core.signing import BadSignature

DEFAULT_MAX_AGE = 300

def set_oauth_state_cookie(response, signed_state, *, max_age=DEFAULT_MAX_AGE, cookie_name):
    """Set signed OAuth state in a secure cookie."""
    response.set_cookie(
        cookie_name,
        signed_state,
        max_age=max_age,
        httponly=True,
        secure=True,
        samesite="None",
        path="/",
    )
    return response

def validate_oauth_state_cookie(request, state_from_query, *, cookie_name, max_age=DEFAULT_MAX_AGE):
    """Validate state from query against signed cookie and return the signed payload."""
    signed_state = request.COOKIES.get(cookie_name)
    if not signed_state:
        raise ValueError("Missing state cookie")

    try:
        data = signing.loads(signed_state, max_age=max_age)
    except BadSignature:
        raise ValueError("Invalid state")

    expected_state = data.get("state")
    if state_from_query != expected_state:
        raise ValueError("State mismatch")

    return data

def clear_oauth_state_cookie(response, *, cookie_name):
    """Remove the OAuth state cookie."""
    response.delete_cookie(cookie_name, path="/")
    return response