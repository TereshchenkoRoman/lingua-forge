from django.conf import settings
from django.db import IntegrityError, transaction
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Profile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_or_get_profile(sender, instance, created, **kwargs):
    if not created:
        return

    # Create profile after successful transaction commit to avoid race conditions
    def _create_profile():
        try:
            Profile.objects.get_or_create(user=instance)
        except IntegrityError:
            pass

    try:
        transaction.on_commit(_create_profile)
    except Exception:
        _create_profile()