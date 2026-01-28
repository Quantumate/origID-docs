# Decode Watermark

Detect and extract watermark information from audio/video files to verify content authenticity and origID.

## Endpoint

```
POST /api/watermark/decode
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
| `file` | File | Watermarked audio or video file to analyze | Yes |

### Supported File Types

- **Audio**: `.wav`, `.mp3`, `.m4a`, `.flac`
- **Video**: `.mp4`, `.mov`, `.avi`, `.mkv`

### File Size Limits

- Maximum file size: **500MB**

## Response

### Success Response - Watermark Detected (200 OK)

```json
{
  "hasWatermark": true,
  "origId": "606885",
  "username": "Revolver"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `hasWatermark` | boolean | Whether a watermark was detected |
| `origId` | string | The OrigID embedded in the watermark |
| `username` | string | Username associated with the OrigID |

### Success Response - No Watermark (200 OK)

```json
{
  "hasWatermark": false,
  "message": "No watermark detected in this file"
}
```

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
  "error": "Decoder service not configured"
}
```

## Usage Examples

### cURL

```bash
curl -X POST https://app.origid.ai/api/watermark/decode \
  -H "Authorization: Bearer origid_xxxxxxxxxxxxxxxx" \
  -F "file=@/path/to/watermarked_audio.wav"
```

### JavaScript/TypeScript

```javascript
const file = document.querySelector('input[type="file"]').files[0];
const formData = new FormData();
formData.append('file', file);

const response = await fetch('https://app.origid.ai/api/watermark/decode', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer origid_xxxxxxxxxxxxxxxx',
  },
  body: formData,
});

const data = await response.json();

if (data.hasWatermark) {
  console.log('OrigID:', data.origId);
  console.log('Owner:', data.username);
} else {
  console.log('No watermark detected');
}
```

### Python

```python
import requests

headers = {
    'Authorization': 'Bearer origid_xxxxxxxxxxxxxxxx',
}

files = {
    'file': open('/path/to/watermarked_audio.wav', 'rb'),
}

response = requests.post(
    'https://app.origid.ai/api/watermark/decode',
    headers=headers,
    files=files
)

result = response.json()

if result['hasWatermark']:
    print(f"OrigID: {result['origId']}")
    print(f"Owner: {result['username']}")
else:
    print("No watermark detected")
```

## Processing Time

Decoding is **synchronous** and typically completes in:

- **Audio files**: 1-3 seconds
- **Video files**: 3-10 seconds

## Detection Accuracy

- **Watermarked files**: 99.9% detection rate
- **Non-watermarked files**: Accurately identified as unwatermarked
- **Tampered files**: May detect watermark with reduced confidence

## Rate Limiting

- **Default limit**: 100 requests per hour per API key
- Decoding is **FREE** - does not consume credits

## Use Cases

### Content Verification
Verify that content originated from a specific creator:

```javascript
async function verifyContent(file, expectedOrigId) {
  const result = await decodeWatermark(file);
  
  if (!result.hasWatermark) {
    return { verified: false, reason: 'No watermark found' };
  }
  
  if (result.origId !== expectedOrigId) {
    return { verified: false, reason: 'OrigID mismatch' };
  }
  
  return { verified: true, owner: result.username };
}
```

### Content Provenance
Track content distribution and detect unauthorized use:

```javascript
async function trackContentProvenance(file) {
  const result = await decodeWatermark(file);
  
  if (result.hasWatermark) {
    // Log provenance information
    logProvenance({
      origId: result.origId,
      owner: result.username,
      timestamp: new Date(),
      source: 'user_upload'
    });
  }
  
  return result;
}
```

## Notes

:::tip Instant Results
Unlike encoding, decoding is synchronous and returns results immediately without polling.
:::

:::info Free Decoding
Decoding watermarks is **free** and does not consume account credits. Only encoding (watermarking) consumes credits.
:::

:::warning File Handling
The uploaded file is temporarily stored for decoding and deleted immediately after processing. We never retain your decoded files.
:::

## Next Steps

- [Encode Watermark](/api/watermark-encode)
- [Check Encoding Progress](/api/watermark-progress)
- [Download Watermarked File](/api/watermark-download)
