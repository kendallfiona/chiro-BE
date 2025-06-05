import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../../src/weather/app';
import { WeatherService } from '../../../src/weather/weather.service';
import { WeatherData } from '../../../src/weather/types';
import { testToken } from '../../setup';

// Mock the WeatherService
jest.mock('../../../src/weather/weather.service');
const mockedWeatherService = WeatherService as jest.Mocked<typeof WeatherService>;

describe('Weather Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent => ({
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/weather',
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
      path: '/weather',
      stage: '',
      requestId: '',
      requestTimeEpoch: 0,
      resourceId: '',
      resourcePath: '',
    },
    resource: '',
    ...overrides
  });

  it('should return 400 when city parameter is missing', async () => {
    const event = createEvent({
      headers: { Authorization: `Bearer ${testToken}` }
    });

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.error).toBe('City parameter is required.');
  });

  it('should return 401 when token is invalid', async () => {
    const event = createEvent({
      queryStringParameters: { city: 'London' },
      headers: { Authorization: 'Bearer invalid-token' }
    });

    const response = await handler(event);
    expect(response.statusCode).toBe(401);
  });

  it('should return weather data for valid city', async () => {
    const mockWeatherData: WeatherData = {
      main: {
        temp: 20,
        feels_like: 19,
        humidity: 65,
        pressure: 1015,
        temp_min: 18,
        temp_max: 22
      },
      weather: [{
        id: 800,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }],
      wind: {
        speed: 5.2,
        deg: 280
      },
      clouds: {
        all: 20
      },
      name: 'London',
      sys: {
        country: 'GB',
        sunrise: 1677649420,
        sunset: 1677685420
      },
      visibility: 10000,
      dt: 1677649420,
      timezone: 0,
      id: 2643743,
      cod: 200,
      coord: {
        lon: -0.1278,
        lat: 51.5074
      }
    };

    mockedWeatherService.getWeatherByCity.mockResolvedValue(mockWeatherData);

    const event = createEvent({
      queryStringParameters: { city: 'London' },
      headers: { Authorization: `Bearer ${testToken}` }
    });

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body).toEqual(mockWeatherData);
    expect(mockedWeatherService.getWeatherByCity).toHaveBeenCalledWith('London');
  });

  it('should return 404 when city is not found', async () => {
    mockedWeatherService.getWeatherByCity.mockRejectedValue(new Error('City not found.'));

    const event = createEvent({
      queryStringParameters: { city: 'NonexistentCity' },
      headers: { Authorization: `Bearer ${testToken}` }
    });

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(404);
    expect(body.error).toBe('City not found.');
  });

  it('should return 500 when weather service fails', async () => {
    mockedWeatherService.getWeatherByCity.mockRejectedValue(new Error('Service unavailable'));

    const event = createEvent({
      queryStringParameters: { city: 'London' },
      headers: { Authorization: `Bearer ${testToken}` }
    });

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(500);
    expect(body.error).toBe('Service unavailable');
  });
}); 