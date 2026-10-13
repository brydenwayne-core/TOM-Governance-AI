import os
import tempfile
from pathlib import Path
import pytest

# Do not read or alter a developer's database or credentials in tests.
_TEST_DIR = tempfile.TemporaryDirectory(prefix="tom-tests-")
os.environ["TOM_DATABASE_URL"] = f"sqlite:///{Path(_TEST_DIR.name) / 'test.db'}"
os.environ["TOM_DEMO"] = "true"
os.environ["TOM_PROVIDER"] = "mock"
os.environ["TOM_ORGANIZATION"] = "tom-demo"
os.environ["TOM_API_TOKEN"] = ""
from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402
from app.storage import Base, engine  # noqa: E402


@pytest.fixture
def client():
    Base.metadata.drop_all(engine)
    with TestClient(app) as c:
        yield c


@pytest.fixture
def scenario():
    from app.models import Scenario

    return Scenario(
        title="Educational pilot",
        proposal="Expand tours, artist workshops and accessible community education with conservation controls.",
        desired_outcome="Sustainable inclusive programming",
        budget=12000,
        projected_revenue=18000,
    )
