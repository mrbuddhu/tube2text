# Tube2Text

A web application that transforms YouTube videos into readable articles by extracting and processing video content.

## Features

- YouTube video URL input
- Video transcription generation
- AI-powered article conversion from transcription
- Article preview and editing capabilities
- One-click article export/download
- History of previous conversions

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- YouTube Data API (coming soon)
- OpenAI API (coming soon)

## Payment Integration

One-time payment via PayPal.me at mrbuddhu1

## Deployment

### Prerequisites
- Create OAuth credentials in Google Cloud Console
- Obtain YouTube Data API key
- Set up Vercel account

### Environment Variables
1. Copy `.env.local.example` to `.env.local`
2. Fill in the following variables:
   - `NEXTAUTH_SECRET`: Generate using `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID`: From Google Cloud Console
   - `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
   - `YOUTUBE_API_KEY`: From Google Cloud Console

### Deployment Steps
1. Push to GitHub
2. Connect Vercel to your GitHub repository
3. Set environment variables in Vercel project settings

### Local Development
```bash
npm install
npm run dev
```

## Future Features

- Subscription-based access to premium features
- Enhanced article customization options
- Enhanced preview and editing capabilities
- Enhanced export/download capabilities
- Enhanced history of previous conversions
- Enhanced video transcription generation
- Enhanced AI-powered article conversion
- Enhanced payment integration
- Enhanced user account management
