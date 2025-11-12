#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="securex-frontend"
ENVIRONMENT=${1:-staging}
VERSION=$(git describe --tags --always || echo "dev-$(git rev-parse --short HEAD)")
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOY_LOG="deploy_${ENVIRONMENT}_${TIMESTAMP}.log"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$DEPLOY_LOG"
}

success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$DEPLOY_LOG"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$DEPLOY_LOG"
}

error() {
    echo -e "${RED}✗${NC} $1" | tee -a "$DEPLOY_LOG"
    exit 1
}

# Validation functions
validate_environment() {
    log "Validating deployment environment: $ENVIRONMENT"
    
    case $ENVIRONMENT in
        staging|production)
            ;;
        *)
            error "Invalid environment: $ENVIRONMENT. Must be 'staging' or 'production'"
            ;;
    esac
    
    # Check required environment variables
    local required_vars=()
    
    if [ "$ENVIRONMENT" = "production" ]; then
        required_vars=(
            "AWS_ACCESS_KEY_ID"
            "AWS_SECRET_ACCESS_KEY"
            "REACT_APP_API_BASE_URL"
            "REACT_APP_ENCRYPTION_KEY"
        )
    fi
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    success "Environment validation passed"
}

validate_dependencies() {
    log "Checking system dependencies"
    
    local dependencies=("docker" "docker-compose" "node" "npm" "git")
    
    for dep in "${dependencies[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            error "Dependency $dep is not installed"
        fi
    done
    
    success "All dependencies are available"
}

# Deployment functions
build_application() {
    log "Building application version: $VERSION"
    
    # Clean previous builds
    npm run clean || warning "Clean command not available"
    
    # Install dependencies
    log "Installing dependencies"
    npm ci
    
    # Security audit
    log "Running security audit"
    npm audit --audit-level high || warning "Security audit found issues"
    
    # Run tests
    log "Running test suite"
    npm run test:ci
    
    # Build application
    log "Building application"
    NODE_ENV=production npm run build:prod
    
    # Build Docker image
    log "Building Docker image"
    docker build -t "$APP_NAME:$VERSION" -t "$APP_NAME:latest" .
    
    success "Application built successfully"
}

run_integration_tests() {
    log "Running integration tests"
    
    # Start services
    docker-compose -f docker-compose.test.yml up -d
    
    # Wait for services to be ready
    sleep 30
    
    # Run integration tests
    npm run test:integration || {
        docker-compose -f docker-compose.test.yml down
        error "Integration tests failed"
    }
    
    # Cleanup
    docker-compose -f docker-compose.test.yml down
    
    success "Integration tests passed"
}

deploy_to_environment() {
    log "Deploying to $ENVIRONMENT environment"
    
    case $ENVIRONMENT in
        staging)
            deploy_to_staging
            ;;
        production)
            deploy_to_production
            ;;
    esac
}

deploy_to_staging() {
    log "Deploying to staging environment"
    
    # Push to container registry
    docker tag "$APP_NAME:$VERSION" "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$APP_NAME:$VERSION"
    docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$APP_NAME:$VERSION"
    
    # Update ECS service
    aws ecs update-service \
        --cluster securex-staging \
        --service frontend \
        --force-new-deployment \
        --region "$AWS_REGION"
    
    # Wait for deployment completion
    wait_for_deployment "securex-staging" "frontend"
    
    success "Staging deployment completed"
}

deploy_to_production() {
    log "Deploying to production environment"
    
    # Push to container registry
    docker tag "$APP_NAME:$VERSION" "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$APP_NAME:$VERSION"
    docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$APP_NAME:$VERSION"
    
    # Update ECS service with blue-green deployment
    aws ecs update-service \
        --cluster securex-production \
        --service frontend \
        --force-new-deployment \
        --region "$AWS_REGION" \
        --deployment-configuration "maximumPercent=200,minimumHealthyPercent=100"
    
    # Wait for deployment completion
    wait_for_deployment "securex-production" "frontend"
    
    # Run smoke tests
    run_smoke_tests
    
    success "Production deployment completed"
}

wait_for_deployment() {
    local cluster=$1
    local service=$2
    local max_attempts=30
    local attempt=1
    
    log "Waiting for deployment to complete"
    
    while [ $attempt -le $max_attempts ]; do
        local deployment=$(aws ecs describe-services \
            --cluster "$cluster" \
            --services "$service" \
            --region "$AWS_REGION" \
            --query 'services[0].deployments[?status==`PRIMARY`]' \
            --output json)
        
        local running_count=$(echo "$deployment" | jq -r '.[0].runningCount // 0')
        local desired_count=$(echo "$deployment" | jq -r '.[0].desiredCount // 0')
        
        if [ "$running_count" -eq "$desired_count" ] && [ "$desired_count" -gt 0 ]; then
            success "Deployment completed: $running_count/$desired_count tasks running"
            return 0
        fi
        
        log "Deployment in progress: $running_count/$desired_count tasks running (attempt $attempt/$max_attempts)"
        sleep 30
        attempt=$((attempt + 1))
    done
    
    error "Deployment timed out after $max_attempts attempts"
}

