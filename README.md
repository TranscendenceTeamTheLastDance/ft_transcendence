# ft_transcendence


<h2>RUN THE PROJECT</h2>

To run on 42 Machines, you can just `make` to launch every container. To see if they are working correctly : 
* `docker ps` to see if they have all been created
* `${process.env.REACT_APP_SERVER_ADDRESS}:3000` to check the frontend
* `${process.env.REACT_APP_SERVER_ADDRESS}:5555` to check the database via prisma studio
* try sending requests to `${process.env.REACT_APP_SERVER_ADDRESS}:3333/auth/test` or `${process.env.REACT_APP_SERVER_ADDRESS}:8080/auth/test` for the backend   

If you want to just launch one container (easier for debugging) : 

* run `npm install` (installs all the dependencies i.e external modules or libraries that the project needs to function correctly)
* if you want to test the backend : `npm i --save-dev @nestjs/cli` or `npm install @nestjs/cli`
* Cd in the folder of either front or backend
* `npm run start:dev` to be in watch mode (refreshes everytime you amend the code)
* else simple `npm run start`

 
> ⚠️ If you are in the process of coding / amending stuff, note that your code will not update upon a simple save of the new code in your IDE if you're running the app through docker containers, you will need to launch the backend with `npm run start:dev` and the frontend with `npm run start` on different terminals so you can see updates as you save the new code. 

<h2>ARCHITECTURE (WIP)</h2>

A module is a class. It is annotated with a `@Module()` decorator which provides metadata that Nest makes use of to organize the application structure. More on modules [here](https://docs.nestjs.com/modules). This is how we will organise our project (for now) : 
 
- [ ] User : /getall /getme /getXXuser etc. -> Les informations de l'utilisateur
- [ ] Auth : Module d'authentification, tu peux gérer cela via un cookie ou un token, comme tu préfères
- [ ] Chat : Socket, un peu comme sur IRC.
- [ ] Game : Également basé sur des sockets.
- [ ] Notify : Encore une fois, basé sur des sockets.
- [ ] Database

Then each module has at least one controller and one provider. Controllers are responsible for handling incoming requests and returning responses to the client. So Controllers should handle HTTP requests but they delegate more complex tasks to providers.

<details><summary><h2>CONNECT FRONT AND BACK (WIP)</h2></summary>
 
To integrate a React frontend with a NestJS backend, and to apply frontend's style to a specific route like `${process.env.REACT_APP_SERVER_ADDRESS}:8080/auth/test` , we need to set up the React app to handle the frontend rendering and make calls to the NestJS backend for data. Here's how to approach this:

**Step 1: Serve the frontend**

First, we ensure that the React app is built and served correctly. Checks can be done on ${process.env.REACT_APP_SERVER_ADDRESS}:3000 or by checking the container's log to see if all is well. Then we need to configure the React app to make API calls to the NestJS backend so create test js files that start on App.js.

**Step 2: Configure the backend API endpoints**

The NestJS backend must serve as an API server. The React app will make requests to this server to get data. 
* Create API Endpoints: We already have a /auth/test endpoint for example. We need API endpoints for each route we want to handle.
* Enable CORS: If the React app and NestJS server are on different or ports, we need to enable CORS in the NestJS app to allow the frontend to communicate with the backend. So add `app.enableCors();` to `main.js`

**Step 3: Make API calls from the frontend to the backend**

In the React app, we will make HTTP requests to the NestJS backend to fetch data or perform actions. We can use fetch API or libraries like axios for this but in this project we use Axios :   

* Fetch Data in React: When a user navigates to a route in the React app (like /auth/test), we make an API call to the NestJS backend to retrieve the necessary data. For example, we use axios.get('http://${process.env.REACT_APP_SERVER_ADDRESS}:3000/auth/test') to get a "Hello World" response which is the message provided by the test function in the backend.
* Display Data in React: We use the data received from the NestJS backend to render our React components. This way, the content and style of the application are controlled by React, while NestJS acts as the data source.

⚠️ Download Axios on your machine as a development dependency (in frontend) if you dont have sudo access : `npm install axios --save-dev`

</details>
