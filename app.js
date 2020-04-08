const express = require('express');
const mongoose = require('mongoose');
const Chat = require('./models/chat');
const Log = require('./models/log');
const moment = require('moment');
const app = express();
const PORT = process.env.PORT || 4000;


//set the template the engine
app.set('view engine', 'ejs')

//middleware
app.use(express.static('public'))

//routes
app.use('/', (req, res) => {
    res.render('index');
})


//listening on port
server = app.listen(PORT, () => console.log(`Server is listening on ${PORT}.`));

//Database connection..
const db_url = 'mongodb+srv://local_library_user:local_library@cluster0-nhau9.azure.mongodb.net/capodicapi?retryWrites=true&w=majority';
var mongoDB = process.env.MONGODB_URI || db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// mongoose.connect(db_url, { useUnifiedTopology: true, useNewUrlParser: true })
//     .then(console.log('Database is connected....!'))
//     .catch((error) => { `Database Error: ${error}` })

let count = 1;
let oldRoom;
//socket.io instantiation
const io = require('socket.io')(server)

//listening on every connection
io.on('connection', (client) => {
    console.log('*************')
    console.log('New user connected' + count);


    client.username = "Anonymous" + count;
    count++;
    client.room = "room1"
    async function logSave(data) {
        const log = new Log({
            logType: data.logtype,
            name: data.name,
            message: data.message,
        })

        const result = await log.save();
        console.log(`******LOG TABLE*******`)
        console.log(result);
    }
    
    //disconnect
    
    //new-user connected notification
    client.on('newUser', (data) => {
        io.sockets.emit('newUser', { username: client.username })
        logSave({ logtype: "new user", name: `${client.username}`, message: `${client.username} joined the chat` })

    })

    //default username

    //send status online/offline
    sendNotification = (type, name, status) => {
        io.sockets.emit('status', status);
        logSave({ logtype: type, name: name, message: status })
    }

    //change username
    client.on('changeUsername', (data) => {
        if (data.username == "") {
            sendNotification('Error', `${client.username}`, `Please enter your nickname.`)
        }
        else {
            let oldname = client.username;
            client.username = data.username;
            client.broadcast.emit("update", {oldname: oldname, newname: client.username});
            sendNotification('Username Changed', `${client.username}`, `${oldname} is now ${client.username}`);

        }

    })


    //show typing....
    client.on('typing', (data) => {
        client.broadcast.emit('typing', { username: client.username })
    })

    client.on('update', () => {
        io.sockets.emit('update')
    })

    /***Search user chat history and logs */
    client.on('history', (data)=>{
        console.log(data)
        if(data === ''){
            sendNotification('Error', `${client.username}`, `Please fill the field first.`);
        }
        else{

            async function history(){
                
                
               const result = await Chat
                .find({sender: data})
                // .skip((pageNumber -1) * pageSize)
                .limit(10)
                .sort({date: -1, time: -1})
                console.log('*****Retrieved Chat of Specific User*******')
                console.log(result);

                client.emit('history', result);
            }
            async function logs(){
                const result = await Log
                    .find({name: data})
                    .limit(10)
                    .sort({date:-1})
                console.log('*****Retrieved Logs of Specific User*******')
                console.log(result);
                client.emit('log', result)
            }
            history();
            logs();

        }
    })

    //onclick on btn  room1
    client.on('room1', (room) => {
        oldRoom = room.oldroom;
        
        client.join(room.roomId);
        
        //emit the welcome msg
        client.emit('privateWelcome', { welcomeMsg: `Welcome to ${room.currentRoom}` })
        logSave({ logtype: "New Room", name: room.name, message: `${room.name} joined ${room.currentRoom}` })
        //this will go in logtable
        io.to(room.roomId).emit('roomUpdate', {
            message: `${room.name} joined ${room.currentRoom}`,
        })

        client.leave(oldRoom,()=>{
            // console.log(room.name+'user left '+ oldRoom);
            logSave({ logtype: 'Room Left', name: room.name, message: `${room.name} left ${room.oldroomname}` })
            io.to(oldRoom).emit('roomUpdate', {
                message: `${room.name} left ${room.oldroomname}`
            })

        })
        
    })

    //emit message 
    client.on('message', (data) => {

        let message = data.message;
        let username = client.username;
        let room = data.room;
        let date = moment().format('MMMM Do, YYYY');
        let time = moment().format('h:mm');
        //check for name and message
        // console.log('room inside message event '+ room)
        if (message == '') {
            //send status
            sendNotification('Error', username, 'Please enter your message.')
        }
        else {
            async function saveChat() {
                const chat = new Chat({
                    sender: username,
                    message: message,
                    room: room,
                    date: date,
                    time: time
                })
                const result = await chat.save();
                // console.log('else worked')
                console.log('********CHAT SAVED*******')
                console.log(result)
                // console.log(room)
                io.to(room).emit('message', {
                    username: result.sender,
                    message: result.message,
                    room: room,
                    date: date,
                    time: time
                })
                // return result;   
            }

            if(room === 'room2'){
                // console.log(room)
                console.log('chats of only room2')
                saveChat();

            }
            else if(room === 'room3'){
                // console.log(room)
                console.log('chats of only room3')
                saveChat();

            }
            else if(room === 'room4'){
                // console.log(room)
                console.log('chats of only room4')
                saveChat();

            }
            else{
                console.log(`all generic chats`)
                async function communityChat() {
                    const chat = new Chat({
                        sender: username,
                        message: message,
                        room: room,
                        date: date,
                        time: time
                    })
                    const result = await chat.save();
                    // console.log('else worked')
                    console.log('********CHAT SAVED*******')
                    console.log(result)
                    // console.log(room)
                    io.sockets.emit('message', {
                        username: result.sender,
                        message: result.message,
                        room: room,
                        date: date,
                        time: time
                    })
                    // return result;   
                }
    
                communityChat();
            }
            // saveChat();
            
        }
    })

})