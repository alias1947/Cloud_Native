#!/bin/bash

# Deploy script for Kubernetes

echo "Deploying to Kubernetes..."

# Apply Kubernetes manifests
kubectl apply -f infrastructure/kubernetes/

# Wait for deployments
kubectl wait --for=condition=available --timeout=300s deployment/api-gateway
kubectl wait --for=condition=available --timeout=300s deployment/auth-service
kubectl wait --for=condition=available --timeout=300s deployment/optimization-service
kubectl wait --for=condition=available --timeout=300s deployment/resource-mgmt-service
kubectl wait --for=condition=available --timeout=300s deployment/monitoring-service

echo "Deployment completed!"
echo "Services:"
kubectl get services