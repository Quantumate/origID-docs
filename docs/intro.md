---
slug: /
title: Introduction
---

# Welcome to OrigID API

Protect and verify your audio/video content with **OrigID's Watermarking API**. Add invisible watermarks for content authenticity and provenance tracking.

## Getting Started

To use the OrigID API, you'll need:

1. **API Key**: Generate an API key from your [OrigID Settings](http://localhost:3000/settings/api)
2. **Base URL**: `https://origid.ai` (or `http://localhost:3000` for development)
3. **Authentication**: Include your API key in the `Authorization` header

## Quick Example

### Watermark a File

```bash
curl -X POST https://origid.ai/api/watermark/encode \
  -H "Authorization: Bearer origid_xxxxxxxxxxxxxxxx" \
  -F "file=@/path/to/audio.wav"
```

### Decode a Watermark

```bash
curl -X POST https://origid.ai/api/watermark/decode \
  -H "Authorization: Bearer origid_xxxxxxxxxxxxxxxx" \
  -F "file=@/path/to/watermarked_audio.wav"
```

## Core Concepts

### Watermarking Workflow

1. **Upload File**: Send your audio/video file to `/api/watermark/encode`
2. **Get Task ID**: Receive a `task_id` to track encoding progress
3. **Poll Progress**: Check encoding status at `/api/watermark/progress/{task_id}`
4. **Download**: Get your watermarked file from `/api/watermark/download/{task_id}`

### Decoding Workflow

1. **Upload File**: Send a watermarked file to `/api/watermark/decode`
2. **Get Results**: Instantly receive the OrigID and owner information

### Authentication

All API requests must include your API key in the Authorization header:

```
Authorization: Bearer origid_xxxxxxxxxxxxxxxx
```

Learn more in the [Authentication](/authentication) section.

## Supported File Types

- **Audio**: WAV, MP3, M4A, FLAC
- **Video**: MP4, MOV, AVI, MKV

## Pricing

- **Encoding**: 1 credit = 1 minute of encoding
- **Decoding**: FREE (no credits consumed)

## What's Next?

- [Authentication](/authentication) - Learn how to authenticate your requests
- [Encode Watermark](/api/watermark-encode) - Add watermarks to files
- [Decode Watermark](/api/watermark-decode) - Verify content authenticity
- [Check Progress](/api/watermark-progress) - Monitor encoding status
- [Download File](/api/watermark-download) - Get watermarked files
