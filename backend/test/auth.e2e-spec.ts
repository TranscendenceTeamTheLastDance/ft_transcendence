import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Test for user registration
  it('/auth/signup (POST)', async () => {
    // Define the signup data to send in the request body
    const signupData = {
      email: 'test@example.com',
      password: 'testpassword',
      username: 'testuser',
    };

    // Use supertest to make a POST request to the /auth/signup endpoint
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(signupData)
      .set('Accept', 'application/json') // Set the 'Accept' header
      .withCredentials() // Include credentials in the request  
      .expect(201); // Expect a 201 response code for successful signup

    // Add assertions to check the response body
    //    expect(response.body).toHaveProperty('message', 'signup success');
    // Additional assertions as necessary

    // You can also make additional requests to verify the signup process, such as
    // logging in with the newly created user and checking if they can access protected routes.
  }, 100000);

  // ... other test cases ...

  afterAll(async () => {
    await app.close();
  });
});
