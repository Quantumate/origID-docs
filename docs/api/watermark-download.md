# Download Watermarked File

Download your watermarked audio/video file after encoding is complete.

## Endpoint

```
GET /api/watermark/download/{task_id}
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
| `task_id` | string | Task ID from the encode endpoint | Yes |

### Query Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `filename` | string | Original filename (determines output filename) | Yes |

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {api_key}` | Yes |

## Response

### Success (200 OK)

Returns the watermarked file as a binary stream with appropriate headers:

**Headers:**
- `Content-Type`: Original file MIME type (e.g., `audio/wav`, `video/mp4`)
- `Content-Disposition`: `attachment; filename="filename_wm.ext"`
- `Content-Length`: File size in bytes

**Body:** Binary file content

### Output Filename Format

The watermarked file is named with a `_wm` suffix:

- Input: `audio.wav` → Output: `audio_wm.wav`
- Input: `video.mp4` → Output: `video_wm.mp4`

### Error Responses

#### 400 Bad Request
```json
{
  "error": "Filename is required"
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
  "error": "File not found or encoding not complete"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to download file from storage"
}
```

## Usage Examples

### cURL

```bash
curl -X GET "https://origid.ai/api/watermark/download/9171cdcb49e640c5b2d6d22d04456f7a?filename=audio.wav" \
  -H "Authorization: Bearer origid_xxxxxxxxxxxxxxxx" \
  --output audio_wm.wav
```

### JavaScript/TypeScript - Download to Browser

```javascript
async function downloadWatermarkedFile(taskId, filename) {
  const response = await fetch(
    `https://origid.ai/api/watermark/download/${taskId}?filename=${encodeURIComponent(filename)}`,
    {
      headers: {
        'Authorization': 'Bearer origid_xxxxxxxxxxxxxxxx',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Download failed');
  }

  // Get the file as a blob
  const blob = await response.blob();

  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename.split('.')[0]}_wm.${filename.split('.').pop()}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Usage
await downloadWatermarkedFile('9171cdcb49e640c5b2d6d22d04456f7a', 'audio.wav');
```

### JavaScript/TypeScript - Save to Variable

```javascript
async function getWatermarkedBlob(taskId, filename) {
  const response = await fetch(
    `https://origid.ai/api/watermark/download/${taskId}?filename=${encodeURIComponent(filename)}`,
    {
      headers: {
        'Authorization': 'Bearer origid_xxxxxxxxxxxxxxxx',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Download failed');
  }

  return await response.blob();
}

// Usage
const watermarkedFile = await getWatermarkedBlob('9171cdcb49e640c5b2d6d22d04456f7a', 'audio.wav');
console.log('File size:', watermarkedFile.size, 'bytes');
```

### Python - Download to File

```python
import requests

def download_watermarked_file(task_id, filename, output_path, api_key):
    """
    Download watermarked file to disk
    """
    headers = {
        'Authorization': f'Bearer {api_key}',
    }
    
    params = {'filename': filename}
    url = f'https://origid.ai/api/watermark/download/{task_id}'
    
    response = requests.get(url, headers=headers, params=params, stream=True)
    
    if response.status_code != 200:
        raise Exception(f'Download failed: {response.json().get("error")}')
    
    # Save to file
    with open(output_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    print(f'Downloaded to: {output_path}')

# Usage
download_watermarked_file(
    '9171cdcb49e640c5b2d6d22d04456f7a',
    'audio.wav',
    'audio_wm.wav',
    'origid_xxxxxxxxxxxxxxxx'
)
```

### Node.js - Download to File

```javascript
import fs from 'fs';
import fetch from 'node-fetch';

async function downloadToFile(taskId, filename, outputPath) {
  const response = await fetch(
    `https://origid.ai/api/watermark/download/${taskId}?filename=${encodeURIComponent(filename)}`,
    {
      headers: {
        'Authorization': 'Bearer origid_xxxxxxxxxxxxxxxx',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Download failed');
  }

  const fileStream = fs.createWriteStream(outputPath);
  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on('error', reject);
    fileStream.on('finish', resolve);
  });

  console.log(`Downloaded to: ${outputPath}`);
}

// Usage
await downloadToFile('9171cdcb49e640c5b2d6d22d04456f7a', 'audio.wav', 'audio_wm.wav');
```

## File Availability

### Retention Period

- Watermarked files are retained for **7 days** after encoding completion
- After 7 days, files are automatically deleted
- Download files within this period

### Storage Location

Files are securely stored on AWS S3 with:
- Server-side encryption
- Restricted access (only accessible via authenticated API)
- Automatic expiration after retention period

## Complete Workflow

Full watermarking workflow from upload to download:

```javascript
async function completeWatermarkWorkflow(file) {
  try {
    // Step 1: Upload for encoding
    console.log('Uploading file...');
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
    console.log('Waiting for encoding...');
    let progress = 0;
    let downloadUrl;
    
    while (progress < 100) {
      const progressResponse = await fetch(
        `/api/watermark/progress/${task_id}?filename=${file.name}`,
        {
          headers: {
            'Authorization': 'Bearer origid_xxxxxxxxxxxxxxxx',
          },
        }
      );
      
      const data = await progressResponse.json();
      progress = data.progressPercentage;
      downloadUrl = data.downloadUrl;
      
      console.log(`Progress: ${progress}%`);
      
      if (progress < 100) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Step 3: Download watermarked file
    console.log('Downloading watermarked file...');
    const downloadResponse = await fetch(downloadUrl, {
      headers: {
        'Authorization': 'Bearer origid_xxxxxxxxxxxxxxxx',
      },
    });
    
    const blob = await downloadResponse.blob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `watermarked_${file.name}`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('Complete!');
  } catch (error) {
    console.error('Watermarking failed:', error);
  }
}
```

## Rate Limiting

- **No limit** on download requests
- **Concurrent downloads**: No restriction

## Notes

:::tip Download URL Format
The download URL returned from the progress endpoint is a relative path. You can use it directly if making requests from the same domain, or prepend your domain for external requests.
:::

:::info File Quality
The watermarked file maintains the original quality and format of your input file. The watermark is imperceptible and does not affect playback.
:::

:::warning Secure Downloads
Always use HTTPS for downloads to ensure file integrity and security during transfer.
:::

## Next Steps

- [Encode Watermark](/api/watermark-encode)
- [Check Encoding Progress](/api/watermark-progress)
- [Decode Watermark](/api/watermark-decode)
