window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
			return window.setTimeout(callback, 1000 / 60);
		};
})();

let key_Code = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    32: 'space'
}
let end;
let guardArr = [];
let key_status = {
    'left': false,
    'right': false,
    'up': false,
    'down': false,
    'space': false
}




let imageRepository = new function() {
    this.map = new Image();
    this.map.src = 'img/tiles.png';
    this.player = new Image();
    this.player.src = 'img/player2.png';
    this.skill = new Image();
    this.skill.src = 'img/skill.png';
    let numImages = 3;
    let numLoaded = 0;
    function imageLoaded() {
        numLoaded++
        if (numLoaded === numImages) {
            start[0].onclick = function (e){
                e.stopPropagation();
                start[0].disabled = true;
                start[0].style.opacity = '0';
                game.Start = true;
                if (start[0].innerText === '开始') {
                    if (checkReadyState()) {
                        game.start();
                    }
                }else {
                    game.restart();
                }

            }
            gameOver()
        }
    }
    this.map.onload = function() {
        imageLoaded();
    } 
    this.player.onload = function() {
        imageLoaded();
    }
    this.skill.onload = function() {
        imageLoaded();
    }
}

function checkReadyState() {
    if (videoRepository.backgroundAudio.readyState === 1) {
        window.clearInterval(videoRepository.checkAudio);
        return true;
    }else {
        return false;
    }
}

let videoRepository =new function() {
    this.backgroundAudio = new Audio("sounds/GenJi.mp3");
    this.backgroundAudio.loop = true;
    this.backgroundAudio.volume = .25;
    this.backgroundAudio.load();
    this.checkAudio = window.setInterval(function(){checkReadyState()},1000);
} 




//图像位置储存库
let farmePicStrategies = {
    '0' : function(ctx,image, sy, swidth, sheight, x, y, width, height) {
        return ctx.drawImage(image, 4 * swidth, sy * sheight, swidth, sheight, x, y, width, height )
    },
    '45': function(ctx, image, sy, swidth, sheight, x, y, width, height) {
        return ctx.drawImage(image, 5 * swidth, sy * sheight, swidth, sheight, x, y, width, height )
    },
    '90':function(ctx,image, sy, swidth, sheight, x, y, width, height) {
        return ctx.drawImage(image, 6 * swidth, sy * sheight, swidth, sheight, x, y, width, height )
    },
    '135':function(ctx,image, sy, swidth, sheight, x, y, width, height) {
        return ctx.drawImage(image, 7 * swidth, sy * sheight, swidth, sheight, x, y, width, height )
    },
    '180':function(ctx,image, sy, swidth, sheight, x, y, width, height) {
        return ctx.drawImage(image, 0 * swidth, sy * sheight, swidth, sheight, x, y, width, height )
    },
    '215':function(ctx,image, sy, swidth, sheight, x, y, width, height) {
        return ctx.drawImage(image, 1 * swidth, sy * sheight, swidth, sheight, x, y, width, height )
    },
    '270':function(ctx,image, sy, swidth, sheight, x, y, width, height) {
        return ctx.drawImage(image, 2 * swidth, sy * sheight, swidth, sheight, x, y, width, height )
    },
    '315':function(ctx,image, sy, swidth, sheight, x, y, width, height) {
        return ctx.drawImage(image, 3 * swidth, sy * sheight, swidth, sheight, x, y, width, height )
    }
}

//调用图像
let drawImage = function (rotation, ctx, image, sy, swidth, sheight, x, y, width, height ) {
    return farmePicStrategies[rotation](ctx,image, sy, swidth, sheight, x, y, width, height);
}


function animate() {
    if (guardArr.length === 0) {
        game.restart();
    }
    for (let i in guardArr) {
        let index = i;
        if (!guardArr[i].alive) {
            guardArr.splice(index, 1);
        }
    }
    game.player.move();
    game.player.fire();
    for (let i of guardArr) {
        i.movePath(game.player);
        i.guardRing(game.player);
        i.bulletpool.animate(i, game.player);
        game.player.bulletpool.animate(game.player, i);
    }
    // game.player.draw();
    end = requestAnimationFrame(animate);
}

