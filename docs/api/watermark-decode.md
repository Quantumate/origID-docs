# Detect Watermark

Detect and extract watermark information from audio/video files to verify content authenticity and origID.

## Two-Step Upload Flow

For large files (>4.5MB), use the two-step upload flow to bypass server limits:

```
┌──────────────────────────────────────────────────────────────┐
│                    DETECTION WORKFLOW                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. POST /api/watermark/decode/sign                          │
│     Request: { filename, contentType }                       │
│     Response: { uploadUrl, taskId, fields }                  │
│                                                              │
│  2. POST {uploadUrl} (direct to S3)                          │
│     Send: fields + file as multipart/form-data               │
│     Response: 204 No Content (success)                       │
│                                                              │
│  3. POST /api/watermark/decode/verify                        │
│     Request: { filename }                                    │
│     Response: { hasWatermark, origId, username }             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Step 1: Get Upload URL

### Endpoint

```
POST /api/watermark/decode/sign
```

### Request

```json
{
  "filename": "video.mp4",
  "contentType": "video/mp4"
}
```

### Response

```json
{
  "uploadUrl": "https://ai-authentication.s3.amazonaws.com/",
  "taskId": "5f6f85c22f0b4653ac88e9b9f46c5b83",
  "fields": {
    "x-amz-meta-uuid": "5f6f85c22f0b4653ac88e9b9f46c5b83",
    "key": "DECODER/video.mp4",
    "AWSAccessKeyId": "ASIAQEDQSI34...",
    "x-amz-security-token": "IQoJb3JpZ2lu...",
    "policy": "eyJleHBpcmF0aW9u...",
    "signature": "6AaAEfPmZlvE..."
  }
}
```

---

## Step 2: Upload to S3

Upload your file directly to S3 using the presigned URL and fields.

:::warning Field Order Matters
S3 presigned POST is **strict about field order**. You must:

1. Include all `fields` BEFORE the file
2. The file must be the **last** field in the form data
3. Follow the exact field order below
   :::

**Required Field Order:**

```
1. x-amz-meta-uuid
2. key
3. AWSAccessKeyId
4. x-amz-security-token
5. policy
6. signature
7. file (MUST BE LAST)
```

### cURL

```bash
curl -X POST "https://ai-authentication.s3.amazonaws.com/" \
  -F "x-amz-meta-uuid=5f6f85c22f0b4653ac88e9b9" \
  -F "key=DECODER/video.mp4" \
  -F "AWSAccessKeyId=ASIAQEDQSI34..." \
  -F "x-amz-security-token=IQoJb3JpZ2lu..." \
  -F "policy=eyJleHBpcmF0aW9u..." \
  -F "signature=6AaAEfPmZlvE..." \
  -F "file=@/path/to/video.mp4"
```

---

## Step 3: Verify & Decode

### Endpoint

```
POST /api/watermark/decode/verify
```

### Request

```json
{
  "filename": "video.mp4",
  "contentType": "video/mp4",
  "fileSize": 12345678
}
```

### Response - Watermark Detected

```json
{
  "hasWatermark": true,
  "origId": "606885",
  "username": "JohnDoe",
  "email": "john@example.com"
}
```

### Response - No Watermark

```json
{
  "hasWatermark": false,
  "message": "No watermark detected in this file"
}
```

---

## Filename Rules

:::caution Filename Requirements
Filenames with special characters may cause detection to fail. Sanitize filenames before upload.
:::

**Allowed characters:**

- Letters: `a-z`, `A-Z`
- Numbers: `0-9`
- Underscore: `_`, Hyphen: `-`
- Period: `.` (for extension only)

**Example sanitization:**

```
Adori AI Video (7).mp4  →  Adori_AI_Video_7.mp4
```

---

## Full Example

### JavaScript/TypeScript

```javascript
async function detectWatermark(file) {
  const API_KEY = 'origid_xxxxxxxxxxxxxxxx'
  const BASE_URL = 'https://app.origid.ai'

  // Sanitize filename
  const safeFilename = file.name.replace(/\s+/g, '_').replace(/[()[\]{}]/g, '')

  // Step 1: Get upload URL
  const signRes = await fetch(`${BASE_URL}/api/watermark/decode/sign`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: safeFilename,
      contentType: file.type,
    }),
  })

  const { uploadUrl, fields } = await signRes.json()

  // Step 2: Upload to S3 (specific field order required!)
  const formData = new FormData()

  const fieldOrder = [
    'x-amz-meta-uuid',
    'key',
    'AWSAccessKeyId',
    'x-amz-security-token',
    'policy',
    'signature',
  ]

  fieldOrder.forEach((key) => {
    if (fields[key]) formData.append(key, fields[key])
  })
  formData.append('file', file)

  await fetch(uploadUrl, { method: 'POST', body: formData })

  // Step 3: Verify/decode
  const verifyRes = await fetch(`${BASE_URL}/api/watermark/decode/verify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: safeFilename,
      contentType: file.type,
      fileSize: file.size,
    }),
  })

  return verifyRes.json()
}

// Usage
const result = await detectWatermark(file)
if (result.hasWatermark) {
  console.log('OrigID:', result.origId)
  console.log('Owner:', result.username)
}
```

### Python

```python
import requests

API_KEY = 'origid_xxxxxxxxxxxxxxxx'
BASE_URL = 'https://app.origid.ai'

def detect_watermark(filepath):
    import os
    filename = os.path.basename(filepath)
    # Sanitize filename
    safe_filename = filename.replace(' ', '_').replace('(', '').replace(')', '')

    # Step 1: Get upload URL
    sign_response = requests.post(
        f'{BASE_URL}/api/watermark/decode/sign',
        headers={
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json',
        },
        json={
            'filename': safe_filename,
            'contentType': 'video/mp4',
        }
    )

    data = sign_response.json()
    upload_url = data['uploadUrl']
    fields = data['fields']

    # Step 2: Upload to S3
    with open(filepath, 'rb') as f:
        files = {'file': (safe_filename, f, 'video/mp4')}
        upload_response = requests.post(
            upload_url,
            data=fields,  # Fields first
            files=files,  # File last
        )

    # Step 3: Verify/decode
    verify_response = requests.post(
        f'{BASE_URL}/api/watermark/decode/verify',
        headers={
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json',
        },
        json={
            'filename': safe_filename,
        }
    )

    return verify_response.json()

# Usage
result = detect_watermark('/path/to/video.mp4')
if result['hasWatermark']:
    print(f"OrigID: {result['origId']}")
    print(f"Owner: {result['username']}")
```

---

## Processing Time

Detection is **synchronous** after upload completes:

- **Audio files**: 1-3 seconds
- **Video files**: 3-10 seconds

## Rate Limiting

- **Default limit**: 100 requests per hour per API key
- Detection is **FREE** - does not consume credits

## Notes

:::tip No Polling Required
Unlike encoding, detection returns results immediately after the verify call - no polling needed.
:::

:::info Free Detection
Detecting watermarks is **free** and does not consume account credits.
:::

:::info Upload Response
A successful S3 upload returns `204 No Content` (empty response). This is normal.
:::

## Next Steps

- [Encode Watermark](/api/watermark-sign)
- [Check Encoding Progress](/api/watermark-progress)
- [Download Watermarked File](/api/watermark-download)
