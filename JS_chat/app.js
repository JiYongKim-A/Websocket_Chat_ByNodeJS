// 서버측 
const express = require('express'); // express 불러옴
const port = 5000; //포트 5000번 고정
const http = require('http'); // http 모듈 
const path = require('path'); //path 모듈
const socketModule = require('socket.io'); //socket.io 모듈
const moment = require('moment');

const app = express();
const server = http.createServer(app);
const io = socketModule(server);



const namelist = [] // 사용자들 이름 입력시 여기에 저장함


app.use(express.static(path.join(__dirname, "Client")))

io.on("connection", (socket)=>{


    socket.on("naming",(naming)=>{ // 사용자 이름 받아올때 사용하는 소켓

        socket.id = naming // 소켓id 자체를 자신이 사용하는 이름으로 바꿈  소켓 id 자체를 사용자 이름으로 만든이유는
                        // disconnect 발생시 나가는사람 이름을 보내려고 했는데 그 이름변수를 받아올 수가 없었음 근데
                        // socket.id 값은 가능해서 처음부터 socket.id 에 이름을 적용시킨것 
                        
        namelist.push(naming) // namelist에 사용자 이름 넣음

        io.emit("naming", namelist, naming) // namelist를 다시 client js로 보냄
        
    })


    socket.on("chatSocket",(socketData)=>{// 전체채팅시 사용하는 소켓

        io.emit("chatSocket",{ //받은 소켓의 데이터를  객체형식으로 모아서 client.js로 보내줌
            name : socketData.name,
            message : socketData.message,
            time : moment(new Date()).format("h:ss A")  
             
        })

    })

    socket.on("partChatSocket", (data)=>{ // 귓속말에 사용하는 소켓
        io.emit("partChatSocket",{ // 귓속말 소켓을 받았을때 전체채팅과 같은방식으로 데이터를 client.js 로 보내준다.
            name: data.name,
            message : data.message,
            time: moment(new Date()).format("h:ss A"),
            // 여기서의 type은 귓속말을 보냈을때 모든 사용자가 이 소켓을 받고 그중에 data.type이 자신의 이름과 동일할때 html 리스트
            //에 추가 시키게 하여 귓속말을 구현함
            type : data.type 

        })
    })

    socket.on("disconnect",()=>{ // 여기부분은  사용자가 나갈시 disconnect event가 발생하는데 서버는 disconnect로 
                                // 사용자가 나갔을때 어떻게 하겠다고 구현한 곳

        namelist.pop(socket.id) //나간 사용자이름을 namelist에서 삭제
        io.emit("userDisconnect", socket.id) // userDisconnect 소켓으로  client.js에게 나간사용자 이름 보냄
    })





})

server.listen(port,()=>console.log(`${port}Port Server is open!!`))
