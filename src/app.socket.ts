import { Server } from 'ws';
import { Socket } from 'socket.io';
import { WebSocketGateway, OnGatewayInit, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Global, Logger } from '@nestjs/common';

@Global()
@WebSocketGateway({ namespace: '/ws', cors: { origin: '*' } })
export class AppSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('AppSocketGateway');

  @WebSocketServer() server: Server;

  /**
   * For handling events from clients
   * @SubscribeMessage('app:display-alert')
   * public handleMessage(client: Socket, payload: any): Promise<WsResponse<any>> {
   *   return this.server.emit('app:receive-alert', payload);
   * }
   */

  /**
   * Publishes events to all connected clients.
   *
   * @param event String
   * @param payload Object
   * @returns void
   */
  public publishEvent(event: string, payload: any): void {
    return this.server.emit(event, payload);
  }

  public afterInit(): void {
    return this.logger.log('App Socket Server Initialized!');
  }

  /**
   * Handles Client Disconnection
   *
   * @param client Socket
   * @returns Void
   */
  public handleDisconnect(client: Socket): void {
    return this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Handles Client Connection
   *
   * @param client Socket
   * @returns Void
   */
  public handleConnection(client: Socket): void {
    return this.logger.log(`Client connected: ${client.id}`);
  }
}
