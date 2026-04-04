# Development Setup Guide

## Prerequisites

- Python 3.9+
- Docker Desktop
- Kubernetes (Minikube/k3s)
- Git

## Local Development Environment

### 1. Clone and Setup

```bash
git clone <repository-url>
cd cloud-native-platform
```

### 2. Python Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Docker Services

```bash
cd infrastructure/docker
docker-compose up -d
```

### 4. Run Individual Services

Each service can be run independently:

```bash
# API Gateway
cd services/api-gateway
uvicorn main:app --reload

# Auth Service
cd services/auth-service
uvicorn main:app --reload

# And so on...
```

### 5. Kubernetes Deployment

```bash
# Start Minikube
minikube start

# Deploy services
kubectl apply -f infrastructure/kubernetes/

# Check status
kubectl get pods
kubectl get services
```

## Testing

```bash
# Run all tests
pytest tests/

# Run specific service tests
pytest tests/test_api_gateway/
```

## Code Quality

- Use `black` for code formatting
- Use `flake8` for linting
- Use `mypy` for type checking

## API Documentation

- REST APIs: http://localhost:8000/docs (FastAPI auto-generated)
- gRPC: Use grpcui or similar tools to explore .proto files