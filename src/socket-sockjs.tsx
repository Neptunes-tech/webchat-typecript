import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { EventEmitter } from 'events';

/*
  This implementation mimics the SocketIO implementation.
*/
export default function (socketUrl:any, customData:any, _path:any, options:any) {
  const socket:any = SockJS(socketUrl + (_path || ''));
  const stomp = Stomp.over(socket);

  const MESSAGES_CHANNEL = options.messagesChannel || '/app/sendMessage';
  const REPLY_TOPIC = options.replyTopic || '/user/queue/reply';
  const SUBSCRIPTION_CHANNEL = options.subscriptionChannel || '/app/addUser';

  const socketProxy = new EventEmitter();

  const send = (message:any) => {
    stomp.send(MESSAGES_CHANNEL, {}, JSON.stringify(message));
  };

  const extractSessionId = () => {
    // eslint-disable-next-line no-underscore-dangle
    const urlarray = socket._transport.url.split('/');
    const index = urlarray.length - 2;
    return urlarray[index];
  };

  socketProxy.on('user_uttered', (data) => {
    send({
      type: 'CHAT',
      content: JSON.stringify(data),
      sender: (socketProxy as any).id
    });
  });

  socketProxy.on('session_request', () => {
    const authData = options.authData || null;

    send({
      type: 'SESSION_REQUEST',
      content: JSON.stringify({authData, ...customData}),
      sender: 'client'
    });
  });

  (socketProxy as any).onconnect = () => {
    (socketProxy as any).connected = true;
    // (socketProxy as any).id = extractSessionId(socket);
    (socketProxy as any).id = extractSessionId();

    (socketProxy as any).customData = customData;
    stomp.subscribe(REPLY_TOPIC, (socketProxy as any).onIncomingMessage);
    stomp.send(
      SUBSCRIPTION_CHANNEL,
      {},
      JSON.stringify({ type: 'JOIN', sender: (socketProxy as any).id })
    );
  };

  (socketProxy as any).onerror = (error:string) => {
    // eslint-disable-next-line no-console
    console.log(error);
  };

  const emitBotUtteredMessage = (message:any) => {
      delete message.recipient_id;
      socketProxy.emit('bot_uttered', message);
  }

  (socketProxy as any).onIncomingMessage = (payload:any) => {
    const message = JSON.parse(payload.body);

    if (message.type === 'JOIN') {
      socketProxy.emit('connect');
    } else if (message.type === 'LEAVE') {
      socket.close();
      socketProxy.emit('disconnect', message.content || 'server left');
    } else if (message.type === 'SESSION_CONFIRM') {
      const props = JSON.parse(message.content)
      socketProxy.emit('session_confirm', {session_id: (socketProxy as any).id, ...props});
    } else if (message.type === 'CHAT') {
      const agentMessage = JSON.parse(message.content);
      if (agentMessage instanceof Array) {
        agentMessage.forEach(message => emitBotUtteredMessage(message))
      } else {
        emitBotUtteredMessage(agentMessage);
      }
    }
  };

  (socketProxy as any).close = () => {
    socket.close();
  };

  stomp.connect({}, (socketProxy as any).onconnect, (socketProxy as any).onerror);

  stomp.onWebSocketClose = () => {
    // eslint-disable-next-line no-console
    (socketProxy as any).connected = false;
    // eslint-disable-next-line no-console
    console.log('Closed sockjs connection');
    socketProxy.emit('disconnect');
  };

  return socketProxy;
}
