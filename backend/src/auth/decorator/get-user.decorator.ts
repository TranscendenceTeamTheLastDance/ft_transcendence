import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest(); // we use the switchToHttp() method to get the request object but for other need we can use websocket or microservice with switchToWs() and switchToRpc()
    if (data) {
	  return request.user[data];
	}
	return request.user;
  },
);