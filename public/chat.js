$(function () {

    //make socket connection
    var socket = io.connect('http://localhost:4000');

    //grab all the buttons and inputs
    var username = $('#username');
    var usernameSend = $('#usernameSend');
    var chatroom = $('#chatroom');
    var feedback = $('#feedback');
    var message = $('#message')
    var messageSend = $('#messageSend');
    var onlineUser = $('#onlineUser')
    var room1 = $('#room1');
    var room2 = $('#room2');
    var room3 = $('#room3');
    var room4 = $('#room4');
    var status = document.getElementById('status');
    var box = $('#box');
    var newConnName = ''
    //set the default value of status
    var statusDefault = status.textContent;
    // console.log('')
    //creating a status function to change the status and clear after 4secs
    var sendNotification = (s) => {
        status.textContent = s;
        if (s !== statusDefault) {
            let delay = setTimeout(() => {
                sendNotification(statusDefault);
                box.hide();
            }, 3000);
        } sendNotification
        box.show();
    }

    //btn object
    var specificBtn = {
        messageSend: 'message',
        room1:'room1',
        room2:'room2',
        room3: 'room3',
        room4: 'room4'
    }

    var currentRoom  = 'room1';
    var roomId = 'room1'
    var oldroomname;
    //check for connection
    if (socket !== undefined) {
        console.log('Connected to socket...');

        socket.emit('newUser')
        socket.on('newUser', (data) => {
            newConnName = data.username;
            sendNotification(`${data.username} is connected.`);
            chatroom.append(`
                <p class="updateMessage text-center" >${newConnName} joined the chat.</p>
            `)
        })


        //emit username on button click
        usernameSend.click(() => {
            socket.emit('changeUsername', { username: username.val() })
            // oldConnName = newConnName;
            // newConnName = username.val();
            socket.emit('update', data);
            
            // document.getElementById(newConnName).innerHTML = username.val();

        });
        socket.on('update', (data)=>{
            console.log(newConnName)
            console.log(username.val())
            chatroom.append(`
                <p class="updateMessage text-center" >${data.oldname} is now ${data.newname}.</p>
            `)
        })

        //emit typing..

        //Listen on typing

        
        socket.on('status', (data) => {
            sendNotification(data)

        });

        message.bind('keypress', () => {
            console.log('yes')
            socket.emit('typing')
        });

        socket.on('typing', (data) => {
            feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
        })

        room1.click(specificBtn.room1, ()=>{
            console.log('Room2 Joined')
            currentRoom = 'Community Focus'
            roomId = 'room1'
            oldroomname= 'Community Spot';
            console.log(`Current Room: ${currentRoom}`)
            socket.emit(specificBtn.room1, {
                currentRoom: currentRoom, 
                roomId: roomId, 
                name: username.val(),
                oldroom: 'room1',
                oldroomname: ''
            })
        })
        room2.click(specificBtn.room2, ()=>{
            console.log('Room2 Joined')
            currentRoom = 'Cranium Focus'
            roomId = 'room2'
            oldroomname= 'Community Spot';
            console.log(`Current Room: ${currentRoom}`)
            socket.emit(specificBtn.room1, {
                currentRoom: currentRoom, 
                roomId: roomId, 
                name: username.val(),
                oldroom: 'room1',
                oldroomname: 'Community Spot'
            })
        })
        room3.click(specificBtn.room3, ()=>{
            console.log('Room3 Joined')
            currentRoom = 'Team Territory'
            roomId = 'room3'
            oldroomname= 'Cranium Focus';
            console.log(`Current Room: ${currentRoom}`)
            socket.emit(specificBtn.room1, {
                currentRoom: currentRoom, 
                roomId: roomId, 
                name: username.val(),
                oldroom: 'room2',
                oldroomname: 'Cranium Focus'})
        })
        room4.click(specificBtn.room4, ()=>{
            console.log('Room4 Joined')
            currentRoom = 'Bored Room'
            roomId = 'room4'
            oldroomname = 'Team Territory'
            console.log(`Current Room: ${currentRoom}`)
            socket.emit(specificBtn.room1, {
                currentRoom: 
                currentRoom, 
                roomId: roomId, 
                name: username.val(),
                oldroom: 'room3',
                oldroomname: 'Team Territory'})
        })

        
        // update the private chat enabled
        socket.on('privateWelcome', (data)=>{
            console.log(data);
            chatroom.append(
                `<p class="updateMessage text-center" >${data.welcomeMsg}.</p>`  
            )
        })
        //updating the current room.
        socket.on('roomUpdate', (data)=>{
            console.log(newConnName)
            console.log(username.val())
            chatroom.append(`
                <p class="updateMessage text-center" >${data.message}.</p>
            `)
        })

        socket.on('roomLeft', (data)=>{
            console.log(data+ 'roomleft')
            chatroom.append(`
                <p class="updateMessage text-center" >${data.message}.</p>
            `)
        })
        //emit specific room on button click
        messageSend.click(function () {
            // roomId = 'room1'
            socket.emit(specificBtn.messageSend, { message: message.val(), room: roomId, oldroomname:oldroomname })
        })
        
    
        socket.on('message', (data)=>{
            feedback.html('');
            message.val('');
            console.log()
            chatroom.append(
                `<p class='chat-message'> ${data.username}: ${data.message}
                    </br> <small class="chat-message-dateTime">${data.date} ${data.time}</small>
                </p>`
            )
        })

    }

})