class Game{
    constructor(){
        this.player = new Player(20, 20, 19, 19, 1);
        this.time = 0;
        this.guardNum = 10;
        this.Start = false;
    }

    start() {
        initMaps();
        if (Maps[this.player.x/cell_width][this.player.y/cell_height] !== 1) {
            this.player.x = RoomsDungeon[0].x;
            this.player.y = RoomsDungeon[0].y;
            this.player.draw();
        }else {
            this.player.draw();
        }
        let guardPosition = [...RoomCells,...AliveDungeon,...Door];
        for (let i of guardPosition) {
            this.time++
            if (i.x !== this.player.x && i.y !== this.player.y) {
                if (this.time > 100) {
                    let closeCombat = new CloseCombat(i.x * cell_width, i.y * cell_height, 19, 19, 1);
                    closeCombat.createPathArr();
                    guardArr.push(closeCombat);
                    closeCombat.bulletpool.init(closeCombat);
                    this.time = 0;
            }
            if (guardArr.length === this.guardNum) {
                break;
            }
            }
        }
        videoRepository.backgroundAudio.play();
        this.player.bulletpool.init(this.player);
        animate();
    }

    restart() {
         ctx_player.clearRect(0, 0, window.innerHeight, window.innerWidth);
         ctx_bullet.clearRect(0, 0, window.innerHeight, window.innerWidth);
         ctx_enemy.clearRect(0, 0, window.innerHeight, window.innerWidth);
         RoomsDungeon = [];
         RoomCells = [];
         DeadEndsDungeon = [];
         AliveDungeon  = [];
         AliveDungeon1 = [];
         AliveDungeon2 = []; 
         Dungeon = [];
         Door = [];
         Maps = [];
         guardArr = [];
         videoRepository.backgroundAudio.currentTime = 0;
         this.player.x = 20;
         this.player.y = 20;
         this.player.alive = true;
         this.start();
    }
}


class Player{
    constructor(x, y, width, height,speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.velX = 0;
        this.velY = 0;
        this.isroute = false;
        this.alive = true;
        this.routeMoveArr = [];
        this.rotation = 180;
        this.counter = 0;
        this.fps = 0;
        this.picDir = 0;
        this.pool = [];
        this.bulletpool = new Pool(15);        
    }

    draw() {
        if (this.velX === 0 && this.velY === 0 ) {
            this.picDir = this.picDir % 4;
            ctx_player.clearRect(this.x, this.y , this.width, this.height);
            drawImage(this.rotation, ctx_player,imageRepository.player, this.picDir, 95, 87,this.x, this.y, this.width, this.height);
            return ;
        }
        drawImage(this.rotation, ctx_player,imageRepository.player, this.picDir, 95, 87,this.x, this.y, this.width, this.height);
        this.picDir ++;
        if (this.picDir > 3) {
            this.picDir = 0;
        }
        if (this.fps >= 60) {
            this.velX = 0;
            this.velY = 0;
            this.fps = 0; 
        }
    }

