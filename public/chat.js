$(function () {

    //make socket connection
    var socket = io.connect('https://capodicapi.herokuapp.com/');

    //grab all the buttons and inputs
    var username = $('#username');
    var usernameSend = $('#usernameSend');
    var chatroom = $('#chatroom');
    var feedback = $('#feedback');
    var message = $('#message')
    var messageSend = $('#messageSend');
    var onlineUser = $('#onlineUser')
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


        //emit message on button click
        messageSend.click(function () {
            socket.emit('message', { message: message.val() })
        })

        //emit username on button click
        usernameSend.click(() => {
            socket.emit('changeUsername', { username: username.val() })
            oldConnName = newConnName;
            newConnName = username.val();
            socket.emit('update');
            
            // document.getElementById(newConnName).innerHTML = username.val();

        });
        socket.on('update', ()=>{
            chatroom.append(`
                <p class="updateMessage text-center" >${oldConnName} is now ${username.val()}.</p>
            `)
        })

        //emit typing..

        //Listen on typing

        //display message on screen
        socket.on('message', (data) => {
            feedback.html('');
            message.val('');
            console.log()
            chatroom.append(
                `<p class='chat-message'> ${data.username}: ${data.message}
                    </br> <small class="chat-message-dateTime">${data.date} ${data.time}</small>
                </p>`
            )

        });

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


    }

})