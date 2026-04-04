from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from enum import Enum
import time
import psutil
import json

app = FastAPI(
    title="Monitoring Service",
    description="Metrics collection and alerting for Cloud-Native Microservices Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MetricType(str, Enum):
    CPU = "cpu"
    MEMORY = "memory"
    DISK = "disk"
    NETWORK = "network"
    RESPONSE_TIME = "response_time"

class AlertRule(BaseModel):
    name: str
    metric: MetricType
    threshold: float
    operator: str  # "gt", "lt", "eq"
    severity: str  # "info", "warning", "error", "critical"

class Metric(BaseModel):
    service: str
    metric_type: MetricType
    value: float
    timestamp: float
    labels: Dict[str, str] = {}

class Alert(BaseModel):
    rule_name: str
    service: str
    metric: MetricType
    value: float
    threshold: float
    severity: str
    timestamp: float
    message: str

# In-memory storage for metrics and alerts
metrics_store = []
alerts_store = []
alert_rules = [
    AlertRule(name="high_cpu", metric=MetricType.CPU, threshold=80.0, operator="gt", severity="warning"),
    AlertRule(name="high_memory", metric=MetricType.MEMORY, threshold=85.0, operator="gt", severity="error"),
    AlertRule(name="low_disk", metric=MetricType.DISK, threshold=10.0, operator="lt", severity="critical")
]

@app.post("/metrics")
async def collect_metric(metric: Metric):
    """Collect a metric from a service"""
    metrics_store.append(metric.dict())
    # Check against alert rules
    check_alerts(metric)
    return {"status": "collected"}

@app.get("/metrics")
async def get_metrics(service: str = None, metric_type: MetricType = None, limit: int = 100):
    """Get collected metrics"""
    filtered_metrics = metrics_store
    
    if service:
        filtered_metrics = [m for m in filtered_metrics if m["service"] == service]
    
    if metric_type:
        filtered_metrics = [m for m in filtered_metrics if m["metric_type"] == metric_type.value]
    
    return {"metrics": filtered_metrics[-limit:]}

@app.post("/alerts/rules")
async def add_alert_rule(rule: AlertRule):
    """Add a new alert rule"""
    alert_rules.append(rule)
    return {"message": f"Alert rule '{rule.name}' added"}

@app.get("/alerts/rules")
async def get_alert_rules():
    """Get all alert rules"""
    return {"rules": [rule.dict() for rule in alert_rules]}

@app.get("/alerts")
async def get_alerts(severity: str = None, limit: int = 50):
    """Get recent alerts"""
    filtered_alerts = alerts_store
    
    if severity:
        filtered_alerts = [a for a in filtered_alerts if a["severity"] == severity]
    
    return {"alerts": filtered_alerts[-limit:]}

@app.get("/system/metrics")
async def get_system_metrics():
    """Get current system metrics"""
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    metrics = [
        Metric(
            service="system",
            metric_type=MetricType.CPU,
            value=cpu_percent,
            timestamp=time.time(),
            labels={"unit": "percent"}
        ),
        Metric(
            service="system",
            metric_type=MetricType.MEMORY,
            value=memory.percent,
            timestamp=time.time(),
            labels={"unit": "percent"}
        ),
        Metric(
            service="system",
            metric_type=MetricType.DISK,
            value=disk.percent,
            timestamp=time.time(),
            labels={"unit": "percent"}
        )
    ]
    
    # Collect these metrics
    for metric in metrics:
        metrics_store.append(metric.dict())
        check_alerts(metric)
    
    return {"system_metrics": [m.dict() for m in metrics]}

def check_alerts(metric: Metric):
    """Check metric against alert rules and generate alerts"""
    for rule in alert_rules:
        if rule.metric == metric.metric_type:
            trigger = False
            
            if rule.operator == "gt" and metric.value > rule.threshold:
                trigger = True
            elif rule.operator == "lt" and metric.value < rule.threshold:
                trigger = True
            elif rule.operator == "eq" and metric.value == rule.threshold:
                trigger = True
            
            if trigger:
                alert = Alert(
                    rule_name=rule.name,
                    service=metric.service,
                    metric=metric.metric_type,
                    value=metric.value,
                    threshold=rule.threshold,
                    severity=rule.severity,
                    timestamp=time.time(),
                    message=f"{metric.metric_type.value} {rule.operator} {rule.threshold} ({metric.value})"
                )
                alerts_store.append(alert.dict())

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "monitoring-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)