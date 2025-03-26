# Authentication System

## Overview

The Claude App Development Platform features a robust, secure authentication system built with:
- AWS Cognito
- Next.js
- React
- Chakra UI
- TypeScript

## Key Features

### Authentication Flows
- User Registration
- Login
- Password Reset
- Multi-Factor Authentication
- OAuth Integration (Google, GitHub)
- Device Management

## Getting Started

### Prerequisites
- Node.js 18+
- AWS Account
- Cognito User Pool
- OAuth Provider Credentials

### Environment Configuration

Create a `.env.local` file with the following variables:

```
# AWS Cognito Configuration
NEXT_PUBLIC_REGION=us-east-1
NEXT_PUBLIC_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_USER_POOL_CLIENT_ID=your_app_client_id
NEXT_PUBLIC_IDENTITY_POOL_ID=your_identity_pool_id

# OAuth Configuration
NEXT_PUBLIC_COGNITO_DOMAIN=your-cognito-domain.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_REDIRECT_SIGN_IN=http://localhost:3000/callback
NEXT_PUBLIC_REDIRECT_SIGN_OUT=http://localhost:3000/logout

# OAuth Provider Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GITHUB_CLIENT_ID=your_github_client_id
```

## Authentication Utilities

### Rate Limiting
Prevents brute-force attacks by limiting authentication attempts.

```typescript
// Example usage
import { rateLimiter } from '@/lib/rateLimiter';

// Check login attempts
const canAttemptLogin = rateLimiter.check(
  'login_attempt_username', 
  5,  // Max 5 attempts
  15 * 60 * 1000  // 15-minute window
);
```

### Authentication Logging
Tracks authentication events for security monitoring.

```typescript
// Example usage
import { AuthLogger } from '@/lib/authLogger';

// Log a login attempt
await AuthLogger.logLogin(
  userId, 
  loginSuccessful, 
  errorMessage
);
```

### Device Management
Tracks and manages user devices.

```typescript
// Example usage
import { DeviceManager } from '@/lib/deviceManagement';

// Get current device info
const currentDevice = DeviceManager.getCurrentDevice();

// Track device login
DeviceManager.trackDeviceLogin(userId);

// Get user's devices
const devices = DeviceManager.getTrackedDevices(userId);
```

## Security Best Practices

1. **Password Requirements**
   - Minimum 8 characters
   - Must include uppercase, lowercase, number, special character

2. **Multi-Factor Authentication**
   - Optional additional security layer
   - Time-based One-Time Password (TOTP)

3. **OAuth Integration**
   - Secure token management
   - Limited scope access
   - Server-side validation

## Troubleshooting

### Common Issues
- Verify AWS Cognito configuration
- Check environment variables
- Ensure correct OAuth provider setup
- Validate CORS settings

### Debugging
- Use browser developer tools
- Check network requests
- Review Cognito CloudWatch logs

## Extending the System

### Planned Improvements
- Passwordless authentication
- Biometric login support
- Enhanced device management
- More OAuth providers

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

### Testing
- Run authentication tests: `npm run test:auth`
- Check code coverage: `npm run test:coverage`

## Security Reporting

Report security vulnerabilities to: security@claudeappdev.com

## License

See LICENSE file for details.

## Acknowledgments
- AWS Cognito
- Next.js Authentication
- React Hook Form
- Chakra UI