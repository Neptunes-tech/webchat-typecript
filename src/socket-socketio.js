import io from 'socket.io-client';

export default function (socketUrl, customData, path, protocolOptions) {
    const options = {
        transports: ['websocket', 'polling'],
        path,
        ...protocolOptions,
    };
    const socket = io(socketUrl, options);
    socket.on('connect', () => {
        console.log(`connect:${socket.id}`);
        socket.customData = customData;
    });

    socket.on('connect_error', (error) => {
        console.log(error);
    });

    socket.on('disconnect', (reason) => {
        console.log(reason);
    });

    return socket;
}
