import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const userData = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'testpassword',
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

    // Add assertions to check the response body
    expect(response.body).toHaveProperty('message', 'signup success');
  });

  // it('/auth/signin (POST)', async () => {
  //   // Use commonSignupData for the signin test
  //   const response = await request(app.getHttpServer())
  //     .post('/auth/signin')
  //     .send({
  //       email: userData.email,
  //       password: userData.password,
  //     })
  //     .set('Content-Type', 'application/json')
  //     .withCredentials()
  //     .expect(200);

  //   expect(response.body).toHaveProperty('message', 'signin success');
  // });

  afterAll(async () => {
    await app.close();
  });
});
