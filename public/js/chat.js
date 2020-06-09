const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $shareLocationButton = document.querySelector('#share-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
// socket.on('countUpdatedEvent', (count) => {
//     console.log('The count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked')
//     socket.emit('increment')
// })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (msgObj) => {
    //console.log(msgTxt)
    const html = Mustache.render(messageTemplate, {
        username: msgObj.username,
        message: msgObj.text,
        createdAt: moment(msgObj.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('LocationMessage', (msgObj) => {
    //console.log(url)
     const html = Mustache.render(locationMessageTemplate, {
         username: msgObj.username,
         url: msgObj.url,
         createdAt: moment(msgObj.createdAt).format('h:mm a')
     })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ( {room, users} ) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    //disable the form
    e.preventDefault()      //prevent defaults behavior of from refresh
    
    $messageFormButton.setAttribute('disabled', 'disabled')

    //const message = document.querySelector('input').value
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        //enable the form
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error) {
            return console.log(error)
        }

        console.log('The message was delivered!')
    })
})

$shareLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    $shareLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        //console.log(position)
        socket.emit('clientLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location shared successfully!')
            $shareLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})

// Goal: Share the coordinates with  other users.

// 1. Have client emit "clientLocation" with an object as the data.
//      - Object should contain Latitude and Longitude properties.
// 2. Server should listen for "sendLocation".
//      - When fired, send a "message" to all the connected clients "Location: lat, long".
// 3. Test your work!

// Goal: Setup acknowledgement.
//
// 1. Setup the client acknowledgement function.
// 2. Setup the server to send back the acknowledgement.
// 3. Have the client print "Location Shared" when acknowldged.
// 4. Test your work!

//
// Goal: Disable the send location button while the location is being sent.
//
// 1. Set up a selector at the top of the file.
// 2. Disable the button just before getting the current position.
// 3. Enable the button in the acknowledgement callback.
// 4. Test your work!

//
// Goal: Create a separate event for a location sharing messages.
//
// 1. Have the server emit "LocationMessage" with the URL.
// 2. Have the client listen for "LocationMessage" url and print to the console.
// 3. Test your work by sharing a location!

//
// Goal: Render a new template for location messages.
//
// 1. Duplicate the message template.
//      - Change the id to something.
// 2. Add a link inside the paragraph with a link text "My Current Location".
//      - URL for the link should be the maps URL (dynamic).
// 3. Select the template from the JavaScript.
// 4. Render the template with the URL and append to messages list.
// 5. Test your work!

//
// Goal: Add timestamps for the location messages.
//
// 1. Create generateLocationMessage and export.
//      - { url: '', createdAd: 0 }
// 2. Use generateLocationMessage when server emits locationMessage.
// 3. Update template to render time before the url.
// 4. Compile the template with the url and the formatted time.
// 5. Test your work!

//
// Goal: Deploy the chat application.
//
// 1. Setup git and commit files.
//      - Ignore node_modules folder.
// 2. Setup a GitHub repository and push code up.
// 3. Setup a Heroku app and push code up.
// 4. Open the live app and test your work