const express = require('express');
const mongoose = require('mongoose');
const Chat = require('./models/chat');
const Log = require('./models/log');
const moment  = require('moment');
const app = express();
const PORT = process.env.PORT || 3000;


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
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology:true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// mongoose.connect(db_url, { useUnifiedTopology: true, useNewUrlParser: true })
//     .then(console.log('Database is connected....!'))
//     .catch((error) => { `Database Error: ${error}` })


//socket.io instantiation
const io = require('socket.io')(server)
let count = 1;
//listening on every connection
io.on('connection', (client) => {
    console.log('*************')
    console.log('New user connected' + count);

    
    client.username = "Anonymous" + count;
    count++;

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
    io.on('disconnect', ()=> {
        console.log('Server/User Disconnected');
        logSave({
            logtype: 'offline',
            name: client.username,
            message: `${client.username}  left the chat.`
        })
    })
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
        if(data.username == ""){
            sendNotification('Error', `${client.username}`,  `Please enter your nickname.`)
        }
        else{
            let oldname = client.username;
            client.username = data.username;
            client.broadcast.emit("changeUsername");
            sendNotification('Username Changed', `${client.username}`,  `${oldname} is now ${client.username}`);
    
        }
        
        // async function changeUsername(){
        //     Chat.find({sender: data.username}, (err, result)=> {
        //         if(err) console.log(`Username find error: ${err}`)
        //         else{
        //             console.log(result);
        //             if(!result){
        //                 
        //             }
        //             else{
        //                 sendNotification(`${client.username} is already in used.`)
        //             }
        //         }

        //     })
        // }
        // changeUsername();

    })

    //emit message 
    client.on('message', (data) => {
        let message = data.message;
        let username = client.username;
        let room = 'Living Room'
        let date = moment().format('MMMM Do, YYYY');
        let time = moment().format('HH:mm')
        //check for name and message
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
                console.log(result)
                io.sockets.emit('message',
                    { message: result.message, 
                        username: result.sender, 
                        room: room, 
                        date: date,
                        time: time })
            }

            saveChat();
            // sendStatus('Message Sent');
        }

    })

    //show typing....
    client.on('typing', (data) => {
        client.broadcast.emit('typing', { username: client.username })
    })

    client.on('update', ()=> {
        client.broadcast.emit('update')
    })



})