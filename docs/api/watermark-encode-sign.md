# Encode Watermark

Request a presigned URL to upload your audio/video files directly to storage. This is the first step of the watermarking workflow.

## Endpoint

```
POST /api/watermark/encode/sign
```

## Authentication

**Required**: Bearer token (API key)

```bash
Authorization: Bearer origid_xxxxxxxxxxxxxxxx
```

## Request

### Headers

| Header          | Value              | Required |
| --------------- | ------------------ | -------- |
| `Authorization` | `Bearer {api_key}` | Yes      |
| `Content-Type`  | `application/json` | Yes      |

### Body Parameters

Send as JSON:

| Parameter     | Type   | Description                                      | Required |
| ------------- | ------ | ------------------------------------------------ | -------- |
| `filename`    | string | Filename including extension (e.g., `video.mp4`) | Yes      |
| `contentType` | string | MIME type (e.g., `video/mp4`)                    | No       |

### Supported File Types

- **Audio**: `.wav`, `.mp3`, `.m4a`, `.flac`
- **Video**: `.mp4`, `.mov`, `.avi`, `.mkv`

### Filename Rules

:::caution Filename Requirements
Filenames with special characters may cause the watermarking to fail silently. For best results, sanitize filenames before upload.
:::

**Allowed characters:**

- Letters: `a-z`, `A-Z`
- Numbers: `0-9`
- Underscore: `_`
- Hyphen: `-`
- Period: `.` (for extension only)

**Characters to avoid:**

- Spaces (replace with `_`)
- Parentheses: `()`, `[]`, `{}`
- Special characters: `@`, `#`, `$`, `%`, `&`, `*`, etc.

**Example sanitization:**

```
Adori AI Video (7).mp4  →  Adori_AI_Video_7.mp4
My File [Final].mp3    →  My_File_Final.mp3
```

**JavaScript sanitization function:**

```javascript
function sanitizeFilename(filename) {
  const lastDot = filename.lastIndexOf('.')
  const name = lastDot > 0 ? filename.substring(0, lastDot) : filename
  const ext = lastDot > 0 ? filename.substring(lastDot) : ''

  const sanitized = name
    .replace(/\s+/g, '_') // Spaces → underscores
    .replace(/[()[\]{}]/g, '') // Remove brackets
    .replace(/[^a-zA-Z0-9_-]/g, '_') // Other special chars → underscore
    .replace(/_+/g, '_') // Collapse multiple underscores
    .replace(/^_|_$/g, '') // Remove leading/trailing

  return sanitized + ext
}
```

## Response

### Success Response (200 OK)

```json
{
  "uploadUrl": "https://ai-authentication.s3.amazonaws.com/",
  "taskId": "5f6f85c22f0b4653ac88e9b9f46c5b83",
  "fields": {
    "x-amz-meta-uuid": "5f6f85c22f0b4653ac88e9b9f46c5b83",
    "x-amz-meta-origid": "507819",
    "key": "IN/video.mp4",
    "AWSAccessKeyId": "ASIAQEDQSI34...",
    "x-amz-security-token": "IQoJb3JpZ2lu...",
    "policy": "eyJleHBpcmF0aW9u...",
    "signature": "6AaAEfPmZlvE..."
  },
  "instructions": "POST multipart/form-data to uploadUrl with fields FIRST, then file LAST"
}
```

| Field       | Type   | Description                         |
| ----------- | ------ | ----------------------------------- |
| `uploadUrl` | string | S3 URL to upload your file          |
| `taskId`    | string | Unique identifier to track your job |
| `fields`    | object | Form fields to include with upload  |

### Error Responses

#### 400 Bad Request

```json
{
  "error": "filename is required"
}
```

#### 401 Unauthorized

```json
{
  "error": "Authentication required"
}
```

## Uploading After Getting the URL

After receiving the response, upload your file directly to S3 using **multipart/form-data**:

:::warning Field Order Matters
S3 presigned POST is **strict about field order**. You must:

1. Include all `fields` BEFORE the file
2. The file must be the **last** field in the form data
3. Follow the exact field order below
   :::

**Required Field Order:**

```
1. x-amz-meta-uuid
2. x-amz-meta-origid
3. key
4. AWSAccessKeyId
5. x-amz-security-token
6. policy
7. signature
8. file (MUST BE LAST)
```

:::tip Why Order Matters
S3 validates the `policy` signature against the form data. If fields are in the wrong order, the upload may succeed (204) but the file may not be processed correctly by the Lambda trigger.
:::

### cURL

```bash
curl -X POST "https://ai-authentication.s3.amazonaws.com/" \
  -F "x-amz-meta-uuid=5f6f85c22f0b4653ac88e9b9f46c5b83" \
  -F "x-amz-meta-origid=507819" \
  -F "key=IN/video.mp4" \
  -F "AWSAccessKeyId=ASIAQEDQSI34..." \
  -F "x-amz-security-token=IQoJb3JpZ2lu..." \
  -F "policy=eyJleHBpcmF0aW9u..." \
  -F "signature=6AaAEfPmZlvE..." \
  -F "file=@/path/to/video.mp4"
```

