from django.core.management.base import BaseCommand

from detector.ml_model.bootstrap import ensure_model_artifact


class Command(BaseCommand):
    help = "Train the bundled SecureX scam detector and persist model.pkl."

    def handle(self, *args, **options):
        model_path = ensure_model_artifact(force_retrain=True)
        self.stdout.write(
            self.style.SUCCESS(f"SecureX model artifact saved to {model_path}")
        )
