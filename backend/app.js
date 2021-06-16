const express = require('express')
const _connstring = require("./credentials")
const { MongoClient } = require("mongodb");
var bodyParser = require('body-parser')
var crypto = require('crypto'); 

const app = express()
// app.use(bodyParser.urlencoded())
// app.use(express.json())

let port = process.env.PORT;
if (port == null || port == "") {
	port = 10991;
}

let mongoClient // global mongo client variable
mongoClient = new MongoClient(_connstring, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
mongoClient.connect()

app.use(function(req, res, next) {
    // console.log("here")
    if (req.query.username && req.query.password) {
        admin_addIP(req.query.username, req.query.password, req.headers['x-forwarded-for'])
    }
    next()
})

app.get('/', (req, res) => {
	res.send('Hello World!')
    // console.log(req.socket.remoteAddress)
    // console.log(req.headers['x-forwarded-for'])
})

app.get('/create', async (req, res) => {
    if (req.query.username && req.query.password) {
        await new Promise(async (res, err) => {
            //let mongoClient
            try {
                // mongoClient = new MongoClient(_connstring, {
                //     useNewUrlParser: true,
                //     useUnifiedTopology: true,
                // })
                // await mongoClient.connect();
                const database = mongoClient.db('sigma');
                const users = database.collection('users');

                const query = { username: req.query.username }; // round
                const userExists = await users.findOne(query);
                if (userExists) {
                    res(-1)
                } else {
                    const salt = crypto.randomBytes(16).toString('hex'); 
                    const hash = crypto.pbkdf2Sync(req.query.password, salt, 1000, 64, `sha512`).toString(`hex`); 
                    const user = {username: req.query.username, password: hash, salt: salt}
                    const result = await users.insertOne(user);
                    res(result)
                }              
            } finally {
                //await mongoClient.close();
            }
        })
        .then(result => {
            if (result.insertedCount === 1) {
                // successfully created user
                res.json({
                    success: 1,
                    info: "created user"
                })
                // res.send("created user!")
            } else if (result === -1) {
                // res.send("user already exists ...")
                res.json({
                    success: 0,
                    info: "user already exists"
                })
            } else {
                // res.send("failed to create user")
                res.json({
                    success: 0,
                    info: "generic failure to create user"
                })
            }
        })
    } else {
        res.json({
            success: 0,
            info: "generic failure to create user"
        })
    }
})

async function Auth(username, password) {
    return new Promise(async (res, err) => {
        let res_value = {
            success: 0
        }
        if (!username || !password) {
            res_value = {
                success: 0
            }
            res(res_value)
        } else {
            //let mongoClient
            try {
                // mongoClient = new MongoClient(_connstring, {
                //     useNewUrlParser: true,
                //     useUnifiedTopology: true,
                // })
                // await mongoClient.connect();
                const database = mongoClient.db('sigma');
                const users = database.collection('users');
                let queryRegex = new RegExp("^" + username + "$", "i")
                const query = { username: queryRegex };
                const userExists = await users.findOne(query);
                if (userExists) {
                    const hash = crypto.pbkdf2Sync(password, userExists.salt,  
                        1000, 64, `sha512`).toString(`hex`);
                    if (hash == userExists.password) {
                        res_value = {
                            success: 1
                        }
                    } else {
                        res_value = {
                            success: 0
                        }
                    }
                } else {
                    res_value = {
                        success: 0
                    }
                }
            } finally {
                //await mongoClient.close();
                res(res_value)
            }
        }
    })
}

async function admin_addIP(un, pwd, ip) {
    Auth(un, pwd).then(
        async auth => {
            console.log("here")
            console.log(auth)
            if (auth.success) {
                console.log("here")
                const database = mongoClient.db('sigma');
                const users = database.collection('users');
                const query = { username: un }
                users.updateMany({
                    "ips": {"$exists": false}
                }, {
                    "$set": {"ips" : []}
                }, {upsert: false})
                if (ip) {
                    users.updateOne(query, {
                        "$addToSet": {
                            ips: ip
                        }
                    }, {upsert: false})
                }
            }
        }
    )
}

app.get('/login', async (req, res) => {
    let res_value = {
        success: 0
    }

    await Auth(req.query.username, req.query.password)
    .then(res => res_value = res)

    res.json(res_value)
})

app.get('/create_circle', async (req, res) => {
    let res_value = {
        success: 0
    }
    await new Promise(async (res, err) => {
        if (!req.query.username || !req.query.password || !req.query.circleName
            || !req.query.circleVis || !req.query.circleInfo) {
            res()
        } else {
            //let mongoClient
            try {
                // mongoClient = new MongoClient(_connstring, {
                //     useNewUrlParser: true,
                //     useUnifiedTopology: true,
                // })
                // await mongoClient.connect();
                const database = mongoClient.db('sigma');
                let userLegit = await Auth(req.query.username, req.query.password)
                userLegit = userLegit.success

                if (userLegit) {
                    const circles = database.collection('circles');
                    const query = { name: req.query.circleName };
                    const circleExists = await circles.findOne(query);

                    if (!circleExists) {
                        let infoText
                        if (req.query.circleInfo) {
                            infoText = req.query.circleInfo
                        } else {
                            infoText = "Hey! I just created my own circle."
                        }
                        const circle = {name: req.query.circleName, vis: req.query.circleVis, members: {
                            [req.query.username] : [0]
                                // username: ,
                                // flairs: [0],
                                // visroles: ["owner"],
                                // hidroles: ["creator", "flair0"]
                        }, pendingUsers: [], bannedUsers: [], flairs: [
                            {
                                name: "Owner",
                                id: 0,
                                active: 1,
                                power: 0,
                                // allowAssignFlairs: 1,
                                allowCreateFlairs: 1,
                                allowAcceptMembers: 1
                            },
                            {
                                name: "Member",
                                id: 1,
                                active: 1,
                                power: 10,
                                // allowAssignFlairs: 1,
                                allowCreateFlairs: 0,
                                allowAcceptMembers: 0
                            }
                        ], infoText: infoText }
                        const result = await circles.insertOne(circle);
                        if (result.insertedCount == 1) {
                            res_value.success = 1
                        }
                    }
                }             
            } finally {
                //await mongoClient.close();
                res()
            }
        }
    })
    .then(result => {
        res.json(res_value)
    })
    .catch(result => {
        res.json({
            success: 0
        })
    })
    
})

async function FindCircles(username, password, searchString) { 
    // includes user auth and checks if user is in circle
    // circle found is passed under .circle
    return new Promise(async (res, err) => {
        let res_value = {
            success: 0
        }
        if (!username || !password || !searchString) {
            res(res_value)
        } else {
            //let mongoClient
            try {
                // mongoClient = new MongoClient(_connstring, {
                //     useNewUrlParser: true,
                //     useUnifiedTopology: true,
                // })
                // await mongoClient.connect();
                const database = mongoClient.db('sigma');
                let userLegit = await Auth(username, password)
                userLegit = userLegit.success

                if (userLegit) {
                    const circles = database.collection('circles');
                    let query
                    if (searchString == -1) {
                        query = {}
                    } else {
                        query = { name: searchString }
                    }
                    // const query = ;
                    const cursor = await circles.find(query);
                    res_value.success = 1
                    res_value.cursor = cursor
                    
                }
                // console.log("here")
                //await mongoClient.close();    
            } finally {
                // //await mongoClient.close();
                res(res_value)
            }
        }
    })
}

async function GetCircle(username, password, circleName, dontbelong = false) { 
    // includes user auth and checks if user is in circle
    // circle found is passed under .circle
    return new Promise(async (res, err) => {
        let res_value = {
            success: 0
        }
        if (!username || !password || !circleName) {
            res(res_value)
        } else {
            //let mongoClient
            try {
                // mongoClient = new MongoClient(_connstring, {
                //     useNewUrlParser: true,
                //     useUnifiedTopology: true,
                // })
                // await mongoClient.connect();
                const database = mongoClient.db('sigma');
                let userLegit = await Auth(username, password)
                userLegit = userLegit.success

                if (userLegit) {
                    const circles = database.collection('circles');
                    const query = { name: circleName };
                    const circle = await circles.findOne(query);
                    if (circle) {
                        if (dontbelong) {
                            res_value.success = 1
                            res_value.circle = circle
                        } else if (username in circle.members) {
                            res_value.success = 1
                            res_value.circle = circle
                        } 
                    }
                }             
            } finally {
                //await mongoClient.close();
                res(res_value)
            }
        }
    })
}

async function SetCircle(circleName, newcircleData) {
    return new Promise(async (res, err) => {
        let res_value = {
            success: 0
        }
        if (!circleName || !newcircleData) {
            res(res_value)
        } else {
            //let mongoClient
            try {
                // mongoClient = new MongoClient(_connstring, {
                //     useNewUrlParser: true,
                //     useUnifiedTopology: true,
                // })
                // await mongoClient.connect();
                const database = mongoClient.db('sigma');

                const circles = database.collection('circles');
                const query = { name: circleName };
                const circle = await circles.findOne(query);
                if (circle) {
                    const options = {
                        upsert: false, // do not create a document if no documents match the query
                    };
                    const result = await circles.replaceOne(query, newcircleData, options);
                    if (result.modifiedCount === 1) {
                        res_value.success = 1
                    }
                }
            } finally {
                //await mongoClient.close();
                res(res_value)
            }
        }
    })
}

async function MinFlair(username, password, circleName, assignBypass = false) {
    return new Promise(async (res, err) => {
        let res_value = {
            success: 0
        }
        if (!username || !password || !circleName) {
            res(res_value)
        } else {
            //let mongoClient
            try {
                // mongoClient = new MongoClient(_connstring, {
                //     useNewUrlParser: true,
                //     useUnifiedTopology: true,
                // })
                // await mongoClient.connect();
                const database = mongoClient.db('sigma');
                let userLegit = await Auth(username, password)
                userLegit = userLegit.success

                if (userLegit) {
                    const circles = database.collection('circles');
                    const query = { name: circleName };
                    const circle = await circles.findOne(query);
                    // console.log(circle)
                    if (circle) {
                        if (username in circle.members) {
                            let userflairs = circle.members[username]
                            let minFlairPower = -1
                            let minFlair
                            for (let flairId of userflairs) {
                                let flair = circle.flairs[flairId]
                                if (flair.allowCreateFlairs || assignBypass) {
                                    console.log("here", flair.power)
                                    if (minFlairPower == -1) {
                                        minFlairPower = flair.power
                                        minFlair = flair
                                    } else {
                                        console.log(minFlairPower)
                                        if (flair.power < minFlairPower) {
                                            minFlair = flair
                                            minFlairPower = flair.power
                                        }
                                        
                                    }
                                }
                            }
                            if (minFlairPower != -1) {
                                // can create flairs
                                res_value = {
                                    success: 1,
                                    power: minFlair.power,
                                    // allowAssignFlairs: minFlair.allowAssignFlairs,
                                    allowCreateFlairs: minFlair.allowCreateFlairs,
                                    allowAcceptMembers: minFlair.allowAcceptMembers
                                }
                            }
                        }
                    }
                }             
            } finally {
                //await mongoClient.close();
                res(res_value)
            }
        }
    })
}

app.get('/create_flair_info', async (req, res) => {
    await MinFlair(req.query.username, req.query.password, req.query.circleName)
    .then(result => {
        res.json(result)
    })
    .catch(result => {
        res.json({
            success: 0
        })
    })
    
})

app.get('/create_flair', async (req, res) => {
    let res_value = {
        success: 0
    }
    return new Promise(async (res, err) => {
        if (!req.query.username || !req.query.password || !req.query.circleName 
            || !req.query.flairName || !req.query.flairPower /*|| !req.query.flairAssign*/
            || !req.query.flairCreate || !req.query.flairAccept) {
                // checks for all required params
                res()
            } else {
                await MinFlair(req.query.username, req.query.password, req.query.circleName)
                .then(async minFlair => {
                    if (minFlair.success) { // managed to find the user's flair creation abilities
                        if (req.query.flairPower >= minFlair.power) {
                            if (req.query.flairCreate <= minFlair.allowCreateFlairs && 
                                /*req.query.flairAssign <= minFlair.allowAssignFlairs && */
                                req.query.flairAccept <= minFlair.allowAcceptMembers) {
                                    // flair intending to create is under valid permissions
                                    await GetCircle(req.query.username, req.query.password, req.query.circleName)
                                    .then(async circleRes => {
                                        if (circleRes.success) { // found target circle
                                            let flairExists = false // checks if target flair already exists
                                            for (let testflair of circleRes.circle.flairs) {
                                                console.log(testflair.name, req.query.flairName)
                                                if (testflair.name == req.query.flairName) {
                                                    flairExists = true
                                                    break
                                                }
                                            }
                                            if (!flairExists) {
                                                circleRes.circle.flairs.push({
                                                    name: req.query.flairName,
                                                    id: circleRes.circle.flairs.length,
                                                    active: 1,
                                                    power: req.query.flairPower,
                                                    /*allowAssignFlairs: req.query.flairAssign,*/
                                                    allowCreateFlairs: req.query.flairCreate,
                                                    allowAcceptMembers: req.query.flairAccept
                                                }) // updates the current circle and updates the server with it
                                                setCircleRes = await SetCircle(req.query.circleName, circleRes.circle)
                                                if (setCircleRes.success) {
                                                    res_value.success = 1
                                                    // res()
                                                }
                                            }
                                        }
                                    })
                                }
                        }
                    }
                })
                res()
            }
    })
    .then(result => {
        res.json(res_value)
    })
})

app.get('/get_members', async (req, res) => {
    let res_value = {
        success: 0
    }
    return new Promise(async (res, err) => {
        if (!req.query.username || !req.query.password || !req.query.circleName) {
                // checks for all required params
                res()
            } else {
                await GetCircle(req.query.username, req.query.password, req.query.circleName)
                .then(async circleRes => {
                    if (circleRes.success) { // user auth AND found target circle
                        let circle = circleRes.circle
                        res_value.success = 1
                        for (let member in circle.members) {
                            let memberFlairList = []
                            for (let flair of circle.members[member]) {
                                let targetFlair = circle.flairs[parseInt(flair)]
                                if (targetFlair.active == 1) {
                                    memberFlairList.push(targetFlair.name)
                                }
                            }
                            circle.members[member] = memberFlairList
                        }
                        res_value.members = circle.members
                    }
                })
                res()
            }
    })
    .then(result => {
        res.json(res_value)
    })
})

app.get('/assign_flair_info', async (req, res) => {
    let res_value = {
        success: 0
    }
    return new Promise(async (res, err) => {
        if (!req.query.username || !req.query.password || !req.query.circleName || !req.query.newuser) {
                // checks for all required params
                res()
            } else {
                if (req.query.newuser == 1) {
                    await GetCircle(req.query.username, req.query.password, req.query.circleName, true)
                        .then(async circleRes => {
                            if (circleRes.success) { // found target circle
                                let availableFlairs = []
                                for (let testflair of circleRes.circle.flairs) {
                                    console.log(circleRes.circle.flairs[1].power)
                                    if (testflair.power > circleRes.circle.flairs[1].power) { // corresponds to default power
                                        availableFlairs.push(testflair)
                                    }
                                }
                                res_value.success = 1
                                res_value.availableFlairs = availableFlairs
                            }
                        })
                } else {
                    await MinFlair(req.query.username, req.query.password, req.query.circleName, true)
                    .then(async minFlair => {
                        if (minFlair.success) { // managed to find the user's flair creation abilities
                            // flair intending to create is under valid permissions
                            await GetCircle(req.query.username, req.query.password, req.query.circleName)
                            .then(async circleRes => {
                                if (circleRes.success) { // found target circle
                                    let availableFlairs = []
                                    if (minFlair.power == circleRes.circle.flairs[1].power) {
                                        minFlair.power += 1
                                    }
                                    for (let testflair of circleRes.circle.flairs) {
                                        if (testflair.power >= minFlair.power) {
                                            availableFlairs.push(testflair)
                                        }
                                    }
                                    res_value.success = 1
                                    res_value.availableFlairs = availableFlairs
                                }
                            })
                        }
                    })
                }
                res()
            }
    })
    .then(result => {
        res.json(res_value)
    })
})

app.get('/assign_flair', async (req, res) => {
    let res_value = {
        success: 0
    }
    return new Promise(async (res, err) => {
        if (!req.query.username || !req.query.password || !req.query.circleName
            || !req.query.flairNames || !req.query.targetUsernames) {
                // checks for all required params
                res()
            } else {
                let targetUsers = req.query.targetUsernames.split(",")
                let flairNames = req.query.flairNames.split("0")
                for (let x = 0; x < flairNames.length; x++) {
                    flairNames[x] = flairNames[x].split(",")
                }
                if (targetUsers.length == 1) {
                    targetUsers = Array(flairNames.length).fill(targetUsers[0])
                }
                if (targetUsers.length == flairNames.length) {
                    await MinFlair(req.query.username, req.query.password, req.query.circleName, true)
                    .then(async minFlair => {
                        if (minFlair.success) { // managed to find the user's flair creation abilities
                            // flair intending to create is under valid permissions
                            await GetCircle(req.query.username, req.query.password, req.query.circleName)
                            .then(async circleRes => {
                                if (circleRes.success) { // found target circle
                                    let circle = circleRes.circle
                                    let availableFlairs = []
                                    for (let testflair of circle.flairs) {
                                        if (testflair.power >= minFlair.power) {
                                            availableFlairs.push(testflair)
                                        }
                                    }
                                    targetUsers.forEach((targetUser, idx) => {
                                        let intendedFlairs = flairNames[idx]
                                        for (let intendedFlair of intendedFlairs) {
                                            let intendedFlair_id = -1
                                            if (targetUser in circle.members) {
                                                flairIsAvailable = false
                                                for (let testflair of availableFlairs) {
                                                    if (testflair.name == intendedFlair) {
                                                        intendedFlair_id = testflair.id
                                                        flairIsAvailable = true
                                                        break
                                                    }
                                                }
                                                if (flairIsAvailable) {
                                                    res_value.success = 1
                                                    // res_value.availableFlairs = availableFlairs
                                                    console.log(circle.members[targetUser])
                                                    if (circle.members[targetUser].includes(intendedFlair_id)) {
                                                        // target user already has the flair so remove it
                                                        // console.log(circle.members[targetUser])
                                                        circle.members[targetUser].splice(circle.members[targetUser].indexOf(intendedFlair_id), 1)
                                                    } else {
                                                        circle.members[targetUser].push(intendedFlair_id)
                                                    }
                                                }
                                            }
                                        }
                                    })
                                    SetCircle(circle.name, circle)
                                }
                            })
                        }
                    })
                }
                res()
            }
    })
    .then(result => {
        res.json(res_value)
    })
})

app.get('/join_circle', async (req, res) => {
    let res_value = {
        success: 0
    }
    return new Promise(async (res, err) => {
        if (!req.query.username || !req.query.password || !req.query.circleName) {
                // checks for all required params
                res()
            } else {
                await GetCircle(req.query.username, req.query.password, req.query.circleName, true)
                .then(async circleRes => {
                    if (circleRes.success) { // found target circle
                        let circle = circleRes.circle
                        if (circle.bannedUsers.includes(req.query.username)) {
                            res_value.info = "banned"
                        } else if (req.query.username in circle.members) {
                            res_value.info = "joined"
                        } else if (circle.pendingUsers.includes(req.query.username)) {
                            res_value.info = "pending"
                        } else {
                            if (circle.vis == "private") {
                                res_value.success = 1
                                circle.pendingUsers.push(req.query.username)
                            } else {
                                // successfully joined public server
                                res_value.success = 1
                                circle.members[req.query.username] = [1]
                            }
                            SetCircle(req.query.circleName, circle) // update circle with new info
                        }
                    }
                })
                res()
            }
        })
    .then(result => {
        res.json(res_value)
    })
})

app.get('/join_circle_status', async (req, res) => {
    let res_value = {
        success: 0
    }
    return new Promise(async (res, err) => {
        if (!req.query.username || !req.query.password || !req.query.circleName) {
                // checks for all required params
                res()
            } else {
                await GetCircle(req.query.username, req.query.password, req.query.circleName, true)
                .then(async circleRes => {
                    if (circleRes.success) { // found target circle
                        let circle = circleRes.circle
                        if (circle.bannedUsers.includes(req.query.username)) {
                            res_value.info = "banned"
                        } else if (req.query.username in circle.members) {
                            res_value.info = "joined"
                        } else if (circle.pendingUsers.includes(req.query.username)) {
                            res_value.info = "pending"
                        } else {
                            res_value.info = "unaffected"
                        }
                        res_value.success = 1
                    }
                })
                res()
            }
        })
    .then(result => {
        res.json(res_value)
    })
})

app.get('/leave_circle', async (req, res) => {
    let res_value = {
        success: 0
    }
    return new Promise(async (res, err) => {
        if (!req.query.username || !req.query.password || !req.query.circleName) {
                // checks for all required params
                res()
            } else {
                await GetCircle(req.query.username, req.query.password, req.query.circleName)
                .then(async circleRes => {
                    if (circleRes.success) { // found target circle
                        let circle = circleRes.circle
                        delete circle.members[req.query.username]
                        // console.log(circle)
                        SetCircle(circle.name, circle)
                        res_value.success = 1
                    }
                })
                res()
            }
        })
    .then(result => {
        res.json(res_value)
    })
})

app.get('/accept_member_info', async (req, res) => {
    let res_value = {
        success: 0
    }
    return new Promise(async (res, err) => {
        if (!req.query.username || !req.query.password || !req.query.circleName) {
                // checks for all required params
                res()
            } else {
                await MinFlair(req.query.username, req.query.password, req.query.circleName)
                .then(async minFlair => {
                    if (minFlair.success) { // managed to find the user's flair creation abilities
                        // flair intending to create is under valid permissions
                        await GetCircle(req.query.username, req.query.password, req.query.circleName)
                        .then(async circleRes => {
                            if (circleRes.success) { // found target circle
                                let circle = circleRes.circle
                                if (minFlair.allowAcceptMembers) {
                                    res_value.success = 1
                                    res_value.pendingUsers = circle.pendingUsers
                                }
                            }
                        })
                    }
                })
                res()
            }
    })
    .then(result => {
        res.json(res_value)
    })
})

app.get('/accept_member', async (req, res) => {
    let res_value = {
        success: 0
    }
    return new Promise(async (res, err) => {
        if (!req.query.username || !req.query.password || !req.query.circleName
            || !req.query.targetUsername || !req.query.action) {
                // checks for all required params
                res()
            } else {
                await MinFlair(req.query.username, req.query.password, req.query.circleName)
                .then(async minFlair => {
                    if (minFlair.success) { // managed to find the user's flair creation abilities
                        // flair intending to create is under valid permissions
                        await GetCircle(req.query.username, req.query.password, req.query.circleName)
                        .then(async circleRes => {
                            if (circleRes.success) { // found target circle
                                let circle = circleRes.circle
                                if (minFlair.allowAcceptMembers) {
                                    let targetUsername = req.query.targetUsername
                                    if (circle.pendingUsers.includes(targetUsername)) {
                                        if (req.query.action == "ban") {
                                            circle.pendingUsers.splice(circle.pendingUsers.indexOf(targetUsername), 1)
                                            circle.bannedUsers.push(targetUsername)
                                        } else if (req.query.action == "decline") {
                                            circle.pendingUsers.splice(circle.pendingUsers.indexOf(targetUsername), 1)
                                        }
                                         else {
                                            circle.pendingUsers.splice(circle.pendingUsers.indexOf(targetUsername), 1)
                                            circle.members[targetUsername] = [1]
                                        }
                                        SetCircle(circle.name, circle)
                                        res_value.success = 1
                                    }
                                }
                            }
                        })
                    }
                })
                res()
            }
    })
    .then(result => {
        res.json(res_value)
    })
})

app.get('/kick', async (req, res) => {
    let res_value = {
        success: 0
    }
    return new Promise(async (res, err) => {
        if (!req.query.username || !req.query.password || !req.query.circleName
            || !req.query.targetUsername || !req.query.ban) {
                // checks for all required params
                res()
            } else {
                await MinFlair(req.query.username, req.query.password, req.query.circleName)
                .then(async minFlair => {
                    if (minFlair.success) { // managed to find the user's flair creation abilities
                        if (minFlair.allowAcceptMembers) {
                            // flair intending to create is under valid permissions
                            await GetCircle(req.query.username, req.query.password, req.query.circleName)
                            .then(async circleRes => {
                                if (circleRes.success) { // found target circle
                                    let circle = circleRes.circle
                                    if (minFlair.allowAcceptMembers == 1) {
                                        let targetUsername = req.query.targetUsername
                                        if (targetUsername in circle.members) {
                                            delete circle.members[req.query.targetUsername]
                                        }
                                        if (req.query.ban == 1) {
                                            circle.bannedUsers.push(targetUsername)
                                        }
                                        SetCircle(circle.name, circle)
                                        res_value.success = 1
                                    }
                                }
                            })   
                        }
                    }
                })
                res()
            }
    })
    .then(result => {
        res.json(res_value)
    })
})

app.get('/get_circle_data', async (req, res) => {
    let res_value = {
        success: 0
    }
    return new Promise(async (res, err) => {
        if (!req.query.username || !req.query.password || !req.query.circleName) {
                // checks for all required params
                res()
            } else {
                await GetCircle(req.query.username, req.query.password, req.query.circleName, true)
                .then(async circleRes => {
                    if (circleRes.success) { // user auth AND found target circle
                        let circle = circleRes.circle
                        res_value.success = 1
                        delete circle.members
                        delete circle.pendingUsers
                        delete circle.bannedUsers
                        for (let x = 0; x < circle.flairs.length; x++) {
                            circle.flairs[x] = circle.flairs[x].name
                        }
                        res_value.circle = circle
                    }
                })
                res()
            }
    })
    .then(result => {
        res.json(res_value)
    })
})

app.get('/search_circles', async (req, res) => {
    let res_value = {
        success: 0
    }
    return new Promise(async (res, err) => {
        if (!req.query.username || !req.query.password || !req.query.searchstring) {
                // checks for all required params
                res()
            } else {
                await Auth(req.query.username, req.query.password)
                    .then(async auth => {
                        if (auth.success) {
                            let username = req.query.username
                            let password = req.query.password
                            let searchstring = req.query.searchstring
                            let results = new Set()
                            let sameRegex = new RegExp("^" + searchstring + "$", "i")
                            await FindCircles(username, password, sameRegex)
                            .then(async same => {
                                if (same.success) {
                                    await same.cursor.forEach(circle => {
                                        results.add(circle.name)
                                    })
                                    let startRegex = new RegExp("^" + searchstring, "i")
                                    await FindCircles(username, password, startRegex)
                                    .then(async start => {
                                        if (start.success) {
                                            await start.cursor.forEach(circle => {
                                                results.add(circle.name)
                                            })
                                            let semiRegex = new RegExp(searchstring, "i")
                                            await FindCircles(username, password, semiRegex)
                                            .then(async semi => {
                                                if (semi.success) {
                                                    await semi.cursor.forEach(circle => {
                                                        results.add(circle.name)
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                            results = Array.from(results)
                            res_value.success = 1
                            res_value.results = results
                        }
                    })
                res()
            }
    })
    .then(result => {
        res.json(res_value)
    })
})

app.get('/my_circles', async (req, res) => {
    let res_value = {
        success: 0
    }
    return new Promise(async (res, err) => {
        if (!req.query.username || !req.query.password) {
                // checks for all required params
                res()
            } else {
                await Auth(req.query.username, req.query.password)
                    .then(async auth => {
                        if (auth.success) {
                            let username = req.query.username
                            let password = req.query.password
                            let results = new Set()
                            await FindCircles(username, password, -1)
                            .then(async found => {
                                if (found.success) {
                                    // console.log(found)
                                    let allCircles = found.cursor
                                    await allCircles.forEach(circle => {
                                        console.log(circle)
                                        if (circle.members[username]) {
                                            let circleFlairs = []
                                            for (let flair of circle.flairs) {
                                                if (flair.active) {
                                                    circleFlairs.push(flair.name)
                                                }
                                            }
                                            results.add({
                                                name: circle.name,
                                                flairs: circleFlairs
                                            })
                                        }
                                    })
                                }
                            })
                            results = Array.from(results)
                            res_value.success = 1
                            results.sort(function(a, b) {
                                let textA = a.name.toUpperCase();
                                let textB = b.name.toUpperCase();
                                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                            });
                            res_value.results = results
                        }
                    })
                res()
            }
    })
    .then(result => {
        res.json(res_value)
    })
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})