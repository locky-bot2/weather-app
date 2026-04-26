# Deploying Weather App to GCP Cloud Run

## Recent Improvements

- **Dockerfile**: Added non-root user (`appuser`) for security, `--ignore-scripts` for faster ci
- **nginx.conf**: Added security headers (X-Frame-Options, CSP, X-Content-Type-Options, Referrer-Policy), hidden file denial, gzip min length
- **GitHub Actions**: Added `.github/workflows/deploy.yml` for CI/CD on push to main
- **Terraform**: Added `terraform/` for IaC-managed GCP resources

## Prerequisites

- `gcloud` CLI installed and authenticated
- A GCP project with billing enabled
- Docker (for local testing)

---

## 1. GCP Project Setup

```bash
# Set project
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  containerregistry.googleapis.com
```

### Service Account

Cloud Build needs permission to deploy to Cloud Run. The default Cloud Build service account needs the `Cloud Run Admin` and `IAM Service Account User` roles:

```bash
PROJECT_NUM=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUM}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUM}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

---

## 2. Artifact Registry Setup

```bash
export REGION="us-central1"
export REPO="weather-app"

# Create Docker repository
gcloud artifacts repositories create $REPO \
  --repository-format=docker \
  --location=$REGION \
  --description="Weather app container images"

# Authenticate Docker
gcloud auth configure-docker ${REGION}-docker.pkg.dev
```

---

## 3. Cloud Build Deployment

### Option A: Trigger-based (automatic on push)

```bash
# Connect GitHub repo
gcloud source repos create weather-app || true

# Create build trigger (connects to GitHub repo)
gcloud builds triggers create github \
  --repo-name=weather-app \
  --repo-owner=locky-bot2 \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

### Option B: Manual submit

```bash
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_REGION=$REGION,_REPO=$REPO
```

---

## 4. Cloud Run Deployment (Manual)

If you prefer to deploy directly without Cloud Build:

```bash
# Build & push
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/weather-app:latest .
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/weather-app:latest

# Deploy
gcloud run deploy weather-app \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/weather-app:latest \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=3 \
  --memory=256Mi \
  --cpu=1 \
  --port=80
```

---

## 5. Environment Variables

This app uses Open-Meteo and Overpass APIs (no API keys required). If you add env vars later:

```bash
gcloud run services update weather-app \
  --region=$REGION \
  --set-env-vars="KEY1=value1,KEY2=value2"
```

For secrets, use Secret Manager:

```bash
gcloud secrets create my-secret --data-file=./secret.txt
gcloud run services update weather-app \
  --region=$REGION \
  --update-secrets="MY_SECRET=my-secret:latest"
```

---

## 6. Custom Domain Mapping (Optional)

```bash
# Map a custom domain
gcloud run domain-mappings create \
  --service=weather-app \
  --domain=weather.yourdomain.com \
  --region=$REGION

# Then add the provided DNS A/AAAA records to your domain registrar
```

---

## 7. Cost Estimation

| Resource | Free Tier | Estimated Cost |
|----------|-----------|----------------|
| Cloud Run | 2M requests/mo, 360K GB-sec/mo | ~$0 for low traffic |
| Artifact Registry | 0.5 GB storage free | ~$0.10/GB/mo beyond |
| Cloud Build | 120 build-min/day free | ~$0 for occasional builds |
| Networking | 1 GB egress/mo free | ~$0.12/GB beyond |

**Estimated monthly cost for low-traffic app: $0–$5**

---

## 8. Local K8s (kind) Testing

```bash
# Install kind if not present
# https://kind.sigs.k8s.io/docs/user/quick-start/

# Create cluster
kind create cluster --name weather-test

# Build image locally
docker build -t weather-app:local .

# Load image into kind
kind load docker-image weather-app:local --name weather-test

# Deploy with Kubernetes manifest
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: weather-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: weather-app
  template:
    metadata:
      labels:
        app: weather-app
    spec:
      containers:
      - name: weather-app
        image: weather-app:local
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: weather-app
spec:
  type: NodePort
  selector:
    app: weather-app
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080
EOF

# Access at http://localhost:30080

# Cleanup
kind delete cluster --name weather-test
```

---

## Verification

After deployment, get the service URL:

```bash
gcloud run services describe weather-app \
  --region=$REGION \
  --format='value(status.url)'
```

Open the URL and confirm the weather app loads.

---

## 9. GitHub Actions CI/CD

A GitHub Actions workflow (`.github/workflows/deploy.yml`) handles automated build, test, and deploy on push to `main`.

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `GCP_PROJECT_ID` | Your GCP project ID |
| `WIF_PROVIDER` | Workload Identity Federation provider (e.g., `projects/123/locations/global/workloadIdentityPools/my-pool/providers/my-provider`) |
| `WIF_SERVICE_ACCOUNT` | Service account email for WIF |

### Setup Workload Identity Federation (recommended over service account keys)

```bash
# Create workload identity pool
gcloud iam workload-identity-pools create github-pool \
  --location=global \
  --display-name="GitHub Actions Pool"

# Create provider
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location=global \
  --workload-identity-pool=github-pool \
  --display-name="GitHub Actions Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Bind to service account
gcloud iam service-accounts add-iam-policy-binding YOUR_SA@YOUR_PROJECT.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUM/locations/global/workloadIdentityPools/github-pool/attribute.repository/locky-bot2/weather-app"
```

---

## 10. Terraform (Infrastructure as Code)

Manage GCP infrastructure declaratively with Terraform:

```bash
cd terraform/

# Copy and edit variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your project ID and image

# Create the GCS backend bucket (one-time)
gsutil mb -l us-central1 gs://weather-app-tfstate

# Initialize
terraform init

# Plan
terraform plan

# Apply
terraform apply
```

### What Terraform manages

- Artifact Registry repository
- Cloud Run service (with scaling, resources, port config)
- IAM policy for public access
- Required GCP API enablement

### Update the image after a new build

```bash
terraform apply -var="image=us-central1-docker.pkg.dev/PROJECT_ID/weather-app/weather-app:NEW_SHA"
```
