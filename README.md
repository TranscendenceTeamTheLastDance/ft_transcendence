# ft_transcendence


<h2>RUN THE PROJECT</h2>

To run on 42 Machines, you can just `make` to launch every container. To see if they are working correctly : 
* `docker ps` to see if they have all been created
* `localhost:3000` to check the frontend
* `localhost:5555` to check the database via prisma studio
* try sending requests to `localhost:3333/auth/test` or `localhost:8080/auth/test` for the backend   

If you want to just launch one container (easier for debugging) : 

* run `npm install` (installs all the dependencies i.e external modules or libraries that the project needs to function correctly)
* if you want to test the backend : `npm i --save-dev @nestjs/cli` or `npm install @nestjs/cli`
* Cd in the folder of either front or backend
* `npm run start:dev` to be in watch mode (refreshes everytime you amend the code)
* else simple `npm run start`  

<h2>ARCHITECTURE (WIP)</h2>

A module is a class. It is annotated with a `@Module()` decorator which provides metadata that Nest makes use of to organize the application structure. More on modules [here](https://docs.nestjs.com/modules). This is how we will organise our project (for now) : 
 
- [ ] User : /getall /getme /getXXuser etc. -> Les informations de l'utilisateur
- [ ] Auth : Module d'authentification, tu peux gérer cela via un cookie ou un token, comme tu préfères
- [ ] Chat : Socket, un peu comme sur IRC.
- [ ] Game : Également basé sur des sockets.
- [ ] Notify : Encore une fois, basé sur des sockets.

Then each module has at least one controller and one provider. Controllers are responsible for handling incoming requests and returning responses to the client. So Controllers should handle HTTP requests but they delegate more complex tasks to providers.

test des notif discord 