### JavaScript/TypeScript

```javascript
// Step 1: Get upload URL
const signResponse = await fetch('https://app.origid.ai/api/watermark/encode/sign', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer origid_xxxxxxxxxxxxxxxx',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    filename: 'video.mp4',
    contentType: 'video/mp4',
  }),
})

const { uploadUrl, taskId, fields } = await signResponse.json()

// Step 2: Upload file directly to S3
const formData = new FormData()

// Add all fields FIRST (order matters!)
Object.entries(fields).forEach(([key, value]) => {
  formData.append(key, value)
})

// Add file LAST
formData.append('file', file)

const uploadResponse = await fetch(uploadUrl, {
  method: 'POST',
  body: formData,
})

if (uploadResponse.status === 204) {
  console.log('Upload successful! Task ID:', taskId)
}
```

### Python

```python
import requests

# Step 1: Get upload URL
headers = {
    'Authorization': 'Bearer origid_xxxxxxxxxxxxxxxx',
    'Content-Type': 'application/json',
}

sign_response = requests.post(
    'https://app.origid.ai/api/watermark/encode/sign',
    headers=headers,
    json={
        'filename': 'video.mp4',
        'contentType': 'video/mp4',
    }
)

data = sign_response.json()
upload_url = data['uploadUrl']
task_id = data['taskId']
fields = data['fields']

# Step 2: Upload file directly to S3
with open('/path/to/video.mp4', 'rb') as f:
    files = {'file': ('video.mp4', f, 'video/mp4')}
    upload_response = requests.post(
        upload_url,
        data=fields,  # Fields first
        files=files,  # File last
    )

if upload_response.status_code == 204:
    print(f'Upload successful! Task ID: {task_id}')
```

## Complete Workflow

After uploading, watermarking starts automatically. Here's the full flow:

```
┌──────────────────────────────────────────────────────────────┐
│                    WATERMARKING WORKFLOW                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. POST /api/watermark/encode/sign                          │
│     Request: { filename, contentType }                       │
│     Response: { uploadUrl, taskId, fields }                  │
│                                                              │
│  2. POST {uploadUrl} (direct to S3)                          │
│     Send: fields + file as multipart/form-data               │
│     Response: 204 No Content (success)                       │
│                                                              │
│  3. GET /api/watermark/progress/{taskId}?filename=...        │
│     Poll until progressPercentage = 100                      │
│                                                              │
│  4. GET /api/watermark/download/{taskId}?filename=...        │
│     Download your watermarked file                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Full Example

```javascript
async function watermarkFile(file) {
  const API_KEY = 'origid_xxxxxxxxxxxxxxxx'
  const BASE_URL = 'https://app.origid.ai'

  // Step 1: Get upload URL
  console.log('Getting upload URL...')
  const signRes = await fetch(`${BASE_URL}/api/watermark/encode/sign`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
    }),
  })

  const { uploadUrl, taskId, fields } = await signRes.json()

  // Step 2: Upload to S3
  console.log('Uploading file...')
  const formData = new FormData()
  Object.entries(fields).forEach(([k, v]) => formData.append(k, v))
  formData.append('file', file)

  await fetch(uploadUrl, { method: 'POST', body: formData })
  console.log('Upload complete!')

  // Step 3: Poll for progress
  console.log('Processing...')
  let progress = 0
  while (progress < 100) {
    await new Promise((r) => setTimeout(r, 2000))
    const res = await fetch(`${BASE_URL}/api/watermark/progress/${taskId}?filename=${file.name}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })
    const data = await res.json()
    progress = data.progressPercentage
    console.log(`Progress: ${progress}%`)
  }

  // Step 4: Download
  console.log('Downloading watermarked file...')
  const downloadUrl = `${BASE_URL}/api/watermark/download/${taskId}?filename=${file.name}`
  window.location.href = downloadUrl
}
```

## Security

:::info Credentials Are Safe
The `fields` object contains temporary credentials that:

- Expire in ~1 hour
- Can only upload to your specific file path
- Cannot read, list, or delete other files

This is industry-standard practice used by AWS, Dropbox, and other major providers.
:::

## Rate Limiting

- **Default limit**: 100 requests per hour per API key
- **Concurrent uploads**: No limit on file size or upload duration

## Notes

:::tip No File Size Limit
Unlike traditional uploads, direct-to-S3 uploads have no timeout or size limit. Upload files of any size without interruption.
:::

:::info Upload Response
A successful S3 upload returns `204 No Content` (empty response). This is normal and means success.
:::

## Next Steps

- [Check Encoding Progress](/api/watermark-progress)
- [Download Watermarked File](/api/watermark-download)
- [Decode Watermark](/api/watermark-decode)
