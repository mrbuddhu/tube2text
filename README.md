# Tube2Text - AI-Powered Video Content Platform

Transform YouTube videos into engaging articles and social media content using advanced AI.

## Features

- YouTube Video Processing
- AI-Powered Transcription
- Article Generation
- Social Media Content Creation
- Analytics Dashboard
- Content Templates
- Writing Styles System
- Export in Multiple Formats

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A YouTube API key
- A Clerk account for authentication
- Environment variables set up (see below)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tube2text.git
cd tube2text
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Copy `.env.example` to `.env.local`
- Fill in all required environment variables

4. Run the development server:
```bash
npm run dev
```

### Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Environment Variables

Required environment variables for production:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## Testing

Run the test suite:
```bash
npm run test
```

## Documentation

- [User Guide](docs/USER_GUIDE.md)
- [API Documentation](docs/API.md)
- [Contributing Guide](CONTRIBUTING.md)

## Legal

- [Privacy Policy](legal/PRIVACY_POLICY.md)
- [Terms of Service](legal/TERMS_OF_SERVICE.md)
- [Cookie Policy](legal/COOKIE_POLICY.md)

## Security

Report security vulnerabilities to security@yourdomain.com

## Support

For support, email support@yourdomain.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
