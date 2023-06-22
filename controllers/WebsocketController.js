import { WebSocketServer } from "ws";
import { isJson } from "../functions/functions.js";

// webosocket init
let wss = new WebSocketServer({ port: 3001 });
const clients = new Map();

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    if (isJson(msg)) {
      msgHandler(JSON.parse(msg), ws);
    } else {
      msgHandler(msg, ws);
    }
  });

  ws.on("error", (e) => ws.send(e));
});

wss.on("close", (ws) => {
  const clientId = getClientId(ws);
  if (clientId) {
    removeClient(ws, clientId);
  }
});

function getClientId(ws) {
  for (const [clientId, clientWs] of clients) {
    if (clientWs === ws) {
      return clientId;
    }
  }
  return null; // Если clientId не найден
}

function msgHandler(msg, ws) {
  if (msg.cmd == "start") {
    const clientId = msg.clientId;
    if (!clients.has(msg.clientId)) {
      clients.set(msg.clientId, ws);
      console.log([...clients.keys()]);
      ws.clientId = clientId; // Сохраняем clientId в объекте WebSocket
    }
  }
}

function removeClient(ws, clientId) {
  console.log(`client ${clientId} disconnected`);
  clients.delete(clientId);
  ws.close();
}

export function sendMsgWs(clientId, cmd, msg) {
  let ws = clients.get(clientId);
  console.log(ws);
  if (ws) {
    ws.send(JSON.stringify({ cmd: cmd, msg: msg }));
  }
}
