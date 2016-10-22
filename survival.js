var GameState = function(game) { // pass the game instance
};

// Load images and sounds
GameState.prototype.preload = function() {
    this.game.load.image('circle', '/static/images/circle.png');
};

// Setup the example
GameState.prototype.create = function() {
    this.game.stage.backgroundColor = 0x333333;
    num_food = 50;
    food_size = 0.02;
    agent_ini_size = 0.05 // initial agent size
    
    this.create_agent1();
    this.create_agent2();
    
    // create food group
    foods = this.add.group();
    foods.enableBody = true;
    for (var i = 0; i < num_food; i++)
    {
        var food = foods.create(this.world.randomX, this.world.randomY, 'circle');
        food.scale.set(food_size); // size of agent
        food.anchor.setTo(0.5, 0.5);
    }
    
    // set keyboard input
    agent1_cursors = this.input.keyboard.createCursorKeys();    
    agent2_cursors = {
        up: this.input.keyboard.addKey(Phaser.Keyboard.W),
        down: this.input.keyboard.addKey(Phaser.Keyboard.S),
        left: this.input.keyboard.addKey(Phaser.Keyboard.A),
        right: this.input.keyboard.addKey(Phaser.Keyboard.D)
    }
    
    // Create a bitmap texture for drawing lines
    this.bitmap = this.game.add.bitmapData(this.game.width, this.game.height);
    this.bitmap.context.fillStyle = 'rgb(255, 255, 255)';
    this.bitmap.context.strokeStyle = 'rgb(255, 255, 255)';
    this.game.add.image(0, 0, this.bitmap);
};

GameState.prototype.create_agent1 = function() {    
    agent1 = this.game.add.sprite(this.world.randomX, this.world.randomY, 'circle');
    agent1.scale.set(agent_ini_size); // size of agent
    agent1.anchor.setTo(0.5, 0.5); // set the pivot point of the ship to the center of the texture
    agent1.tint = Math.random() * 0xffffff; // assign random color to the agent
    this.game.physics.enable(agent1, Phaser.Physics.ARCADE);
}

GameState.prototype.create_agent2 = function() {    
    agent2 = this.game.add.sprite(this.world.randomX, this.world.randomY, 'circle');
    agent2.scale.set(agent_ini_size); // size of agent
    agent2.anchor.setTo(0.5, 0.5); // set the pivot point of the ship to the center of the texture
    agent2.tint = Math.random() * 0xffffff; // assign random color to the agent
    this.game.physics.enable(agent2, Phaser.Physics.ARCADE);
}

// let agent eat food when they touch
GameState.prototype.eat_food = function(agent, food) {    
    food.kill();
    food.reset(this.rnd.integerInRange(0,this.world.width),this.rnd.integerInRange(0,this.world.height)); //  recreate food in a random position
    agent.scale.set(agent.scale['x'] += 0.0001/agent.scale['x']*2) // enlarge the agent
};

// let larger agent eat smaller agent when they touch
GameState.prototype.eat_agent = function(agent1, agent2) {  
       if (agent1.scale['x'] > agent2.scale['x']) {
            agent1.scale.set(agent1.scale['x'] += agent2.scale['x']*0.1) // enlarge agent1 by 10% of agent2
            agent2.kill(); 
            this.create_agent2();
       }
       else if (agent2.scale['x'] > agent1.scale['x']) {
            agent2.scale.set(agent2.scale['x'] += agent1.scale['x']*0.1) // enlarge agent2 by 10% of agent1
            agent1.kill();
            this.create_agent1();
       }   
}

// sensor to detect the closest food point
GameState.prototype.sensor_on_food = function(agent, foods) {
    agent_food_distance = [];
    for (i=0; i<num_food; i++){ // calculate the distance from agent to all food points
        agent_food_distance.push(Math.sqrt((agent.x-foods.children[i]['position']['x'])**2+(agent.y-foods.children[i]['position']['y'])**2)) // append L2 distance
    }
    min_agent_food_distance = Math.min.apply(Math,agent_food_distance) // find the shortest distance
    min_index_agent_food_distance = agent_food_distance.indexOf(min_agent_food_distance) // index of the food point with the shortest distance
    
    // Draw a line from agent to the closest food at every frame
    var agent_food_line = new Phaser.Line(agent.x, agent.y, foods.children[min_index_agent_food_distance]['position']['x'], foods.children[min_index_agent_food_distance]['position']['y']); // (starting coordinates x and y,ending coordinates x and y)
    this.bitmap.context.beginPath();
    this.bitmap.context.moveTo(agent.x, agent.y); // starting coordinates
    this.bitmap.context.lineTo(foods.children[min_index_agent_food_distance]['position']['x'], foods.children[min_index_agent_food_distance]['position']['y']); // ending coordinates
    this.bitmap.context.stroke();
    return min_agent_food_distance
}

