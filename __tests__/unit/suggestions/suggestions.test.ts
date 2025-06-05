import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../../src/suggestions/app';
import { CityService } from '../../../src/suggestions/service';
import { CitySuggestion } from '../../../src/suggestions/types';
import { testToken } from '../../setup';

// Mock the CityService
jest.mock('../../../src/suggestions/service');
const mockedCityService = CityService as jest.Mocked<typeof CityService>;

describe('City Suggestions Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent => ({
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/city/suggestions',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '',
      apiId: '',
      authorizer: null,
      protocol: '',
      httpMethod: 'GET',
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
      path: '/city/suggestions',
      stage: '',
      requestId: '',
      requestTimeEpoch: 0,
      resourceId: '',
      resourcePath: '',
    },
    resource: '',
    ...overrides
  });

  it('should return 400 when query parameter is missing', async () => {
    const event = createEvent({
      headers: { Authorization: `Bearer ${testToken}` }
    });

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.error).toBe('Query parameter is required.');
  });

  it('should return 401 when token is invalid', async () => {
    const event = createEvent({
      queryStringParameters: { query: 'Lon' },
      headers: { Authorization: 'Bearer invalid-token' }
    });

    const response = await handler(event);
    expect(response.statusCode).toBe(401);
  });

  it('should return city suggestions for valid query', async () => {
    const mockSuggestions: CitySuggestion[] = [
      {
        name: 'London',
        state: 'Greater London',
        country: 'UK',
        coordinates: {
          lat: 51.5074,
          lon: -0.1278
        },
        fullLabel: 'London, Greater London, UK'
      },
      {
        name: 'Long Beach',
        state: 'California',
        country: 'USA',
        coordinates: {
          lat: 33.7701,
          lon: -118.1937
        },
        fullLabel: 'Long Beach, California, USA'
      }
    ];

    mockedCityService.getCitySuggestions.mockResolvedValue(mockSuggestions);

    const event = createEvent({
      queryStringParameters: { query: 'Lon' },
      headers: { Authorization: `Bearer ${testToken}` }
    });

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body).toEqual(mockSuggestions);
    expect(mockedCityService.getCitySuggestions).toHaveBeenCalledWith('Lon');
  });

  it('should return 500 when suggestions service fails', async () => {
    mockedCityService.getCitySuggestions.mockRejectedValue(new Error('Service unavailable'));

    const event = createEvent({
      queryStringParameters: { query: 'Lon' },
      headers: { Authorization: `Bearer ${testToken}` }
    });

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(500);
    expect(body.error).toBe('Failed to fetch city suggestions.');
  });
}); 