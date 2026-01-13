# Check Encoding Progress

Poll the encoding progress of your watermark job to know when it's complete and ready for download.

## Endpoint

```
GET /api/watermark/progress/{task_id}
```

## Authentication

**Required**: Bearer token (API key)

```bash
Authorization: Bearer origid_xxxxxxxxxxxxxxxx
```

## Request

### URL Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `task_id` | string | Task ID returned from the encode endpoint | Yes |

### Query Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `filename` | string | Original filename (used to generate download URL) | No |

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {api_key}` | Yes |

## Response

### In Progress (200 OK)

```json
{
  "progressPercentage": 45,
  "downloadUrl": null
}
```

### Complete (200 OK)

```json
{
  "progressPercentage": 100,
  "downloadUrl": "/api/watermark/download/9171cdcb49e640c5b2d6d22d04456f7a?filename=audio.wav"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `progressPercentage` | number | Encoding progress (0-100) |
| `downloadUrl` | string \| null | Download URL (available when progress reaches 100%) |

### Progress States

| Progress | Status | Description |
|----------|--------|-------------|
| `0` | Queued | Job is in queue, not started yet |
| `1-99` | Processing | File is being watermarked |
| `100` | Complete | Watermarking complete, ready for download |

### Error Responses

#### 400 Bad Request
```json
{
  "error": "UUID is required"
}
```

#### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

#### 404 Not Found
```json
{
  "error": "Task not found"
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
# Poll for progress
curl -X GET "https://origid.ai/api/watermark/progress/9171cdcb49e640c5b2d6d22d04456f7a?filename=audio.wav" \
  -H "Authorization: Bearer origid_xxxxxxxxxxxxxxxx"
```

### JavaScript/TypeScript - Basic Polling

```javascript
async function checkProgress(taskId, filename) {
  const response = await fetch(
    `https://origid.ai/api/watermark/progress/${taskId}?filename=${encodeURIComponent(filename)}`,
    {
      headers: {
        'Authorization': 'Bearer origid_xxxxxxxxxxxxxxxx',
      },
    }
  );

  const data = await response.json();
  console.log(`Progress: ${data.progressPercentage}%`);
  
  return data;
}
```

### JavaScript/TypeScript - Advanced Polling with Callback

```javascript
async function pollUntilComplete(taskId, filename, onProgress) {
  const poll = async () => {
    const response = await fetch(
      `https://origid.ai/api/watermark/progress/${taskId}?filename=${encodeURIComponent(filename)}`,
      {
        headers: {
          'Authorization': 'Bearer origid_xxxxxxxxxxxxxxxx',
        },
      }
    );

    const data = await response.json();
    
    // Callback with progress update
    if (onProgress) {
      onProgress(data.progressPercentage);
    }

    if (data.progressPercentage >= 100) {
      return data.downloadUrl;
    }

    // Poll again after 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    return poll();
  };

  return poll();
}

// Usage
const downloadUrl = await pollUntilComplete(
  '9171cdcb49e640c5b2d6d22d04456f7a',
  'audio.wav',
  (progress) => console.log(`Progress: ${progress}%`)
);

console.log('Complete! Download URL:', downloadUrl);
```

### Python - Polling with Progress Updates

```python
import requests
import time

def poll_until_complete(task_id, filename, api_key):
    """
    Poll encoding progress until complete
    """
    headers = {
        'Authorization': f'Bearer {api_key}',
    }
    
    url = f'https://origid.ai/api/watermark/progress/{task_id}'
    params = {'filename': filename}
    
    while True:
        response = requests.get(url, headers=headers, params=params)
        data = response.json()
        
        progress = data['progressPercentage']
        print(f'Progress: {progress}%')
        
        if progress >= 100:
            return data['downloadUrl']
        
        # Wait 2 seconds before next poll
        time.sleep(2)

# Usage
download_url = poll_until_complete(
    '9171cdcb49e640c5b2d6d22d04456f7a',
    'audio.wav',
    'origid_xxxxxxxxxxxxxxxx'
)

print(f'Complete! Download URL: {download_url}')
```

## Polling Best Practices

### Recommended Polling Interval

- **Fast jobs** (< 5 min audio): Poll every **2 seconds**
- **Medium jobs** (5-15 min): Poll every **3 seconds**
- **Long jobs** (> 15 min): Poll every **5 seconds**

### Exponential Backoff

For better efficiency, implement exponential backoff:

```javascript
async function pollWithBackoff(taskId, filename) {
  let interval = 2000; // Start with 2 seconds
  const maxInterval = 10000; // Max 10 seconds
  
  while (true) {
    const data = await checkProgress(taskId, filename);
    
    if (data.progressPercentage >= 100) {
      return data.downloadUrl;
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
    
    // Increase interval (exponential backoff)
    interval = Math.min(interval * 1.5, maxInterval);
  }
}
```

### Timeout Handling

Always implement timeout to avoid infinite polling:

```javascript
async function pollWithTimeout(taskId, filename, timeoutMs = 300000) { // 5 min timeout
  const startTime = Date.now();
  
  while (true) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error('Encoding timeout - please try again or contact support');
    }
    
    const data = await checkProgress(taskId, filename);
    
    if (data.progressPercentage >= 100) {
      return data.downloadUrl;
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
```

## Rate Limiting

- **Polling frequency**: No explicit limit, but follow recommended intervals
- **Concurrent checks**: No limit on checking multiple tasks

## Notes

:::tip Polling Intervals
Don't poll too frequently (< 1 second). The encoding backend updates progress every 1-2 seconds, so faster polling won't get updates sooner.
:::

:::info Download URL
The `downloadUrl` is a relative URL to our download proxy. Prepend your domain to create the full URL, or use it directly if making requests from the same domain.
:::

:::warning Task Expiration
Task IDs expire after **7 days**. Download your watermarked files before expiration.
:::

## Workflow Example

Complete encoding workflow from start to finish:

```javascript
async function watermarkFile(file) {
  // Step 1: Upload file for encoding
  const formData = new FormData();
  formData.append('file', file);
  
  const encodeResponse = await fetch('/api/watermark/encode', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer origid_xxxxxxxxxxxxxxxx',
    },
    body: formData,
  });
  
  const { task_id } = await encodeResponse.json();
  console.log('Task ID:', task_id);
  
  // Step 2: Poll for progress
  const downloadUrl = await pollUntilComplete(
    task_id,
    file.name,
    (progress) => console.log(`Progress: ${progress}%`)
  );
  
  // Step 3: Download the watermarked file
  const watermarkedFile = await fetch(downloadUrl, {
    headers: {
      'Authorization': 'Bearer origid_xxxxxxxxxxxxxxxx',
    },
  });
  
  const blob = await watermarkedFile.blob();
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `watermarked_${file.name}`;
  a.click();
}
```

## Next Steps

- [Download Watermarked File](/api/watermark-download)
- [Encode Watermark](/api/watermark-encode)
- [Decode Watermark](/api/watermark-decode)
