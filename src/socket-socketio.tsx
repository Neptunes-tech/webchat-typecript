import io from 'socket.io-client';

export default function (socketUrl:any, customData:any, path:any, protocolOptions:any) {
    const options = {
        transports: ['websocket', 'polling'],
        path,
        ...protocolOptions,
    };
    const socket = io(socketUrl, options);
    socket.on('connect', () => {
        console.log(`connect:${socket.id}`);
        (socket as any).customData = customData;
    });

    socket.on('connect_error', (error:any) => {
        console.log(error);
    });

    socket.on('disconnect', (reason:any) => {
        console.log(reason);
    });

    return socket;
}
