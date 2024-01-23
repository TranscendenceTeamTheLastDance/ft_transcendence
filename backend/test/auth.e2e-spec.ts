import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  const userData = {
    email: 'test3@example.com',
    username: 'test3user',
    password: 'test3password',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Test for user registration
  // Define the signup data to send in the request body
  // Amend that data if you re run this test as
  // duplicate credientials will return a 401 error
  it('/auth/signup (POST)', async () => {
    console.log('Sending signup data:', userData);

    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(userData)
      .set('Content-Type', 'application/json')
      .withCredentials()
      .expect(201);

    expect(response.body).toHaveProperty('message', 'signup success');

    // Retrieve the Set-Cookie header
    const setCookieHeader = response.header['set-cookie'];
    expect(setCookieHeader).toBeDefined();

    // Ensure it's treated as an array of strings
    const cookiesArray = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : [setCookieHeader];

    // Find the access-token-cookie among the cookies
    const accessTokenCookie = cookiesArray.find((cookie) =>
      cookie.startsWith('access-token-cookie='),
    );
    expect(accessTokenCookie).toBeDefined();

    // Extract the token value from the cookie
    const retrievedAccessToken = accessTokenCookie.split(';')[0].split('=')[1];

    // console.log('Access Token Cookie:', retrievedAccessToken);
    accessToken = retrievedAccessToken;
  });

  // Test for user signin
  // The signup data is used
  // error will return a 401 error
  it('/auth/signin (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: userData.email,
        password: userData.password,
      })
      .set('Cookie', `access-token-cookie=${accessToken}`)
      .set('Content-Type', 'application/json')
      .withCredentials()
      .expect(200);

    expect(response.body).toHaveProperty('message', 'signin success');
  });

  // it('/users (PATCH)', async () => {
  //   const editedUserData = {
  //     username: userData.username,
  //     firstName: 'testfirstName',
  //     lastName: 'testlastName',
  //     email: userData.email,
  //   };

  //   console.log('/users Access Token Cookie:', accessToken);

  //   const response = await request(app.getHttpServer())
  //     .patch('/users')
  //     .send(editedUserData)
  //     .set('Cookie', `access-token-cookie=${accessToken}`)
  //     .set('Content-Type', 'application/json')
  //     .withCredentials()
  //     .expect(200);

  //   console.log('response.body:', response.body);
  //   console.log('response.status:', response.status);

  //   expect(response.body).toHaveProperty(
  //     'message',
  //     'backend: user successfully updated!',
  //   );
  // });

  // it('/users/me (GET)', async () => {
  //   const response = await request(app.getHttpServer())
  //     .get('/users/me')
  //     .set('Cookie', `access-token-cookie=${accessToken}`)
  //     .set('Content-Type', 'application/json')
  //     .withCredentials()
  //     .expect(200);

  //   console.log('access token:', accessToken);
  //   console.log('response.body:', response);
  // });

  afterAll(async () => {
    await app.close();
  });
});
