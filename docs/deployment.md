# Deployment Guide

## Local Deployment

### Docker Compose

```bash
cd infrastructure/docker
docker-compose up -d
```

### Kubernetes

```bash
# Deploy to local cluster
kubectl apply -f infrastructure/kubernetes/

# Check deployment
kubectl get deployments
kubectl get services
```

## Production Deployment

### Azure AKS

1. Create AKS cluster:
```bash
az aks create --resource-group myResourceGroup --name myAKSCluster --node-count 2 --enable-addons monitoring --generate-ssh-keys
```

2. Connect to cluster:
```bash
az aks get-credentials --resource-group myResourceGroup --name myAKSCluster
```

3. Deploy using Helm:
```bash
helm install microservices infrastructure/helm/
```

### AWS EKS

1. Create EKS cluster using eksctl or AWS Console
2. Configure kubectl
3. Deploy services

### GCP GKE

1. Create GKE cluster
2. Configure kubectl
3. Deploy services

## Monitoring

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
- Kibana: http://localhost:5601

## Scaling

### Horizontal Pod Autoscaling

```bash
kubectl autoscale deployment api-gateway --cpu-percent=50 --min=2 --max=10
```

### Cluster Autoscaling

Configure cluster autoscaler based on your cloud provider.

## Backup and Recovery

- Database backups: Automated via cloud provider tools
- Configuration backups: Git-based
- Disaster recovery: Multi-region deployment