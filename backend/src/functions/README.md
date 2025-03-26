# Claude App Development Platform - Backend Services

## Overview
Serverless backend services for the Claude App Development Platform using AWS SAM (Serverless Application Model).

## Architecture
- **Compute**: AWS Lambda
- **Database**: Amazon DynamoDB
- **API Gateway**: Serverless REST API
- **Authentication**: AWS Cognito
- **Deployment**: AWS SAM

## Project Structure
```
backend/
├── src/                  # Source code
│   ├── functions/        # Lambda function handlers
│   ├── middleware/       # Shared middleware
│   ├── lib/              # Utility functions
│   └── models/           # Data models
├── tests/                # Test suites
├── events/               # Event source mappings
└── stepFunctions/        # Workflow definitions
```

## Prerequisites

### System Requirements
- Node.js 18+
- npm 8+
- AWS CLI
- AWS SAM CLI
- Docker (for local testing)

### AWS Account Setup
1. Create an AWS account
2. Install AWS CLI
3. Configure AWS credentials
   ```bash
   aws configure
   ```

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/claude-app-dev-platform.git
cd claude-app-dev-platform/backend
```

### 2. Install Dependencies
```bash
npm install
```

## Configuration

### Environment Variables
Create a `.env` file with the following:
```
STAGE=dev
USERS_TABLE_NAME=claude-app-users
CLAUDE_API_KEY=your_claude_api_key
```

### AWS Credentials
Ensure your AWS credentials are configured with appropriate permissions:
- Lambda function creation
- DynamoDB table management
- API Gateway configuration

## Development Workflow

### Local Development
```bash
# Start local API Gateway
sam local start-api

# Invoke specific Lambda function
sam local invoke CreateUserFunction
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- tests/users/

# Generate coverage report
npm run test:coverage
```

### Linting
```bash
npm run lint
```

## Deployment

### Deploy to Development
```bash
npm run deploy:dev
```

### Deploy to Staging
```bash
npm run deploy:staging
```

### Deploy to Production
```bash
npm run deploy:prod
```

## API Endpoints

### User Management
- `POST /users`: Create a new user
  - Payload: `{ username, email, firstName?, lastName? }`
- `GET /users/{userId}`: Get user profile
- `PUT /users/{userId}`: Update user profile

### Project Management
- `POST /projects`: Create a new project
- `GET /projects`: List projects
- `GET /projects/{projectId}`: Get project details
- `PUT /projects/{projectId}`: Update project

## Monitoring and Logging
- CloudWatch Logs for Lambda functions
- X-Ray for request tracing
- CloudWatch Metrics for performance monitoring

## Security Considerations
- IAM roles with least privilege
- Encryption at rest (DynamoDB)
- Input validation middleware
- Authentication via AWS Cognito

## Troubleshooting

### Common Issues
- Ensure AWS credentials are correctly configured
- Check Lambda function logs in CloudWatch
- Verify IAM permissions

### Debugging
- Use `sam local` for local testing
- Enable detailed logging in Lambda functions
- Use AWS X-Ray for distributed tracing

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### Coding Standards
- Use ESLint for code quality
- Write comprehensive unit and integration tests
- Follow AWS Lambda best practices

## Future Improvements
- Add more comprehensive error handling
- Implement advanced caching strategies
- Enhance monitoring and alerting

## License
MIT License

## Support
For issues or questions, please open a GitHub issue or contact support@claudeappdev.com
```

This comprehensive README provides:
- Detailed project structure
- Setup and installation instructions
- Development and deployment workflows
- API endpoint documentation
- Security and monitoring guidance
- Contribution guidelines

Would you like me to elaborate on any specific section?