    move() {
        // let _this = this;
        this.fps++;
        if (this.isroute) {
            this.movePath();
        }
        if (key_status.left || key_status.up || key_status.right || key_status.down) {
            // ctx_player.clearRect(this.x, this.y , this.width, this.height);
            this.rotation = fireRotation(key_status.left, key_status.right, key_status.up, key_status.down);
            if (key_status.left) {
                this.velX = -(this.speed);
            }
            if (key_status.up) {
                this.velY = -(this.speed);
            }
            if (key_status.right) {
                this.velX = this.speed;
            }
            if (key_status.down) {
                this.velY = this.speed;
            }
            if ((this.x + this.velX) <= 0 || (this.x + this.velX) >= (canvas.width - cell_width)) {
                this.velX = 0;
            }
            if((this.y + this.velY) <= 0 || (this.y + this.velY) >= (canvas.height - cell_height)) {
                this.velY = 0;
            }
        }
        if (this.fps % 4 === 0) {
            ctx_player.clearRect(this.x, this.y , this.width, this.height);
            this.x += this.velX;
            this.y += this.velY;
            if(isCollision(this.x, this.y, this.width, this.height)) {
                this.x -= this.velX;
                this.y -= this.velY;
                this.velX = 0;
                this.velY = 0;
            }
            this.draw();            
        }
        /*document.onclick = function click(e) {
             //e = e || event;
            let end = {x: Math.floor(e.x/cell_height), y: Math.floor(e.y/cell_width)};
            if (_this.x === 0 && _this.y === 0) {
                start = {x: _this.x, y: _this.y};
                searchRoad(start.x, start.y, end.x, end.y, Maps);  
                start = end;                
            }else {
                searchRoad(start.x, start.y, end.x, end.y, Maps);
            }
        }
        document.onkeydown = function keyDown(e) {
             //e = e || event;
            let currkey = e.keyCode||e.which||e.charCode;
            let currentPoint ={x: Math.floor(_this.x/cell_height), y: Math.floor(_this.y/cell_width)};
            ctx.clearRect(_this.x, _this.y , cell_height, cell_width);
            if (currkey === 37) {
                _this.x -= _this.speed;
                if (_this.x <= 0) {
                    _this.x = 0;
                    _this.draw();
                    return;
                }
                _this.collisionDetection(currentPoint);
                if (collision) {
                    _this.x = Math.ceil(_this.x/cell_height) * cell_height;
                    collision = false; 
                }
                _this.draw();                
            }
            if (currkey === 38) {
                _this.y -= _this.speed;
                if (_this.y <= 0) {
                    _this.y = 0;
                    _this.draw();
                    return ;
                }   
                _this.collisionDetection(currentPoint);
                if (collision) {
                    _this.y = Math.ceil(_this.y/cell_width) * cell_width;
                    collision = false;
                }
                _this.draw();
            }
            if (currkey === 39) {
                _this.x += _this.speed;
                if (_this.x >= (canvas.width - cell_width)) {
                    _this.x = canvas.width - cell_width;
                    _this.draw();
                    return ;
                }
                _this.collisionDetection(currentPoint);
                if (collision) {
                    _this.x = Math.floor(_this.x/cell_height) * cell_height;
                    collision = false;
                }
                _this.draw();
            }
            if (currkey === 40) {   
                _this.y += _this.speed;
                if (_this.y >= (canvas.height - cell_height)) {
                    _this.y = canvas.height - cell_height;
                    _this.draw();
                    return; 
                }
                _this.collisionDetection(currentPoint);
                if (collision) {
                    _this.y = Math.floor(_this.y/cell_width) * cell_width;
                    collision = false;
                }
                _this.draw();
            }
        }
        */  
    }
    /*collisionDetection(currentPoint) {
        let _this = this;
        let nodes = ergodicNode(currentPoint);
        for (let i of nodes) {
            if (i.x >= 0 && i.y >= 0 && i.x < cols && i.y < rows) {
                if (Maps[i.x][i.y] === 1) {
                    let X_distance = Math.abs(_this.x - i.x * cell_height);
                    let Y_distance = Math.abs(_this.y - i.y * cell_width);  
                    if (X_distance < cell_height && Y_distance < cell_width){
                        collision = true;                            
                    }                      
                }
            }                                   
        }                         
    }*/

