# Cloud-Native Microservices Platform

A comprehensive cloud resource optimization and management system featuring intelligent resource allocation, load balancing, real-time monitoring, and an interactive web dashboard.

## 📋 Overview

This platform addresses the critical challenges of managing distributed microservices at scale:

- **Cost Optimization**: Intelligently allocates compute resources to minimize waste
- **Performance Management**: Balances workloads and ensures quality of service
- **Auto-Scaling**: Automatically scales services based on demand
- **Real-time Monitoring**: Tracks system metrics and triggers alerts
- **Security**: JWT-based authentication with role-based access control

## 🏗️ Architecture

### Microservices

| Service | Port | Purpose |
|---------|------|---------|
| **API Gateway** | 8000 | Central routing and service discovery |
| **Authentication** | 8001 | JWT authentication & RBAC |
| **Optimization** | 8002 | CVXPY-based resource allocation |
| **Resource Mgmt** | 8003 | Load balancing & auto-scaling |
| **Monitoring** | 8004 | Metrics collection & alerting |
| **gRPC Server** | 50051 | High-performance optimization interface |
| **Web Dashboard** | 3000 | Interactive React UI |

### Technology Stack

- **Backend**: Python FastAPI with CVXPY optimization engine
- **Communication**: REST APIs + gRPC
- **Frontend**: React with Material-UI
- **Database**: In-memory (demo), ready for persistent storage
- **Security**: JWT tokens, RBAC
- **Deployment**: Docker & Kubernetes ready
- **Monitoring**: psutil for system metrics

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd "Cloud_Native Project"
```

2. **Set up Python virtual environment**
```bash
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # macOS/Linux
```

3. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

4. **Install Node dependencies**
```bash
cd ui
npm install
cd ..
```

### Running the Platform

#### Start All Services (6 terminals)

```bash
# Terminal 1: API Gateway
cd services/api-gateway
..\..\venv\Scripts\python.exe main.py

# Terminal 2: Authentication Service
cd services/auth-service
..\..\venv\Scripts\python.exe main.py

# Terminal 3: Optimization Service
cd services/optimization-service
..\..\venv\Scripts\python.exe main.py

# Terminal 4: Resource Management Service
cd services/resource-mgmt-service
..\..\venv\Scripts\python.exe main.py

# Terminal 5: Monitoring Service
cd services/monitoring-service
..\..\venv\Scripts\python.exe main.py

# Terminal 6: Web UI
cd ui
npm start
```

#### Access the Platform

- **Web Dashboard**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

## 📚 Project Structure

```
Cloud_Native Project/
├── services/
│   ├── api-gateway/              # Service discovery & routing
│   ├── auth-service/             # JWT & RBAC
│   ├── optimization-service/     # CVXPY resource allocation
│   ├── resource-mgmt-service/    # Load balancing & scaling
│   └── monitoring-service/       # Metrics & alerts
├── ui/                           # React web dashboard
├── infrastructure/
│   ├── kubernetes/               # K8s deployment manifests
│   └── docker/                   # Docker configurations
├── tests/                        # Automated test suite
├── requirements.txt              # Python dependencies
└── README.md                     # This file
```

## 🔑 Key Features

### Optimization Engine
- Priority-based task scheduling
- Dual optimization algorithms
- QoS requirement prediction
- Power-efficient allocation

### Monitoring & Alerting
- Real-time CPU, memory, disk metrics
- Configurable alert rules
- Multiple severity levels
- Historical metrics tracking

### Resource Management
- Multiple load balancing strategies
- Auto-scaling based on resource utilization
- Dynamic service discovery
- Health checks

### Security
- JWT token-based authentication
- Role-based access control (admin, user)
- Secure password storage
- Session management

### Web Dashboard
- Real-time system metrics visualization
- Service health status
- Optimization playground
- Alert monitoring
- Interactive configuration

## 🧪 Testing

Run the automated test suite:

```bash
cd tests
pytest test_e2e.py -v
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines and instructions.

---

**Built with ❤️ for cloud-native architecture**

Last Updated: April 4, 2026
Version: 1.0.0