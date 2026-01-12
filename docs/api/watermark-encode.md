# Encode Watermark

Watermark your audio/video files with a unique OrigID for content authenticity and provenance tracking.

## Endpoint

```
POST /api/watermark/encode
```

## Authentication

**Required**: Bearer token (API key)

```bash
Authorization: Bearer origid_xxxxxxxxxxxxxxxx
```

## Request

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {api_key}` | Yes |
| `Content-Type` | `multipart/form-data` | Yes |

### Body Parameters

Send as `multipart/form-data`:

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `file` | File | Audio or video file to watermark | Yes |

### Supported File Types

- **Audio**: `.wav`, `.mp3`, `.m4a`, `.flac`
- **Video**: `.mp4`, `.mov`, `.avi`, `.mkv`

### File Size Limits

- Maximum file size: **500MB**

## Response

### Success Response (200 OK)

```json
{
  "task_id": "9171cdcb49e640c5b2d6d22d04456f7a"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `task_id` | string | Unique identifier for tracking the encoding progress |

### Error Responses

#### 400 Bad Request
```json
{
  "error": "File is required"
}
```

#### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Watermark service not configured"
}
```

## Usage Examples

### cURL

```bash
curl -X POST https://your-domain.com/api/watermark/encode \
  -H "Authorization: Bearer origid_xxxxxxxxxxxxxxxx" \
  -F "file=@/path/to/audio.wav"
```

### JavaScript/TypeScript

```javascript
const file = document.querySelector('input[type="file"]').files[0];
const formData = new FormData();
formData.append('file', file);

const response = await fetch('https://your-domain.com/api/watermark/encode', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer origid_xxxxxxxxxxxxxxxx',
  },
  body: formData,
});

const data = await response.json();
console.log('Task ID:', data.task_id);
```

### Python

```python
import requests

headers = {
    'Authorization': 'Bearer origid_xxxxxxxxxxxxxxxx',
}

files = {
    'file': open('/path/to/audio.wav', 'rb'),
}

response = requests.post(
    'https://your-domain.com/api/watermark/encode',
    headers=headers,
    files=files
)

result = response.json()
print(f"Task ID: {result['task_id']}")
```

## Workflow

After uploading a file for encoding:

1. **Upload File** → Receive `task_id`
2. **Poll Progress** → Use [`GET /api/watermark/progress/{task_id}`](/api/watermark-progress) to check encoding status
3. **Download Result** → When progress reaches 100%, download the watermarked file

## Processing Time

Encoding time depends on file size and duration:

- **Audio files**: ~5-10 seconds per minute of audio
- **Video files**: ~30-60 seconds per minute of video

## Rate Limiting

- **Default limit**: 100 requests per hour per API key
- **Concurrent jobs**: Maximum 5 active encoding jobs per account

## Notes

:::tip Asynchronous Processing
Encoding is processed asynchronously. You'll receive a `task_id` immediately, then poll for progress using the Progress endpoint.
:::

:::info File Retention
Processed files are retained for **7 days** after completion. Download them within this period.
:::

:::warning Original Quality
The watermarking process preserves the original quality of your audio/video files. The watermark is imperceptible to human perception.
:::

## Next Steps

- [Check Encoding Progress](/api/watermark-progress)
- [Download Watermarked File](/api/watermark-download)
- [Decode Watermark](/api/watermark-decode)