    movePath() {
        // let _this = this;
        key_status['left'] = false;
        key_status['right'] = false;
        key_status['up'] = false;
        key_status['down'] = false;
        if (this.routeMoveArr.length === 0) {
            this.isroute = false;
            return ;
        }
        let currentRoute = this.routeMoveArr[0];
        if (this.x === currentRoute.x * cell_height && this.y === currentRoute.y * cell_width) {
             this.routeMoveArr.shift();
            if (this.routeMoveArr.length === 0) {
                this.isroute = false;
                return ;
            }
            currentRoute = this.routeMoveArr[0];        
        }

        if (this.x > currentRoute.x * cell_height) {
            key_status['left'] = true;
        }else if (this.x < currentRoute.x * cell_height) {
            key_status['right'] = true;
        }else {
            key_status['left'] = false;
            key_status['right'] = false;
        }

        if (this.y > currentRoute.y * cell_width) {
            key_status['up'] = true;
        }else if (this.y < currentRoute.y * cell_width) {
            key_status['down'] = true;
        }else {
            key_status['up'] = false;
            key_status['down'] = false;
        } 
    }

    fire() {
        // let _this = this;
        // 指定子弹的发射位置，速度，角度
        this.counter++;
        if (key_status.space && this.counter >= 15) {
            this.bulletpool.get(this.x, this.y, 0.2, this.rotation, this);
            this.counter = 0;
        }
    }

    death() {
        this.alive = false;
    }
}

//检测移动方向是否存在障碍物
function isCollision(x, y, width, height) {
    let left_x = Math.floor(x/cell_height);
    let top_y = Math.floor(y/cell_width);
    let right_x = Math.floor((x + width)/cell_width);
    let bottom_y = Math.floor((y + height)/cell_width);
    return Maps[left_x][top_y] === 0 || Maps[left_x][bottom_y] === 0 || Maps[right_x][top_y] === 0 || Maps[right_x][bottom_y] === 0;
}




class CloseCombat{
    constructor(x, y, width, height,speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.velX = 0;
        this.velY = 0;
        this.picDir = 0;
        this.fps = 0;
        this.baseAttackTime = 0;
        this.moveCells = 0;
        this.patrolPath = [];
        this.returnPath = [];
        this.nextPosition = 0;
        this.rotation = 0;
        this.isReturn = false;
        this.findEnemy = false;
        this.alive = true;
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.bulletpool = new Pool(5);
        this.pool = [];        
    }

    draw() {
        // let _this = this;
        if (this.picDir > 3) {
            this.picDir = 0;
        }
        drawImage(this.rotation, ctx_enemy, imageRepository.player, this.picDir, 95, 87, this.x, this.y, this.width, this.height);
        this.picDir ++;        
    }

    move(end_x, end_y) {
        // let _this = this;
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        if (this.x > end_x ) {
            this.velX = -(this.speed);
            this.left = true;
        }else if (this.x < end_x) {
            this.velX = this.speed;
            this.right = true;
        }else {
            this.velX = 0;
            this.left = false;
            this.right = false;
        }
        if (this.y > end_y ) {
            this.velY = -(this.speed);
            this.up = true;
        }else if(this.y < end_y) {
            this.velY = this.speed;
            this.down = true;
        }else {                                                                                 
            this.velY = 0;
            this.up = false;
            this.down = false;
        }
        this.rotation = fireRotation(this.left, this.right, this.up, this.down);
        if (this.fps >= 12) {
            ctx_enemy.clearRect(this.x, this.y , this.width, this.height);                      
            this.x += this.velX;
            this.y += this.velY;
            this.draw();
            this.fps = 0;
        }
    }
    
