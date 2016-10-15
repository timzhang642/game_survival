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

    
    this.create_agent1();
    this.create_agent2();
    
    // create food group
    foods = this.add.group();
    foods.enableBody = true;
    for (var i = 0; i < num_food; i++)
    {
        var food = foods.create(this.world.randomX, this.world.randomY, 'circle');
        food.scale.set(0.02); // size of agent
    }
    
    agent1_cursors = this.input.keyboard.createCursorKeys();    
    agent2_cursors = {
        up: this.input.keyboard.addKey(Phaser.Keyboard.W),
        down: this.input.keyboard.addKey(Phaser.Keyboard.S),
        left: this.input.keyboard.addKey(Phaser.Keyboard.A),
        right: this.input.keyboard.addKey(Phaser.Keyboard.D)
    }
};

GameState.prototype.create_agent1 = function() {    
    agent1 = this.game.add.sprite(this.world.randomX, this.world.randomY, 'circle');
    agent1.scale.set(0.05); // size of agent
    agent1.anchor.setTo(0.5, 0.5); // set the pivot point of the ship to the center of the texture
    agent1.tint = Math.random() * 0xffffff; // assign random color to the agent
    this.game.physics.enable(agent1, Phaser.Physics.ARCADE);
}

GameState.prototype.create_agent2 = function() {    
    agent2 = this.game.add.sprite(this.world.randomX, this.world.randomY, 'circle');
    agent2.scale.set(0.05); // size of agent
    agent2.anchor.setTo(0.5, 0.5); // set the pivot point of the ship to the center of the texture
    agent2.tint = Math.random() * 0xffffff; // assign random color to the agent
    this.game.physics.enable(agent2, Phaser.Physics.ARCADE);
}

// let agent eat food when they touch
GameState.prototype.eat_food = function(agent, food) {    
    food.kill();
    food.reset(this.rnd.integerInRange(0,this.world.width),this.rnd.integerInRange(0,this.world.height)); //  recreate food in a random position
    agent.scale.set(agent.scale['x'] += 0.0001/agent.scale['x']*2) // enlarge the agent
    //console.log('agent scale',agent.scale['x'], 0.0001/agent.scale['x']*2)
};

// let larger agent eat smaller agent when they touch
GameState.prototype.eat_agent = function(agent1, agent2) {  
       if (agent1.scale['x'] > agent2.scale['x']) {
            agent2.kill();
            this.create_agent2();
       }
       else if (agent2.scale['x'] > agent1.scale['x']) {
            agent1.kill();
            this.create_agent1();
       }   
}

// The update() method is called every frame
GameState.prototype.update = function() {
    // agent1 manual control using arrows
    if (agent1_cursors.left.isDown)
    {
        agent1.x--;
    }
    else if (agent1_cursors.right.isDown)
    {
         agent1.x++;
    }

    if (agent1_cursors.up.isDown)
    {
         agent1.y--;
    }
    else if (agent1_cursors.down.isDown)
    {
         agent1.y++;
    }
    
    // agent2 manual control using WSAD
    if (agent2_cursors.left.isDown)
    {
        agent2.x--;
    }
    else if (agent2_cursors.right.isDown)
    {
         agent2.x++;
    }

    if (agent2_cursors.up.isDown)
    {
         agent2.y--;
    }
    else if (agent2_cursors.down.isDown)
    {
         agent2.y++;
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

