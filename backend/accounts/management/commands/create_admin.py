from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = "Create Jeeva Herbs admin user"

    def handle(self, *args, **options):
        email = input("Admin email: ").strip()
        password = input("Admin password: ").strip()
        name = input("Admin name: ").strip()

        if not email or not password or not name:
            self.stdout.write(
                self.style.ERROR("All fields are required.")
            )
            return

        user = User.objects.filter(email__iexact=email).first()

        if user:
            user.first_name = name
            user.is_staff = True
            user.is_active = True
            user.set_password(password)
            user.save()

            self.stdout.write(
                self.style.SUCCESS(
                    f"Existing user '{email}' is now an admin."
                )
            )
            return

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name,
            is_staff=True,
            is_active=True,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Admin user '{email}' created successfully."
            )
        )