    createPathArr() {
        // let _this = this;
        let currentPoint;
        if (this.patrolPath.length === 0) {
            currentPoint = {x:this.x/cell_width, y: this.y/cell_height};
           this.patrolPath.push(currentPoint);
       }
       while (this.patrolPath.length <= 8) {
           // console.log(currentPoint);
           let aroundPoint = ergodicNode(currentPoint);
           // console.log(aroundPoint);
           let moveDir = [];
           console.log(Maps[currentPoint.x][currentPoint.y]);
           console.log(currentPoint);
           for (let i in aroundPoint) {
               let item = aroundPoint[i];
               console.log(item);
               console.log(Maps[item.x][item.y]);
               if(Maps[item.x][item.y] !== 0 && !isExist(this.patrolPath, item)) {
                    if (Maps[currentPoint.x][currentPoint.y] === 2 && 
                        Maps[currentPoint.x][currentPoint.y] === Maps[item.x][item.y]) {  //目标点在房间时允许走对角线
                            moveDir.push(item); 
                        }else if (currentPoint.x === item.x || currentPoint.y === item.y) {  //目标点不在房间时走直线   
                            moveDir.push(item);                         
                        } 
               }
           }
           if (moveDir.length === 0) {
               break;
           }
           console.log(moveDir);
           this.patrolPath.push(moveDir[random(0, (moveDir.length - 1))]);
           currentPoint = this.patrolPath[this.patrolPath.length -1];
           // console.log(_this.patrolPath);
       }
    }

    movePath(enemy) {
        // let _this = this;
        this.fps++
        this.baseAttackTime++;
        if (!this.findEnemy) {
            if (this.returnPath.length === 1) {
                let end = this.returnPath[0];
                if (this.x === end.x && this.y === end.y) {
                    this.returnPath.shift();
                    this.velX = 0;
                    this.velY = 0;
                }
                this.move(end.x, end.y);
            }
            if (!this.isReturn) {
                this.nextPosition = this.patrolPath[1];
                if (this.x === this.nextPosition.x * cell_width && this.y === this.nextPosition.y * cell_height) {
                    this.patrolPath.push(this.patrolPath.shift());
                    this.moveCells++;
                    this.velX = 0;
                    this.velY = 0;
                    if (this.moveCells === 8) {
                        this.patrolPath.push(this.patrolPath.shift());
                        this.isReturn = true;
                        this.moveCells = 0;
                    }
                }
            }else {
                this.nextPosition = this.patrolPath[this.patrolPath.length - 2];
                if (this.x === this.nextPosition.x * cell_width && this.y === this.nextPosition.y * cell_height) {
                    this.patrolPath.unshift(this.patrolPath.pop());
                    this.moveCells++;
                    this.velX = 0;
                    this.velY = 0;
                    if (this.moveCells === 8) {
                        this.patrolPath.unshift(this.patrolPath.pop());
                        this.isReturn = false;
                        this.moveCells = 0;
                    }
                }
            }
            this.move(this.nextPosition.x * cell_width, this.nextPosition.y * cell_height);
        }else {
            if (this.x === enemy.x && this.y === enemy.y) {
                this.velX = 0;
                this.velY = 0;
            }
            if (Math.hypot(Math.abs(enemy.x - this.x), Math.abs(enemy.y -this.y)) <= Math.hypot( 2 * cell_width , 2 * cell_height)) {
                this.attack(enemy);
            }
            this.move(enemy.x, enemy.y);
        }         
    }

    guardRing(enemy) {
        // let _this = this;
        let countDistance = Math.hypot(Math.abs(enemy.x - this.x), Math.abs(enemy.y -this.y));
        if (countDistance < Math.hypot(6 * cell_width , 6 * cell_height)) {
            let start = {x: Math.floor(this.x/cell_width), y: Math.floor(this.y/cell_height)};
            let end = {x: Math.floor(enemy.x/cell_width), y: Math.floor(enemy.y/cell_height)};
            if (isExistWall(start.x, start.y, end.x, end.y, Maps)) {
                if(this.returnPath.length === 0) {
                    this.returnPath.push({x: this.x, y: this.y})   //储存发现的位置;
                }
                this.findEnemy = true;
            }else{
                this.findEnemy = false; 
            }
        }else {
            this.findEnemy = false;            
        }
    }

