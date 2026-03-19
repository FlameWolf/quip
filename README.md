# Quip

A modern, responsive social network frontend built with [SolidJS](https://solidjs.com), inspired by Twitter. Quip provides a lightweight, performant user interface for social interaction, featuring posts, timelines, user profiles, search functionality, and more.

## Overview

Quip is a single-page application (SPA) that consumes the [Quip API v2](https://github.com/FlameWolf/quip-api-v2) backend. It offers users a beautiful and intuitive interface to create posts, follow users, manage timelines, bookmark content, and discover trending topics.

## Features

- **User Authentication**: Secure sign-up and sign-in with JWT-based authentication
- **Posts & Timeline**: Create, edit, delete, and interact with posts
- **Social Features**: Follow/unfollow users, like/favourite posts, repeat posts, reply and quote posts
- **User Profiles**: View user profiles with posts, followers, following, favourites, bookmarks, and mentions
- **Search**: Full-text search for posts and users
- **Lists**: Create and manage custom lists of users
- **Bookmarks**: Save posts for later reading
- **Interactions**: Reply to posts, quote posts, view post interactions
- **Dark Mode**: Light/dark theme toggle with persistent user preference
- **Emoji Support**: Rich emoji picker with popular emoji suggestions
- **Responsive Design**: Mobile-first design using Bootstrap 5
- **Service Worker**: Secure authentication handling via service worker with broadcast channels

## Tech Stack

- **SolidJS** (^1.9.11) - Reactive JavaScript framework for UI
- **@solidjs/router** (^0.15.4) - Client-side routing
- **Vite** (^7.3.1) - Fast build tool and dev server
- **Bootstrap** (^5.3.8) - Responsive CSS framework
- **Bootstrap Icons** (^1.13.1) - Icon library
- **Emoji Mart** (^5.6.0) + **Picmo** (^5.8.5) - Emoji picker components
- **node-emoji** (^2.2.0) - Emoji utilities
- **caret-pos** (^2.0.0) - Text cursor positioning
- **Floating UI** (^1.7.6) - Positioning library

## Project Structure

```text
quip/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Auth/            # Authentication pages
│   │   ├── Home/            # Timeline and feed
│   │   ├── Post/            # Individual post view
│   │   ├── Profile/         # User profiles
│   │   ├── Search/          # Search results
│   │   ├── Quips/           # Post lists
│   │   ├── Interactions/    # Post interactions (replies, likes, etc.)
│   │   ├── Follows/         # Followers/following views
│   │   └── NotFound/        # 404 page
│   ├── stores/              # Solid.js reactive stores
│   │   ├── theme-store.js   # Theme management
│   │   └── auth-store.js    # Authentication state
│   ├── App.jsx              # Root layout component
│   ├── index.jsx            # Application entry point with routing
│   ├── index.css            # Global styles
│   ├── library.jsx          # Utility functions and helpers
│   ├── secure-fetch.jsx     # API request wrapper with auth
│   └── assets/              # Images, icons, and static files
├── public/
│   └── auth-worker.js       # Service worker for secure token management
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── environment.config       # Environment variable template
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/FlameWolf/quip.git
    cd quip
    ```

2. **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3. **Configure environment variables:**

    - Copy `environment.config` to `.env.local`:

    ```bash
    cp environment.config .env.local
    ```

    - Update the following variables with your API configuration:

    ```env
    VITE_API_BASE_URL=http://localhost:3072          # Quip API base URL
    VITE_AUTH_CACHE_NAME=quip-auth-cache             # Service worker cache name
    VITE_AUTH_CHANNEL_NAME=quip-auth-channel         # Broadcast channel name for auth
    VITE_SET_AUTH_DATA_ACTION=set-auth-data          # Service worker action for setting auth
    VITE_GET_AUTH_DATA_ACTION=get-auth-data          # Service worker action for getting auth
    ```

### Running the Application

**Development Mode:**

```bash
npm run dev
# or
npm start
```

The application will start with HTTPS support (using self-signed certificates) on:

```url
https://localhost:3000
```

**Production Build:**

```bash
npm run build
```

**Preview Production Build:**

```bash
npm run serve
```

**Deploy to Firebase:**

```bash
npm run deploy
```

## Authentication

Quip uses a secure token management system via Service Worker and Broadcast Channels:

- **JWT Tokens**: Access tokens are managed through a service worker (`public/auth-worker.js`) for enhanced security
- **Broadcast Channels**: Cross-tab communication for real-time auth state synchronization
- **Auto Refresh**: Tokens are automatically refreshed via the Quip API
- **Protected Routes**: `/` and `/home` require authentication

## Styling

The application uses **Bootstrap 5** for responsive design with custom CSS enhancements:

- **Theme System**: Light/dark mode toggle persisted to localStorage
- **Custom Utilities**: Extended Bootstrap utilities in `src/index.css`
- **Responsive**: Mobile-first approach ensuring great UX on all devices
- **Inter Font**: High-quality font via Inter UI package

## Key Utilities

**library.jsx** provides essential utility functions:

- **Text Processing**: HTML/text conversion, content length validation (max 256 characters)
- **Emoji Handling**: Popular emoji list, emoji insertion at cursor position
- **Date Formatting**: Multiple date format options (short, long, time-ago)
- **Cookie Management**: Secure cookie operations
- **Validation**: Handle validation with regex patterns (handles, passwords)
- **Content Limits**: 20 items default fetch limit, 256 character post limit

## API Integration

Quip communicates with the [Quip API v2](https://github.com/FlameWolf/quip-api-v2) for:

- User authentication (sign-up, sign-in, token refresh)
- Post creation, editing, deletion, and interactions
- Timeline and activity feeds
- User profile and relationship management
- Search across posts and users
- List management
- Bookmarks and favourites

## Responsive Breakpoints

Uses Bootstrap 5 responsive grid system:

- **Mobile**: < 576px
- **Tablet**: ≥ 576px
- **Desktop**: ≥ 992px
- **Large Desktop**: ≥ 1200px

## Build Configuration

- **Target**: ES Next
- **No Polyfill**: Dynamic imports not polyfilled
- **Plugin**: Solid plugin for JSX support and reactivity

## Environment Variables

See `environment.config` for required variables. All environment variables must be prefixed with `VITE_` to be exposed to the browser.

## Deployment

The `dist` folder created by `npm run build` can be deployed to any static host:

- Firebase Hosting (via `npm run deploy`)
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any static web host

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Related Projects

- **[Quip API v2](https://github.com/FlameWolf/quip-api-v2)** - Backend API for Quip

## Resources

- [SolidJS Documentation](https://solidjs.com)
- [Vite Documentation](https://vitejs.dev)
- [Bootstrap Documentation](https://getbootstrap.com)
- [SolidJS Router](https://github.com/solidjs/solid-router)

---

Built with :heart: by FlameWolf