// sensor to detect the distance and angle of the other agent
GameState.prototype.sensor_on_agent = function(agent1, agent2) {
    dis_between_agents =  Math.sqrt((agent1.x-agent2.x)**2+(agent1.y-agent2.y)**2)
    return dis_between_agents
}

// The update() method is called every frame
GameState.prototype.update = function() {
    // sensor to detect the closest food point
    // Clear the bitmap where we are drawing our lines
    this.bitmap.context.clearRect(0, 0, this.game.width, this.game.height);
    a1_food_dis = this.sensor_on_food(agent1,foods);
    a2_food_dis = this.sensor_on_food(agent2,foods);
    dis_between_agents= this.sensor_on_agent(agent1,agent2);
    // This just tells the engine it should update the texture cache
    this.bitmap.dirty = true;
    
    
    // Add/Update game readings
    $('#agent1_size').html("Agent1 size: "+(agent1.scale['x']/agent_ini_size).toFixed(2)); 
    $('#agent2_size').html("Agent2 size: "+(agent2.scale['x']/agent_ini_size).toFixed(2)); 
    $('#agent1_food_dis').html("Distance between Agent1 and closest food point: "+a1_food_dis.toFixed(2));
    $('#agent2_food_dis').html("Distance between Agent2 and closest food point: "+a2_food_dis.toFixed(2));
    $('#agent_dis').html("Distance between Agent1 and Agent2: "+dis_between_agents.toFixed(2));
    
    
    // agent1 manual control using arrows
    if (agent1_cursors.left.isDown)
    {
        agent1.x--;
        agent1.scale.set(agent1.scale['x'] -= agent1.scale['x']*0.0001) // every time agent moves, it'll decrease its size by 0.01%.
    }
    else if (agent1_cursors.right.isDown)
    {
         agent1.x++;
         agent1.scale.set(agent1.scale['x'] -= agent1.scale['x']*0.0001)
    }

    if (agent1_cursors.up.isDown)
    {
         agent1.y--;
         agent1.scale.set(agent1.scale['x'] -= agent1.scale['x']*0.0001)
    }
    else if (agent1_cursors.down.isDown)
    {
         agent1.y++;
         agent1.scale.set(agent1.scale['x'] -= agent1.scale['x']*0.0001)
    }
    
    // agent2 manual control using WSAD
    if (agent2_cursors.left.isDown)
    {
        agent2.x--;
        agent2.scale.set(agent2.scale['x'] -= agent2.scale['x']*0.0001) // every time agent moves, it'll decrease its size by 0.01%.
    }
    else if (agent2_cursors.right.isDown)
    {
         agent2.x++;
         agent2.scale.set(agent2.scale['x'] -= agent2.scale['x']*0.0001)
    }

    if (agent2_cursors.up.isDown)
    {
         agent2.y--;
         agent2.scale.set(agent2.scale['x'] -= agent2.scale['x']*0.0001)
    }
    else if (agent2_cursors.down.isDown)
    {
         agent2.y++;
         agent2.scale.set(agent2.scale['x'] -= agent2.scale['x']*0.0001)
    }
    
    // Keep the ship on the screen
    // Whenever the ship go outof boundries, let it appear on the other side 
    if (agent1.x > this.game.width) agent1.x = 0;
    if (agent1.x < 0) agent1.x = this.game.width;
    if (agent1.y > this.game.height) agent1.y = 0;
    if (agent1.y < 0) agent1.y = this.game.height;
    
    if (agent2.x > this.game.width) agent2.x = 0;
    if (agent2.x < 0) agent2.x = this.game.width;
    if (agent2.y > this.game.height) agent2.y = 0;
    if (agent2.y < 0) agent2.y = this.game.height;
    
    // call eat_food function when collide
    this.physics.arcade.overlap(agent1, foods, this.eat_food, null, this) //(object1, object2, function to be called when overlap is detected, process callback?, the callback contaxt that allows us to access the out-of-function variables)
    this.physics.arcade.overlap(agent2, foods, this.eat_food, null, this)
    
    // call eat_agent function when collide
    this.physics.arcade.overlap(agent1, agent2, this.eat_agent, null, this)
    
};