    attack(enemy) {
        let Distance = Math.hypot(Math.abs(enemy.x - this.x), Math.abs(enemy.y -this.y))
        if (Distance < enemy.width/4 ){
            enemy.death();
        }
        if (this.baseAttackTime > 240) {
            this.bulletpool.get(this.x, this.y, 0.3, this.rotation, this);
            this.baseAttackTime = 0;
        }
    }
    
    death() {
        this.alive = false;
        ctx_enemy.clearRect(this.x, this.y, this.width, this.height);
    }
}

//判断敌人和英雄两点间是否有墙
function isExistWall(start_x, start_y, end_x, end_y, Maps) {
    let startX = start_x;
    let startY = start_y;
    let endX = end_x;
    let endY = end_y;
    if (start_x > end_x) {
        startX = end_x;
        endX = start_x;
    }
    if (start_y > end_y) {
        startY = end_y;
        endY = start_y;
    }
    for (let i = startX;i <= endX;i++){
        for (let j = startY;j <= endY;j++){
            if (Maps[i][j] === 0) {
                return false;
            }
        }
    }
    return true;
}



//创建一个对象池
class Pool{
    constructor(size) {
        this.size = size;
    }

    // 创建一个具备size大小的子弹对象池
    init(parent) {
        for (let i = 0; i < this.size; i++) {
            let bullet = new Bullet(0, 0, 15, 15);
            parent.pool[i] = bullet;
        }
    }
    // 子弹池中最后一个对象未使用，则创建一个新对象，并把其添加到数组的最前面
    get(x, y, speed, rotation, parent) {
        if (!parent.pool[this.size - 1].alive) {
            parent.pool[this.size - 1].spawn(x, y, speed, rotation);
            parent.pool.unshift(parent.pool.pop()); 
        }
    }
    // 判断子弹是否在使用，如果在使用则判断子弹运动距离是否达到设定值
    // 达到设定值后将其在数组中删除，并添加到数组的后面
    animate(parent, enemy) {
        for (let i = 0 ; i < this.size; i++) {
            if (parent.pool[i].alive) {
                if (parent.pool[i].move()) {
                    parent.pool[i].clear();
                    parent.pool.push((parent.pool.splice(i, 1))[0]);
                }else {
                    // let middleX1 = (parent.pool[i].x + parent.pool[i].width)/2;
                    // let middleX2 = (enemy.x + enemy.width)/2;
                    // let middleY1 = (parent.pool[i].y + parent.pool[i].height)/2;
                    // let middleY2 = (enemy.y + enemy.height)/2;
                    // let Distance = Math.hypot(Math.abs(middleX1 -middleX2), Math.abs(middleY1 - middleY2));
                    if (Math.abs(parent.pool[i].x - enemy.x ) <= enemy.width/2 &&
                        Math.abs(parent.pool[i].y - enemy.y) <= enemy.height/2) {
                        enemy.death();
                    } 
                }
            }else {
                break;
            }
        }
    }
}

