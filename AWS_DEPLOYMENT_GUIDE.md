# 🚀 Complete AWS Free Tier Deployment & CI/CD Guide
### JetFreight Digital Booking Experience Hub (Project Atlas)
**100% Serverless Architecture: AWS S3 + CloudFront + AWS Lambda**

This step-by-step guide walks you through deploying the application to **Amazon Web Services (AWS)** using the **AWS Free Tier**. 

By deploying the backend on **AWS Lambda** (instead of a traditional EC2 virtual machine), you get **forever-free serverless compute** (1 million requests free every month forever), zero server maintenance, no SSH keys, and an automated continuous deployment (CI/CD) pipeline that deploys in seconds whenever you push to GitHub.

---

## 📑 Table of Contents
1. [Why AWS Lambda is Better than EC2 for Free Tier](#1-why-aws-lambda-is-better-than-ec2-for-free-tier)
2. [Architecture Overview & Zero-Cost Breakdown](#2-architecture-overview--zero-cost-breakdown)
3. [Step 1: AWS Account Setup & Billing Guardrails](#step-1-aws-account-setup--billing-guardrails)
4. [Step 2: Deploy Frontend on AWS S3 & CloudFront](#step-2-deploy-frontend-on-aws-s3--cloudfront)
5. [Step 3: Deploy Backend on AWS Lambda (Serverless)](#step-3-deploy-backend-on-aws-lambda-serverless)
6. [Step 4: Create IAM Credentials for GitHub Actions](#step-4-create-iam-credentials-for-github-actions)
7. [Step 5: Configure GitHub Secrets & Push-to-Deploy CI/CD](#step-5-configure-github-secrets--push-to-deploy-cicd)
8. [Step 6: End-to-End Verification Checklist](#step-6-end-to-end-verification-checklist)

---

## 1. Why AWS Lambda is Better than EC2 for Free Tier

| Feature | AWS EC2 Virtual Machine | AWS Lambda (Serverless) | Why Lambda Wins |
|---|---|---|---|
| **Free Tier Duration** | Free for **12 months only** | **FOREVER FREE** | You never get billed after month 12. |
| **Free Usage Limit** | 750 hours/month (`t2.micro`) | **1,000,000 requests/month** | 1 million free API calls every single month. |
| **Server Maintenance** | Ubuntu security patches, SSH keys, PM2 crashes | **Zero maintenance** | AWS manages runtime, OS, scaling & uptime. |
| **HTTPS & SSL** | Must configure Nginx + Let's Encrypt | **Free Built-in HTTPS** | AWS Lambda Function URLs come with SSL automatically. |
| **CI/CD Speed** | 45-60 seconds (SSH, git pull, npm install) | **3-5 seconds** | GitHub Actions updates code in a single command. |
| **Cost When Idle** | Runs 24/7 (can bill if forgotten after 12 mos) | **$0.00** | Only runs for milliseconds when a request arrives. |

---

## 2. Architecture Overview & Zero-Cost Breakdown

```
┌────────────────────────────────────────────────────────────────────────┐
│                          DEVELOPER WORKFLOW                            │
│                                                                        │
│   git add .  ──►  git commit  ──►  git push origin main               │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ triggers
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     GITHUB ACTIONS CI/CD PIPELINE                      │
│                      (.github/workflows/deploy-aws.yml)                │
│                                                                        │
│   Job 1: Frontend Deploy                 Job 2: Backend Deploy         │
│   - pnpm run build (Next.js)             - Zip server/ code            │
│   - Sync client/out to AWS S3            - Update AWS Lambda function  │
│   - Invalidate CloudFront CDN Cache      - Live in ~3 seconds!         │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │ deploys                         │ deploys
                   ▼                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       AWS S3 + CLOUDFRONT (CDN)      │  │          AWS LAMBDA          │
│          Frontend Web App            │  │      Serverless API Engine   │
│                                      │  │                              │
│   - Next.js static production bundle │  │   - Handler: server/lambda.mjs│
│   - Global CDN edge caching (<20ms)  │  │   - Built-in HTTPS & CORS    │
│   - HTTPS with AWS ACM certificate   │  │   - Master consolidated tariffs│
│   - Custom domain supported          │  │   - 1 Million requests free/mo│
└──────────────────────────────────────┘  └──────────────────────────────┘
```

### Free Tier Limits Used:
| Service | Free Tier Allowance | Your Usage | Monthly Cost |
|---|---|---|---|
| **Amazon S3** | 5 GB Standard Storage | ~50 MB static assets | **$0.00** |
| **Amazon CloudFront** | 1 TB Data Transfer Out + 10,000,000 HTTPS requests/month (**Forever Free**) | ~1-5 GB | **$0.00** |
| **AWS Lambda** | 1,000,000 requests/month + 3,200,000 seconds compute (**Forever Free**) | ~10,000 requests/month | **$0.00** |
| **GitHub Actions** | 2,000 build minutes/month for free accounts | ~20 minutes/month | **$0.00** |

---

## Step 1: AWS Account Setup & Billing Guardrails

Before launching any resources, set up a zero-spend budget so AWS immediately alerts you if anything ever exceeds the Free Tier.

### 1.1 Enable Billing Alerts
1. Log into the [AWS Management Console](https://console.aws.amazon.com/).
2. In the top search bar, type **Billing and Cost Management** and select it.
3. In the left navigation menu, click **Preferences** $\rightarrow$ **Billing preferences**.
4. Check both:
   - ✅ **Receive Free Tier Usage Alerts** (enter your email address)
   - ✅ **Receive Billing Alerts**
5. Click **Save preferences**.

### 1.2 Create a $1.00 USD Zero-Spend Budget
1. In the Billing Console left menu, click **Budgets** $\rightarrow$ **Create budget**.
2. Select **Zero spend budget** (or Cost budget with an amount of **$1.00**).
3. Under **Email recipients**, enter your personal email.
4. Click **Create budget**. AWS will automatically notify you if any charge reaches even $0.01!

---

## Step 2: Deploy Frontend on AWS S3 & CloudFront

### 2.1 Create the S3 Bucket
1. Search for **S3** in the AWS console and open it.
2. Click **Create bucket**.
3. **Bucket name**: Choose a unique name, e.g., `jfll-booking-frontend-YOURNAME` (lowercase letters, numbers, hyphens only).
4. **AWS Region**: Select `ap-south-1` (Mumbai) or `us-east-1` (N. Virginia).
5. **Block Public Access**: 
   - Uncheck **Block all public access**.
   - Check the acknowledgement box *"I understand that the bucket will be public"*.
6. Click **Create bucket**.

### 2.2 Configure S3 Static Website Hosting
1. Click your newly created bucket name.
2. Go to the **Properties** tab.
3. Scroll down to the bottom to **Static website hosting** and click **Edit**.
4. Select **Enable**.
5. **Index document**: type `index.html`.
6. **Error document**: type `index.html` (for Single Page App routing).
7. Click **Save changes**.

### 2.3 Set S3 Bucket Policy
1. Go to the **Permissions** tab of your bucket.
2. Under **Bucket policy**, click **Edit**.
3. Paste the following JSON policy (replace `YOUR-BUCKET-NAME` with your actual bucket name):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```
4. Click **Save changes**.

### 2.4 Create CloudFront CDN Distribution (HTTPS & Edge Caching)
1. Search for **CloudFront** in the AWS console and open it.
2. Click **Create distribution**.
3. **Origin domain**: Select your S3 bucket from the dropdown.
4. **Viewer protocol policy**: Select **Redirect HTTP to HTTPS**.
5. **Allowed HTTP methods**: Select `GET, HEAD, OPTIONS`.
6. **Default root object**: Type `index.html`.
7. Scroll down and click **Create distribution**.
8. **Configure SPA Error Pages** (so page reloads work smoothly):
   - Go to your distribution's **Error pages** tab $\rightarrow$ click **Create custom error response**.
   - HTTP error code: `403: Forbidden` $\rightarrow$ Response page path: `/index.html` $\rightarrow$ HTTP Response code: `200: OK`.
   - Create another for `404: Not Found` $\rightarrow$ `/index.html` $\rightarrow$ `200: OK`.
9. Note down your:
   - **Distribution ID** (e.g., `E1A2B3C4D5E6F7`)
   - **Distribution domain name** (e.g., `d12345abcdef.cloudfront.net`)

---

## Step 3: Deploy Backend on AWS Lambda (Serverless)

We have created [`server/lambda.mjs`](./server/lambda.mjs), a zero-dependency, native ESM handler tailored for AWS Lambda.

### 3.1 Create the Lambda Function in AWS Console
1. In the AWS console search bar, type **Lambda** and select **Lambda**.
2. Click **Create function**.
3. Choose **Author from scratch**.
4. **Function name**: `jfll-booking-api`.
5. **Runtime**: Select **Node.js 20.x**.
6. **Architecture**: Select **x86_64** (or `arm64`).
7. Expand **Advanced settings**:
   - Check ✅ **Enable function URL** (this gives you a direct, free HTTPS URL with zero API Gateway setup!).
   - **Auth type**: Select **NONE** (public API).
   - Check ✅ **Configure cross-origin resource sharing (CORS)**.
     - Allow origins: `*`
     - Allow headers: `*`
     - Allow methods: `*`
8. Click **Create function**.
9. Once created, AWS will display your permanent **Function URL**:
   `https://abcdef1234567890.lambda-url.ap-south-1.on.aws/`

### 3.2 Configure Lambda Settings
1. Go to the **Configuration** tab of your function:
   - Click **General configuration** $\rightarrow$ **Edit**.
   - **Memory**: Set to **256 MB** (fast and well within Free Tier).
   - **Timeout**: Set to **15 seconds**.
   - Click **Save**.
2. Under **Runtime settings** (at the bottom of the Code tab):
   - Click **Edit**.
   - **Handler**: Change to `server/lambda.handler` (or `lambda.handler`).
   - Click **Save**.

### 3.3 Initial Code Upload
From your Mac terminal in the project root:
```bash
# Package the server bundle
cd server
zip -r ../lambda-bundle.zip lambda.mjs lib/ data/ package.json
cd ..

# Upload initial zip via AWS CLI (or drag & drop lambda-bundle.zip in Lambda Console -> Upload from -> .zip file)
aws lambda update-function-code \
  --function-name jfll-booking-api \
  --zip-file fileb://lambda-bundle.zip \
  --region ap-south-1
```

### 3.4 Test the Live Lambda API
Open your browser or terminal and test:
```bash
curl https://YOUR_LAMBDA_URL.lambda-url.ap-south-1.on.aws/api/health
```
You will receive:
```json
{
  "status": "ok",
  "service": "Jet Freight Backend API",
  "runtime": "AWS Lambda (Serverless)"
}
```

---

## Step 4: Create IAM Credentials for GitHub Actions

To allow GitHub Actions to automatically update S3, CloudFront, and Lambda on every push, create an IAM user with scoped permissions.

1. In the AWS console search bar, type **IAM** and open IAM.
2. In the left menu, click **Users** $\rightarrow$ **Create user**.
3. **User name**: `github-actions-deployer`. Click **Next**.
4. In **Set permissions**, choose **Attach policies directly**.
5. Click **Create policy** $\rightarrow$ switch to **JSON** tab $\rightarrow$ paste:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3FrontendDeploy",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR-BUCKET-NAME",
        "arn:aws:s3:::YOUR-BUCKET-NAME/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "*"
    },
    {
      "Sid": "LambdaDeploy",
      "Effect": "Allow",
      "Action": [
        "lambda:UpdateFunctionCode",
        "lambda:GetFunction"
      ],
      "Resource": "arn:aws:lambda:*:*:function:jfll-booking-api"
    }
  ]
}
```
*(Replace `YOUR-BUCKET-NAME` with your actual S3 bucket name)*
6. Name the policy `GitHubActionsDeploymentPolicy` and click **Create policy**.
7. Return to the Create user tab, attach `GitHubActionsDeploymentPolicy`, and finish creating the user.
8. Click on `github-actions-deployer` $\rightarrow$ go to **Security credentials** tab $\rightarrow$ **Create access key**.
9. Select **Application running outside AWS** $\rightarrow$ click **Next** $\rightarrow$ **Create access key**.
10. Copy your **Access key ID** and **Secret access key**.

---

## Step 5: Configure GitHub Secrets / Variables & Push-to-Deploy CI/CD

### 5.1 Add Variables or Secrets to Your GitHub Repository
1. On GitHub, go to your repository: `https://github.com/YOUR_USERNAME/jfll-booking-platform`.
2. Click **Settings** $\rightarrow$ left menu **Secrets and variables** $\rightarrow$ **Actions**.
3. You can add them under **Variables** or **Secrets** (the CI/CD workflow automatically detects both!):

| Variable / Secret Name | Example Value | Description |
|---|---|---|
| `AWS_ROLE_ARN` *(Optional - OIDC)* | `arn:aws:iam::123456789012:role/GitHubActionsRole` | IAM Role for Keyless OIDC auth |
| `AWS_ACCESS_KEY_ID` *(If not OIDC)* | `AKIAIOSFODNN7EXAMPLE` | Access Key ID from Step 4 |
| `AWS_SECRET_ACCESS_KEY` *(If not OIDC)* | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | Secret Access Key from Step 4 |
| `AWS_REGION` | `ap-south-1` (Mumbai) or `us-east-1` | AWS Region where resources are |
| `AWS_S3_BUCKET_NAME` | `jfll-booking-frontend-YOURNAME` | Your S3 bucket name |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | `E1A2B3C4D5E6F7` | CloudFront Distribution ID |
| `AWS_LAMBDA_FUNCTION_NAME` | `jfll-booking-api` | Your Lambda Function Name |
| `NEXT_PUBLIC_API_URL` | `https://xxxx.lambda-url.ap-south-1.on.aws` | Your Lambda Function URL |

### 5.2 The CI/CD Pipeline Workflow
The repository includes [`.github/workflows/deploy-aws.yml`](./.github/workflows/deploy-aws.yml).

Every time you run `git push origin main`, GitHub Actions automatically:
1. Runs TypeScript typecheck (`pnpm run typecheck`).
2. Builds the Next.js static production bundle with your Lambda API URL embedded.
3. Syncs static files to S3 and purges the CloudFront edge cache.
4. Packages `server/lambda.mjs`, `lib/`, and `data/` into a zip and updates AWS Lambda in **~3 seconds**!

---

## Step 6: End-to-End Verification Checklist

1. **Commit and Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: serverless AWS Lambda and S3 CloudFront CI/CD"
   git push origin main
   ```
2. **Watch the GitHub Actions Tab**:
   - Both jobs will turn green:
     - ✅ **Build & Deploy Frontend (S3 + CloudFront)**
     - ✅ **Deploy Backend to AWS Lambda**
3. **Verify the Live Application**:
   - Open your CloudFront URL: `https://YOUR_ID.cloudfront.net`
   - Test standard quote (e.g. 240 kg) $\rightarrow$ rate cards load via AWS Lambda!
   - Test heavy cargo quote (e.g. 650 kg) $\rightarrow$ submits spot inquiry to AWS Lambda and receives RFQ reference code!
