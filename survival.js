var GameState = function(game) { // pass the game instance
};

// Load images and sounds
GameState.prototype.preload = function() {
    this.game.load.image('circle', '/static/images/circle.png');
};

// Setup the example
GameState.prototype.create = function() {
    this.game.stage.backgroundColor = 0x333333;
    
    // create food 
    foods = this.add.group();
    foods.enableBody = true;

    for (var i = 0; i < 15; i++)
    {
        var food = foods.create(this.world.randomX, this.world.randomY, 'circle');
        food.scale.set(0.02); // size of circle
    }
    console.log('food scale',food.scale)
    
    // create circle creature
    circle = this.game.add.sprite(this.game.width/2, this.game.height/2, 'circle');
    circle.scale.set(0.05); // size of circle
    circle.anchor.setTo(0.5, 0.5); // set the pivot point of the ship to the center of the texture
    circle.tint = Math.random() * 0xffffff; // assign random color to the circle
    console.log('circle scale',circle.scale)
    
    // Enable physics on the ship
    this.game.physics.enable(circle, Phaser.Physics.ARCADE);
    
    
    cursors = this.input.keyboard.createCursorKeys();    
};

GameState.prototype.eat_food = function(circle, food) {
    food.kill();
    food.reset(this.rnd.integerInRange(0,this.world.width),this.rnd.integerInRange(0,this.world.height)); // recreate food in a random position
    circle.scale.set(circle.scale['x'] += 0.005) // enlarge the circle
    circle.scale.set(circle.scale['y'] += 0.005)
    //console.log('food scale',food.scale)
};

// The update() method is called every frame
GameState.prototype.update = function() {
    
    if (cursors.left.isDown)
    {
        circle.x--;
    }
    else if (cursors.right.isDown)
    {
         circle.x++;
    }

    if (cursors.up.isDown)
    {
         circle.y--;
    }
    else if (cursors.down.isDown)
    {
         circle.y++;
    }
    //console.log(circle.x,circle.y)
    
    // Keep the ship on the screen
    // Whenever the ship go outof boundries, let it appear on the other side 
    if (circle.x > this.game.width) circle.x = 0;
    if (circle.x < 0) circle.x = this.game.width;
    
    if (circle.y > this.game.height) circle.y = 0;
    if (circle.y < 0) circle.y = this.game.height;
    
    this.physics.arcade.overlap(circle, foods, this.eat_food, null, this) //(object1, object2, function to be called when overlap is detected, process callback?, the callback contaxt that allows us to access the out-of-function variables)
    
};

