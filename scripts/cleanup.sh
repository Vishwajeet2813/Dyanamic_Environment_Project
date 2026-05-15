#!/bin/bash

NAMESPACE=$1

if [ -z "$NAMESPACE" ]; then
  echo "❌ Error: Namespace name do"
  echo "Usage: ./scripts/cleanup.sh <namespace-name>"
  exit 1
fi

echo "🔍 Checking namespace: $NAMESPACE"

if kubectl get namespace $NAMESPACE > /dev/null 2>&1; then
  echo "🗑️ Deleting namespace: $NAMESPACE"
  kubectl delete namespace $NAMESPACE --ignore-not-found
  echo "✅ Namespace $NAMESPACE deleted successfully!"
else
  echo "⚠️ Namespace $NAMESPACE does not exist"
fi