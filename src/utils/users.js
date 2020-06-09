const users = []

//addUser, removeUser, getUser, getUserInRoom

const addUser = ({id, username, room}) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    //Check for existing user
    const existingUser = users.find( (user) => user.room === room && user.username === username )

    //Validate username
    if(existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    //Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removedUser = (id) => {
    const index = users.findIndex( (user) => user.id === id )

    if(index != -1) {
        return users.splice(index, 1)[0] //since we're removing 1 element so we return the first index of item removed from the array.
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id) 
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter( (user) => user.room === room )
}

module.exports = {
    addUser,
    removedUser,
    getUser,
    getUsersInRoom
}
//
// Goal: Create two new function for users.
//
// 1. Create getUser.
//      - Accept id and return user object (or undefined).
// 2. Create getUsersInRoom.
//      - Accept room name and return array of users (or an empty array).
// 3. Test your work by calling the functions! 