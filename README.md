# ft_transcendence


<h2>RUN THE PROJECT</h2>

To run on 42 Machines :   
* run `npm install` (installs all the dependencies i.e external modules or libraries that the project needs to function correctly)
* `npm i --save-dev @nestjs/cli` or `npm install @nestjs/cli` (installs the NestJS CLI as a development dependency)
* Cd in the backend folder
* `npm run start:dev` to be in watch mode (refreshes everytime you amend the code)
* else simple `npm run start`  

The list of npm commands is in `package.json`.


<h2>ARCHITECTURE (WIP)</h2>

A module is a class. It is annotated with a `@Module()` decorator which provides metadata that Nest makes use of to organize the application structure. More on modules [here](https://docs.nestjs.com/modules). This is how we will organise our project (for now) : 
 
- [ ] User : /getall /getme /getXXuser etc. -> Les informations de l'utilisateur
- [ ] Auth : Module d'authentification, tu peux gérer cela via un cookie ou un token, comme tu préfères
- [ ] Chat : Socket, un peu comme sur IRC.
- [ ] Game : Également basé sur des sockets.
- [ ] Notify : Encore une fois, basé sur des sockets.

Then each module has at least one controller and one provider. Controllers are responsible for handling incoming requests and returning responses to the client. So Controllers should handle HTTP requests but they delegate more complex tasks to providers.
