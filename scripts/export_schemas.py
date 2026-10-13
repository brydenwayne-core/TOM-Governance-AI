import json
import sys
from pathlib import Path
from app.models import (
    AdvisorProfile,
    DocumentMetadata,
    Scenario,
    Assessment,
    Revision,
    Synthesis,
    GovernanceCharter,
    DecisionReport,
)

ROOT = Path(__file__).resolve().parents[1]
for name, model in [
    ("advisor", AdvisorProfile),
    ("document", DocumentMetadata),
    ("scenario", Scenario),
    ("assessment", Assessment),
    ("revision", Revision),
    ("synthesis", Synthesis),
    ("charter", GovernanceCharter),
    ("decision-report", DecisionReport),
]:
    path = ROOT / f"governance/schemas/{name}.schema.json"
    content = json.dumps(model.model_json_schema(), indent=2) + "\n"
    if "--check" in sys.argv:
        assert path.read_text() == content, f"Schema out of date: {name}"
    else:
        path.write_text(content)
