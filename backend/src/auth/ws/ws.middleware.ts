import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

import { UserService } from '../../user/user.service';
import { Logger } from '@nestjs/common';

interface JwtPayload {
    sub: number;
    email: string;
}

export type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;

export const WSAuthMiddleware = (
    jwtService: JwtService,
    userService: UserService,
): SocketMiddleware => {
    return async (client: Socket, next: (err?: Error) => void) => {
        try {
            let token = client.handshake.headers.token;
            if (!token) {
                token = client.handshake.auth.token;
            }

            Logger.log('token: ' + token);

            // Vérifier le token
            const payload: JwtPayload = jwtService.verify(token as string);

            Logger.log('payloadId: ' + payload.sub);

            // Récupérer l'utilisateur à partir de l'ID dans le token
            const user = await userService.getUnique(payload.sub);

            Logger.log('user: ' + user);

            if (!user) {
                throw new Error('User not found');
            }

            // Ajouter les données utilisateur au client et passer à l'étape suivante
            client.data.user = user;
            next();
        } catch (error) {
            // Gérer les erreurs de vérification du token
            next(error);
        }
    };
};
