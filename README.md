# OrigID API Documentation

This folder contains the API documentation for OrigID built with [Docusaurus](https://docusaurus.io/).

## Development

Start the development server:

```bash
cd docs
npm start
```

The documentation will be available at **http://localhost:3001**

## Build for Production

Build static files:

```bash
cd docs
npm run build
```

The built files will be in the `build/` directory.

## Deployment to docs.origid.com

This documentation is designed to be deployed as a separate project on a subdomain.

### Option 1: Move to Separate Repository

1. Create a new repository for documentation
2. Copy this entire `docs` folder to the new repository
3. Update the `docusaurus.config.ts`:
   - Set `url` to `https://docs.origid.com`
   - Update organization and project name
4. Deploy using your preferred hosting service

### Option 2: Deploy from Current Monorepo

Keep the docs in this folder and deploy to a subdomain using:

- **Vercel**: Deploy the `docs` folder as a separate project
- **Netlify**: Configure to build from the `docs` directory
- **GitHub Pages**: Use the `npm run deploy` command (requires configuration)

### Deployment Configuration

Update `docusaurus.config.ts` before deploying:

```typescript
const config: Config = {
  url: 'https://docs.origid.com',  // Your docs subdomain
  baseUrl: '/',
  organizationName: 'your-org',
  projectName: 'origid-api-docs',
  // ...
};
```

## Documentation Structure

```
docs/
├── docs/                    # Documentation pages
│   ├── intro.md            # Introduction
│   ├── authentication.md   # Authentication guide
│   └── api/                # API endpoints
│       ├── generate-video-data.md
│       └── video-data-status.md
├── src/                    # React components & custom pages
├── static/                 # Static assets
├── docusaurus.config.ts    # Docusaurus configuration
└── sidebars.ts            # Sidebar navigation
```

## Adding New API Endpoints

1. Create a new markdown file in `docs/api/`
2. Add the endpoint to `sidebars.ts`
3. Follow the existing format with:
   - Endpoint description
   - Authentication requirements
   - Request/response examples
   - Error handling
   - Code samples in multiple languages

## Customization

### Branding

Update these files:
- `docusaurus.config.ts`: Site title, tagline, favicon
- `static/img/`: Logo and favicon files
- `src/css/custom.css`: Custom styles

### Theme

The documentation uses Docusaurus's default theme with dark mode support. Customize colors in `src/css/custom.css`.

## Features

- ✅ Dark mode support
- ✅ Mobile responsive
- ✅ Search functionality
- ✅ Syntax highlighting for code blocks
- ✅ API endpoint documentation
- ✅ Multiple language code examples
- ✅ Version control ready

## API Endpoints Documented

1. **POST /api/generate-video-data**
   - Create video generation jobs
   - Supports multiple input methods (text, blog, PDF, audio, podcast)

2. **GET /api/video-data-status**
   - Check video generation status
   - Poll for completion with event ID

## Contributing

When adding new endpoints:
1. Document all parameters with types
2. Include request/response examples
3. Add error handling documentation
4. Provide code examples in cURL, JavaScript, and Python
5. Update the sidebar navigation

## Support

For questions or issues with the documentation:
- Open an issue in the main repository
- Contact the development team