class Bullet {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.alive = false;
        this.picDir = 0;
        this.fps = 0;
    }
    // 生成新的子弹对象
    spawn(x, y, speed, rotation) {
        // let _this = this;
        this.x = x;
        this.y = y;
        this.x_start = x;
        this.y_start = y;
        this.speed = speed;
        this.alive = true;
        this.rotation = rotation;
    }
    // 将子弹对象画出
    draw() {
        // ctx_bullet.beginPath();
        // ctx_bullet.arc(this.x, this.y, this.size, 0, 2 * Math.PI, 0 )
        // ctx_bullet.fillStyle = this.color;
        // ctx_bullet.fill();
        ctx_bullet.clearRect(this.x , this.y -this.height/2 , this.width, this.height * 2);
        drawImage(this.rotation, ctx_bullet, imageRepository.skill, this.picDir, 100, 100, this.x, this.y, this.width, this.height)
        this.picDir++
    }
    // 子弹的移动方式
    move() {
        // let _this = this;
        this.fps++
        let angleInRadians = this.rotation*Math.PI/180;
        // ctx_bullet.clearRect(this.x , this.y, this.width, this.height);
        // let moveDistance = Math.hypot(Math.abs(this.x_start - this.x), Math.abs(this.y_start - this.y));
        // moveDistance < Math.hypot(5 * cell_height, 5 * cell_width
            let point_x;
            let point_y;
            this.y -= Math.cos(angleInRadians) * this.speed;
            this.x += Math.sin(angleInRadians) * this.speed;
            if (Math.cos(angleInRadians) < 0) {
               point_y = Math.floor((this.y + this.height)/cell_width);   
            }else {
               point_y = Math.floor(this.y/cell_width);                
            }
            if (Math.sin(angleInRadians) > 0) {
               point_x = Math.floor((this.x + this.width)/cell_width);
            }else {
               point_x = Math.floor(this.x/cell_width);
            }
            if (this.x < this.width || this.y < this.height || this.x > canvas.width - this.width || 
                this.y > canvas.height - this.height) {
                    ctx_bullet.clearRect(this.x , this.y -this.height/2 , this.width, this.height * 2);
                return true;
            }else if (point_x > 0 && point_y > 0 && 
                      point_x < cols && point_y < rows && 
                      Maps[point_x][point_y] === 0) {
                        ctx_bullet.clearRect(this.x , this.y -this.height/2 , this.width, this.height * 2);
                      return true;
            }
            if (this.picDir === 11) {
                this.picDir = 0;
                ctx_bullet.clearRect(this.x , this.y -this.height/2 , this.width, this.height * 2);
                return true;
            }
            if (this.fps >= 7) {
                this.draw();
                this.fps = 0;
            }
    }
    // 清除子弹
    clear() {
        // let _this = this;
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
    }
}


class soundPool{
    constructor(size) {
        this.size = size;
    }

    init() {        
    }
}



//判断子弹是否在子弹池中
function isCreate(bullets, bullet) {
    for (let i of bullets) {
        if (i.x === bullet.x + bullet.width/2 && i.y === bullet.y + bullet.height/2 ) {
            return i
        }
    }
    return false;
}
  

//开火方向
function  fireRotation(left ,right, up, down) {
    if (left || right || up ||  down) {
        if (left && up) {
            return 315;
        }
        if (up && right) {
            return 45;
        }
        if (right &&  down) {
            return 135;
        }
        if (left  &&  down) {
            return 215
        }
        if (up) {
            return 0;
        }
        if (right) {
            return 90;
        }
        if ( down) {
            return 180;
        }
        if (left) {
            return 270;
        }
    }else {
        return 180;
    }
}


let game = new Game();
let start = document.querySelectorAll('button');




document.onkeydown = function(e) {
    let currkey = e.keyCode||e.which||e.charCode;
    if (key_Code[currkey]) {
        // e.preventDefault();
        key_status[key_Code[currkey]] = true;  
    }
}

document.onkeyup = function(e) {
    let currkey = e.key_Code||e.which||e.charCode;
    if (key_Code[currkey]) {
        key_status[key_Code[currkey]] = false;
    }
} 

document.onclick = function(e) {
    if (game.Start) {
        let end = {x: Math.floor(e.x/cell_height), y: Math.floor(e.y/cell_width)};
        let start = {x: Math.floor(game.player.x/cell_height), y: Math.floor(game.player.y/cell_width)};
        let route = searchRoad(start.x, start.y, end.x, end.y, Maps);
        game.player.isroute = true;
        game.player.routeMoveArr = route; 
    }
}

function gameOver() {
    if (!game.player.alive) {
        console.log(1);
        window.cancelAnimationFrame(end);
        videoRepository.backgroundAudio.pause();
        ctx_player.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx_bullet.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx_enemy.clearRect(0, 0, window.innerWidth, window.innerHeight);
        start[0].disabled = false;
        start[0].style.opacity = '1';
        start[0].innerText = '重新开始';
        game.Start = false;
    }
    requestAnimationFrame(gameOver);
};

