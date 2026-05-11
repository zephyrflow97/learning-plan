"""
API tests
"""

def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_root(client):
    response = client.get("/api/v1/")
    assert response.status_code == 200
    assert "message" in response.json()
