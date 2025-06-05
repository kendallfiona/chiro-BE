# Weather Backend

A serverless backend application built with AWS SAM that provides weather information, city suggestions, and authentication services.

## Features

- **Weather Information**: Get current weather data for specified locations
- **City Suggestions**: Get city suggestions based on search queries
- **Authentication**: JWT-based authentication system
- **CORS Enabled**: Configured to work with frontend applications
- **Serverless Architecture**: Built using AWS Lambda and API Gateway

## Tech Stack

- Node.js 20.x
- TypeScript
- AWS SAM (Serverless Application Model)
- AWS Lambda
- API Gateway
- OpenWeather API
- GeoNames API

## Prerequisites

- AWS CLI
- AWS SAM CLI
- Node.js 20.x
- Docker (for local testing)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Configuration

The application requires the following environment variables:
- `OPENWEATHER_API_KEY`: Your OpenWeather API key
- `GEONAMES_USERNAME`: Your GeoNames username
- `JWT_SECRET`: Secret key for JWT token generation

## Development

To run the application locally:

```bash
# Build the application
./build.sh

# Start the local API
sam local start-api -p 3000
```

## Testing

The application includes test suites for all major components. Tests are written using Jest and are located in the `__tests__` directory.

### Running Tests

To run the test suite:

```bash
# Run all tests
npm test

### Test Environment

The tests use a separate test environment configuration:
- Environment variables are loaded from `.env` file
- JWT tokens are generated using the configured `JWT_SECRET`
- Mock responses are used for external API calls

## API Endpoints

### Weather
- `GET /weather`: Get weather information for a location

### City Suggestions
- `GET /city/suggestions`: Get city suggestions based on search query

### Authentication
- `POST /auth/login`: Authenticate user and get JWT token

## Deployment

To deploy the application to AWS:

```bash
# First time deployment
sam deploy --guided

# Subsequent deployments
sam deploy
```