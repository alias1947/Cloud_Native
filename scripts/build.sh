#!/bin/bash

# Build script for all services

echo "Building all services..."

# Build API Gateway
echo "Building API Gateway..."
cd services/api-gateway
docker build -t api-gateway:latest .

# Build Auth Service
echo "Building Auth Service..."
cd ../auth-service
docker build -t auth-service:latest .

# Build Optimization Service
echo "Building Optimization Service..."
cd ../optimization-service
docker build -t optimization-service:latest .

# Build Resource Management Service
echo "Building Resource Management Service..."
cd ../resource-mgmt-service
docker build -t resource-mgmt-service:latest .

# Build Monitoring Service
echo "Building Monitoring Service..."
cd ../monitoring-service
docker build -t monitoring-service:latest .

echo "All services built successfully!"