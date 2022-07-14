const roomsDatabase = require("../databases/rooms");
const usersService = require("../services/users");
const CanvassaException = require("../exceptions/CanvassaException");

const createRoom = async (name, author, initialMembers = null, canvas = {}) => {
  err = "";
  if (!name) err = "name";
  else if (initialMembers === undefined) err = "initialMembers";
  else if (canvas === undefined) err = "canvas";
  if (err) throw new CanvassaException(400, `invalid ${err}`);

  // allow initialMembers to be optional
  if (initialMembers === null) {
    const user = await usersService.getUserByUsername(author);
    console.log(user);
    initialMembers = [user._id];
  }
  const link = ""; // TODO: create join link
  const room = await roomsDatabase.createRoom(
    name,
    link,
    initialMembers,
    canvas
  );
  console.log(room);
  await Promise.all(
    room.members.map(
      async (member) => await usersService.addRoom(member, room._id)
    )
  );
  return room;
};

const getRoom = async (id) => {
  if (!id) throw new CanvassaException(400, "invalid id");
  return await roomsDatabase.getRoom(id);
};

const addRoomMember = async (id, userId) => {
  if (!id) throw new CanvassaException(400, "invalid id");
  if (!userId) throw new CanvassaException(400, "invalid userId");

  let room = await getRoom(id);
  if (room.members.includes(userId))
    throw new CanvassaException(
      409,
      `user with id ${userId} already exists in room`
    );
  room = await roomsDatabase.addRoomMember(id, userId);
  if (!room) return null;
  await usersService.addRoom(userId, id);
  return room;
};

const removeRoomMember = async (id, userId) => {
  if (!id) throw new CanvassaException(400, "invalid id");
  if (!userId) throw new CanvassaException(400, "invalid userId");

  let room = await getRoom(id);
  if (!room.members.includes(userId))
    throw new CanvassaException(
      409,
      `user with id ${userId} does not exist in room`
    );
  room = await roomsDatabase.removeRoomMember(id, userId);
  if (!room) return null;
  await usersService.removeRoom(userId, id);
  return room;
};

const deleteRoom = async (id) => {
  if (!id) throw new CanvassaException(400, "invalid id");
  let room = await getRoom(id);
  if (!room)
    throw new CanvassaException(404, `rooom with id ${id} does not exist`);
  room = await roomsDatabase.deleteRoom(id);
  return room;
};

module.exports = {
  createRoom,
  getRoom,
  addRoomMember,
  removeRoomMember,
  deleteRoom,
};
