const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removedUser, getUser, getUsersInRoom} = require('./utils/users')

const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, "../public")

app.use(express.static(publicDirectoryPath))

//let count = 0
// Goal: Send a welcome message to new users

// 1. Have a server emit a "message" when new client connects
//         - Send "Welcome!" as the event data
// 2. Have a client listen for the "message" event and print the message to the console
// 3. Test your work!

// Goal: Allow clients to send messages

// 1. Create a form with an input and button
//     - Similar to the weather form
// 2. Setup event listener for form submissions
//     - Emit "sendMessage" with the input string as message Data
// 3. Have server listen for the "sendMessage"
//     - Send message to all the connected clients
// 4. Test your work!

//
// Goal: Render username for text messages.
//
// 1. Setup the server to send username to the client.
// 2. Edit every call to "generateMessage" to include username.
//      - Use "Admin" for sys messages like connect/welcome/disconnect.
// 3. Update client to render username in the template.
// 4. Test your work!

io.on('connection', (socket) => {
    console.log('New  Websocket connection')

//     socket.emit('countUpdatedEvent', count)

//     socket.on('increment', () => {
//         count++
//         //socket.emit('countUpdatedEvent', count)
//         io.emit('countUpdatedEvent', count)
//     })

    //socket.emit('message', "Welcome!")
    //socket.broadcast.emit('message', 'A new user has joined!')
    // socket.emit('message', generateMessage("Welcome!"))
    // socket.broadcast.emit('message', generateMessage('A new user has joined!'))

    socket.on('join', (options, callback) => {
        const {error, user} = addUser({ id: socket.id, ...options })
        if(error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', "Welcome!"))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        if(user) {
            const filter = new Filter()
            if(filter.isProfane(message)) {
                return callback('Profinity is not allowed!')
            }
            //io.emit('message', message)
            io.to(user.room).emit('message', generateMessage(user.username, message))
            callback() //can send any number of arguments. Optional   
        }
    })

    //listen on client location broadcast to all the connected clients.
    socket.on('clientLocation', (coords, callback)  => {
        const user = getUser(socket.id)
        if(user) {
            //sharing location
            //io.emit('message', `Location: ${coords.latitude}, ${coords.longitude}`)

            //sharing googlemaps link (https://google.com/maps?q=<latitide>,<longitude>)
            //io.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
            //io.emit('LocationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
            //io.emit('LocationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
            io.to(user.room).emit('LocationMessage', generateLocationMessage(
                                                                user.username,
                                                                `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
                                                                )
            callback()
        }
    })

    // server (emit) -> client (receive) --acknowledgement --> server

    // client (emit) -> server (receive) --acknowledgement --> client

    socket.on('disconnect', () => {
        const user = removedUser(socket.id)
        if(user) {
            //io.emit('message', 'A user has left!')
             //io.emit('message', generateMessage('A user has left!'))
             io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the room ${user.room}!`))

             io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})

//
// Goal: Send messages to the correct room.
//
// 1. Use getUser inside "sendMessage" event handler to get user data.
// 2. Emit the message to their current room.
// 3. Test your work!
// 4. Repeat for "sendLocation".