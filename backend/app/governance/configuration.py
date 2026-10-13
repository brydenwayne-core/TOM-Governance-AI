import yaml
from app.config import ROOT
from app.models import ADVISOR_IDS, AdvisorProfile, GovernanceCharter


def load_profiles():
    profiles = [
        AdvisorProfile.model_validate(yaml.safe_load(p.read_text()))
        for p in sorted((ROOT / "governance/advisors").glob("*.yaml"))
    ]
    if len(profiles) != 5 or {p.id for p in profiles} != set(ADVISOR_IDS):
        raise ValueError("Exactly five unique advisors must be configured")
    return sorted(profiles, key=lambda p: ADVISOR_IDS.index(p.id))


PROFILES = load_profiles()

CHARTER = GovernanceCharter.model_validate(yaml.safe_load((ROOT / "governance/policies/charter.yaml").read_text()))
