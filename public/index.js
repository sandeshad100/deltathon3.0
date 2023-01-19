const socket = io("/");
const peer = new Peer();

peer.on("open", (id) => {
  socket.emit("newUser", id);
});