run_smoke_tests() {
    log "Running smoke tests"
    
    local base_url=""
    
    case $ENVIRONMENT in
        staging)
            base_url="https://staging.securex.example.com"
            ;;
        production)
            base_url="https://securex.example.com"
            ;;
    esac
    
    # Test basic application functionality
    local tests=(
        "$base_url/health"
        "$base_url/"
        "$base_url/api/health"
    )
    
    for url in "${tests[@]}"; do
        local response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
        
        if [ "$response" -ne 200 ]; then
            error "Smoke test failed for $url (HTTP $response)"
        fi
        
        success "Smoke test passed for $url"
    done
    
    success "All smoke tests passed"
}

post_deployment_actions() {
    log "Running post-deployment actions"
    
    # Update deployment tracking
    aws dynamodb put-item \
        --table-name securex-deployments \
        --item "{
            \"Environment\": {\"S\": \"$ENVIRONMENT\"},
            \"Timestamp\": {\"S\": \"$TIMESTAMP\"},
            \"Version\": {\"S\": \"$VERSION\"},
            \"Status\": {\"S\": \"COMPLETED\"}
        }" \
        --region "$AWS_REGION" \
        || warning "Failed to update deployment tracking"
    
    # Send notification
    send_deployment_notification
    
    # Clean up old images
    clean_up_old_images
    
    success "Post-deployment actions completed"
}

send_deployment_notification() {
    log "Sending deployment notification"
    
    local message="Deployment of $APP_NAME v$VERSION to $ENVIRONMENT completed successfully at $(date)"
    
    # Send to Slack
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" \
            || warning "Failed to send Slack notification"
    fi
    
    # Send to email
    if [ -n "$DEPLOYMENT_EMAIL" ]; then
        echo "$message" | mail -s "Deployment Notification: $APP_NAME" "$DEPLOYMENT_EMAIL" \
            || warning "Failed to send email notification"
    fi
}

clean_up_old_images() {
    log "Cleaning up old Docker images"
    
    # Keep only the last 5 images
    docker images "$APP_NAME" --format "{{.ID}} {{.Tag}}" | \
    grep -v latest | \
    sort -r | \
    tail -n +6 | \
    cut -d' ' -f1 | \
    xargs -r docker rmi || warning "Failed to clean up some images"
}

rollback_deployment() {
    log "Initiating rollback"
    
    # Get previous stable version
    local previous_version=$(aws dynamodb query \
        --table-name securex-deployments \
        --key-condition-expression "Environment = :env" \
        --filter-expression "Status = :status" \
        --expression-attribute-values "{
            \":env\": {\"S\": \"$ENVIRONMENT\"},
            \":status\": {\"S\": \"COMPLETED\"}
        }" \
        --max-items 2 \
        --region "$AWS_REGION" \
        | jq -r '.Items[1].Version.S' || echo "")
    
    if [ -n "$previous_version" ]; then
        log "Rolling back to version: $previous_version"
        
        # Update service to previous version
        aws ecs update-service \
            --cluster "securex-$ENVIRONMENT" \
            --service frontend \
            --force-new-deployment \
            --region "$AWS_REGION"
        
        wait_for_deployment "securex-$ENVIRONMENT" "frontend"
        
        success "Rollback to $previous_version completed"
    else
        error "No previous version found for rollback"
    fi
}

# Main deployment workflow
main() {
    log "Starting deployment of $APP_NAME to $ENVIRONMENT"
    log "Version: $VERSION, Timestamp: $TIMESTAMP"
    
    # Set up error handling
    trap 'error "Deployment failed at line $LINENO"' ERR
    trap 'warning "Deployment interrupted"; rollback_deployment; exit 1' INT TERM
    
    # Execute deployment steps
    validate_environment
    validate_dependencies
    build_application
    
    if [ "$ENVIRONMENT" = "production" ]; then
        run_integration_tests
    fi
    
    deploy_to_environment
    post_deployment_actions
    
    success "Deployment completed successfully!"
    
    # Display deployment summary
    echo
    echo "=== DEPLOYMENT SUMMARY ==="
    echo "Application: $APP_NAME"
    echo "Environment: $ENVIRONMENT"
    echo "Version: $VERSION"
    echo "Timestamp: $TIMESTAMP"
    echo "Status: ✅ SUCCESS"
    echo "Log file: $DEPLOY_LOG"
    echo "=========================="
}

# Run main function
main "$@"