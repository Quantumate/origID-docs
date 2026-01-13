# Authentication

The OrigID API uses **Bearer token authentication**. You must include your API key in the `Authorization` header of every request.

## Getting Your API Key

1. Log in to your OrigID account
2. Navigate to **Settings** → **API Keys** at [http://localhost:3000/settings/api](http://localhost:3000/settings/api)
3. Click **"Create API Key"**
4. Give your key a descriptive name
5. Choose permissions:
   - **All**: Full read and write access
   - **Read Only**: Limited to read operations
6. **Copy your API key immediately** - it will only be shown once!

## Using Your API Key

Include your API key in the `Authorization` header using the Bearer scheme:

### cURL Example

```bash
curl -X POST https://origid.ai/api/generate-video-data \
  -H "Authorization: Bearer origid_xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"idea": "Your video idea"}'
```

### JavaScript/TypeScript Example

```typescript
const response = await fetch('https://origid.ai/api/generate-video-data', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer origid_xxxxxxxxxxxxxxxx',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    idea: 'Your video idea',
    // ... other parameters
  }),
});

const data = await response.json();
```

### Python Example

```python
import requests

headers = {
    'Authorization': 'Bearer origid_xxxxxxxxxxxxxxxx',
    'Content-Type': 'application/json',
}

data = {
    'idea': 'Your video idea',
    # ... other parameters
}

response = requests.post(
    'https://origid.ai/api/generate-video-data',
    headers=headers,
    json=data
)

result = response.json()
```

## API Key Format

OrigID API keys follow this format:

```
origid_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- **Prefix**: `origid_`
- **Key**: Random alphanumeric string

## Security Best Practices

:::danger Keep Your API Key Secret
Never expose your API key in client-side code, public repositories, or logs.
:::

1. **Store Securely**: Keep API keys in environment variables or secure vaults
2. **Rotate Regularly**: Create new keys and delete old ones periodically
3. **Use Read-Only Keys**: When possible, use read-only permissions
4. **Monitor Usage**: Check your API key usage in the Settings page
5. **Delete Unused Keys**: Remove keys that are no longer needed

## Rate Limiting

API keys are rate-limited to prevent abuse:

- **Default Limit**: 1000 requests per hour
- **Rate Limit Headers**: Check response headers for limit information:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

When rate limited, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": {
    "message": "Rate limit exceeded",
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

## Error Responses

### 401 Unauthorized

Missing or invalid API key:

```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}
```

### 403 Forbidden

Insufficient permissions:

```json
{
  "error": "Forbidden",
  "message": "API key does not have permission for this operation"
}
```

## Managing API Keys

### Viewing Keys

You can view all your API keys in the Settings page. For security, only the first few characters of each key are displayed.

### Deleting Keys

To revoke an API key:
1. Go to **Settings** → **API Keys**
2. Click the delete icon next to the key
3. Confirm deletion

:::warning Immediate Effect
Deleting an API key takes effect immediately. Any requests using that key will fail.
:::

### Permissions

API keys support granular permissions:

| Permission | Access Level | Description |
|------------|--------------|-------------|
| **All** | Read & Write | Full access to all resources |
| **Read Only** | Read | View-only access to resources |

You can view and modify key permissions in the Settings page.

