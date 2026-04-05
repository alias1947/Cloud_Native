import httpx
import pytest


class TestCloudNativePlatform:
    """End-to-end tests for Cloud-Native Microservices Platform"""

    BASE_URLS = {
        "api_gateway": "http://localhost:8000",
        "auth": "http://localhost:8001",
        "optimization": "http://localhost:8002",
        "resource_mgmt": "http://localhost:8003",
        "monitoring": "http://localhost:8004",
    }

    @pytest.mark.asyncio
    async def test_all_services_health(self):
        """Test health endpoints for all services"""
        async with httpx.AsyncClient() as client:
            for service_name, url in self.BASE_URLS.items():
                response = await client.get(f"{url}/health")
                assert response.status_code == 200
                data = response.json()
                assert "status" in data
                assert data["status"] == "healthy"

    @pytest.mark.asyncio
    async def test_authentication_flow(self):
        """Test complete authentication flow"""
        async with httpx.AsyncClient() as client:
            # Login
            login_data = {"username": "admin", "password": "admin123"}
            response = await client.post(
                f"{self.BASE_URLS['auth']}/auth/login", json=login_data
            )
            assert response.status_code == 200
            token_data = response.json()
            assert "access_token" in token_data
            assert token_data["token_type"] == "bearer"

            token = token_data["access_token"]
            headers = {"Authorization": f"Bearer {token}"}

            # Verify token
            response = await client.get(
                f"{self.BASE_URLS['auth']}/auth/verify", headers=headers
            )
            assert response.status_code == 200
            verify_data = response.json()
            assert verify_data["username"] == "admin"
            assert "admin" in verify_data["roles"]

    @pytest.mark.asyncio
    async def test_monitoring_service(self):
        """Test monitoring service functionality"""
        async with httpx.AsyncClient() as client:
            # Test system metrics collection
            response = await client.get(
                f"{self.BASE_URLS['monitoring']}/system/metrics"
            )
            assert response.status_code == 200
            metrics = response.json()
            assert "system_metrics" in metrics
            assert len(metrics["system_metrics"]) > 0

            # Test alert rules
            response = await client.get(f"{self.BASE_URLS['monitoring']}/alerts/rules")
            assert response.status_code == 200
            rules = response.json()
            assert "rules" in rules
            assert len(rules["rules"]) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
