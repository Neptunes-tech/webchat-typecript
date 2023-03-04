import socketio from './socket-socketio';
import sockjs from './socket-sockjs';

const PROTOCOLS = { socketio, sockjs };
export default function (socketUrl:any, customData:any, path:any, protocol:any, protocolOptions:any) {
    protocol = protocol || 'socketio';
    const socketProtocol = (PROTOCOLS as any)[protocol];

    if (socketProtocol !== undefined) {
        return socketProtocol(socketUrl, customData, path, protocolOptions);
    }
    throw new Error(`Undefined socket protocol ${protocol}`);
}
