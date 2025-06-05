import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../../src/auth/app';
import { handleLogin } from '../../../src/auth/handlers/login';

// Mock the login handler
jest.mock('../../../src/auth/handlers/login');
const mockedHandleLogin = handleLogin as jest.MockedFunction<typeof handleLogin>;

describe('Auth Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent => ({
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/auth/login',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '',
      apiId: '',
      authorizer: null,
      protocol: '',
      httpMethod: 'POST',
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '',
        user: null,
        userAgent: null,
        userArn: null
      },
      path: '/auth/login',
      stage: '',
      requestId: '',
      requestTimeEpoch: 0,
      resourceId: '',
      resourcePath: '',
    },
    resource: '',
    ...overrides
  });

  it('should handle OPTIONS request', async () => {
    const event = createEvent({
      httpMethod: 'OPTIONS'
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    expect(response.headers).toHaveProperty('Access-Control-Allow-Methods', 'POST,OPTIONS');
  });

  it('should handle login request', async () => {
    const mockLoginResponse = {
      statusCode: 200,
      body: JSON.stringify({ token: 'valid-token' })
    };

    mockedHandleLogin.mockResolvedValue(mockLoginResponse);

    const event = createEvent({
      body: JSON.stringify({ username: 'test', password: 'password' })
    });

    const response = await handler(event);

    expect(response).toEqual(mockLoginResponse);
    expect(mockedHandleLogin).toHaveBeenCalledWith(event);
  });

  it('should return 404 for unknown paths', async () => {
    const event = createEvent({
      path: '/auth/unknown'
    });

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(404);
    expect(body.message).toBe('Not Found');
  });

  it('should handle login errors', async () => {
    mockedHandleLogin.mockRejectedValue(new Error('Login failed'));

    const event = createEvent({
      body: JSON.stringify({ username: 'test', password: 'wrong' })
    });

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(500);
    expect(body.message).toBe('Internal server error');
  });
}); 