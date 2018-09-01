let canvas = document.querySelectorAll('canvas');
let ctx_background = canvas[0].getContext('2d');
let ctx_player = canvas[1].getContext('2d');
let ctx_bullet = canvas[2].getContext('2d');
// 画布的大小
let ctx_enemy = canvas[3].getContext('2d');
(function size() {
    for (let i of canvas) {
        i.height = window.innerHeight;
        i.width = window.innerWidth;
    }
})();

let RoomsDungeon = [];
let RoomCells = [];
let DeadEndsDungeon = [];
let AliveDungeon  = [];
let AliveDungeon1 = [];
let AliveDungeon2 = []; 
let Dungeon = [];
let Door = [];
let Maps = [];

let cell_height = 20;
let cell_width = 20;
let rows = parseInt(canvas[0].height/cell_height) + 1;//canvas.height/cell_height不是整数有缝隙
let cols = parseInt(canvas[0].width/cell_width) + 1; //x
let Status = {
    DeadEndsDungeon: 0,
    AliveDungeon: 1,
    RoomsDungeon: 2,
    Door: 3
}

class BasciObject{
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        ctx_background.beginPath();
        ctx_background.rect(this.x, this.y, this.width, this.height);
        ctx_background.fillStyle = this.color;
        ctx_background.fill();
    }
}

class Room extends BasciObject{
    constructor(x, y, width, height,color) {
        super(x, y, width, height, color)
        this.status = 2;
    }
    
    draw() {
        super.draw();
    }

    isOverlap() {
        if (RoomsDungeon.length ===0) {
            if (isOdd(this.x/ cell_width) || isOdd(this.y/ cell_height) ||
                isOdd(this.width/cell_width) || isOdd(this.height/cell_height)){
                return false;
            }
            rotue(Zoom(this.x, cell_width), Zoom(this.y, cell_height), Zoom(this.x + this.width, cell_width), Zoom(this.y + this.height, cell_width), this.status);
            return true;
        }
        let x1 = this.x + this.width/2;
        let y1 = this.y + this.height/2;
        for (let i of RoomsDungeon) {
            let x2 = i.x + i.width/2;
            let y2 = i.y + i.height/2;
            if (Math.abs(x1 - x2) < (i.width + this.width)/2 + cell_width && 
                Math.abs(y1 -y2) < (i.height +this.height)/2 + cell_height ) {
                return false;
            }
        }
        if (isOdd(this.x/ cell_width) || isOdd(this.y/ cell_height) ||
            isOdd(this.width/cell_width) || isOdd(this.height/cell_height)){
            return false;
        }
        rotue(Zoom(this.x, cell_width), Zoom(this.y, cell_height), Zoom(this.x + this.width, cell_width), Zoom(this.y + this.height, cell_width), this.status);
        return true;
    }
}

//生成迷宫单元命令类
let mapStrategies = {
    'pass': function (x, y) {
        return  ctx_background.drawImage(imageRepository.map, 0, 0, 12, 12, x * cell_width, y * cell_height, cell_width, cell_height);
    },
    'door': function (x, y) {
        return  ctx_background.drawImage(imageRepository.map, 36, 0, 12, 12, x * cell_width, y * cell_height, cell_width, cell_height);
    },
    'topWall': function (x, y) {
        return ctx_background.drawImage(imageRepository.map, 24, 0, 12, 12, x * cell_width, y * cell_height, cell_width, cell_height);
    },
    'wall' : function (x, y) {
        return ctx_background.drawImage(imageRepository.map,12, 0, 12, 12, x * cell_width, y * cell_height, cell_width, cell_height);        
    }
}

let carve = function (name, x, y) {
     return mapStrategies[name](x, y);
}


function isOdd(num) {
    return num % 2 === 0? true : false;
}


//产生随机数
function random(min,max) {
    var num = Math.floor(Math.random()*(max-min)) + min;
    return num;
  }


// 生成地图数组
function initMap() {
    for (let i = 0;i < cols;i++) {
        Maps[i] = [];
        for (let j = 0;j < rows;j++) {
            Maps[i][j] = 0;
            carve('wall', i, j);
        }
    }
}


//将坐标缩放
function Zoom(coordinate, ratio) {
    return Math.floor(coordinate/ratio);
}

//改变房间数组的状态
function rotue(start_x, start_y, end_x, end_y, status) {
    for (let i = start_x;i < end_x;i++) {
        for (let j = start_y; j < end_y;j ++) {
            Maps[i][j] = status;
            carve('pass', i, j);
            RoomCells.push({x: i, y: j});
        }
    }
}



//寻找开阔路径生成迷宫
function startMaze() {
    for (let i = 1; i < cols - 1;i += 2){
        for (let j = 1; j < rows -1;j += 2) {
            if (Maps[i][j] !== 2) {
                startMazeCells(i, j, AliveDungeon1, 1);
            }
        }
    }  
}

//将迷宫单元分类
function startMazeCells(mazeStartX, mazeStartY, arr, Status) {
    // let aisle = new Aisle(mazeStartX * cell_width, mazeStartY * cell_height, cell_width, cell_height, 'red');
    arr.push({x:mazeStartX, y: mazeStartY})
    Maps[mazeStartX][mazeStartY] = Status;
    // aisle.draw();
}


//生成走廊，填充主方向bottom方向，随机向右填充，两方向洪水填充
function growMaze() {
    for(let i of AliveDungeon1) {
        let right_x = i.x + 1;
        let down_y = i.y + 1;
        let top_y = i.y - 1;
        let left_x = i.x - 1;
        let current_x = i.x;
        let current_y = i.y;
        if (right_x < cols - 1 && Maps[right_x + 1][current_y] !== 2) {
            // 目标点的距房间的顶部或底部的距离都为2，则目标点必然向右填充，否则随机向右填充
            if (Maps[current_x][top_y -1] === 2 || 
                Maps[current_x][down_y + 1] === 2 || 
                current_y === rows - 2 || current_y === 1) {
                startMazeCells(right_x, current_y, AliveDungeon2, 1);                 
            }else if (Math.random() > 0.7) {
                startMazeCells(right_x, current_y, AliveDungeon2,1); 
            }
        }
        // 目标点距房间的顶部的距离为3，则目标点向左填充
        if (left_x > 0 && Maps[current_x][down_y + 2] === 2) {
            let point = {x: left_x, y: current_y};
            if (!isExist(AliveDungeon2, point)){
                startMazeCells(left_x, current_y, AliveDungeon2,1);
            }
        }
        // 判断目标点是否可以向下填充
        if (down_y < rows -1 && Maps[current_x][down_y + 1] !== 2) {
            // 目标点的左侧不是通道，则向下填充，在左侧是通道的情况下会形成回路
            if (Maps[left_x][current_y] != 1) {
                startMazeCells(current_x, down_y, AliveDungeon2, 1);
            }
            // 目标点的Y方向断开，距房间的右侧距离为2，则目标点向上填充
            if (left_x - 2 > 0 && top_y - 1 > 0 && 
                Maps[current_x][top_y - 1] !== 2 && 
                Maps[left_x - 2][current_y] === 2) {
                    let point = {x: current_x, y: top_y};
                    if (!isExist(AliveDungeon2, point)){
                        startMazeCells(current_x, top_y, AliveDungeon2, 1);
                    }
            }
        }
    }
}  

//寻找每个房间可使用的连接点，连接房间和通道
function findLinePoint(start_x, start_y, end_x, end_y, dir) {
    let Arr = [];
    // 寻找top和bottom的可用连接点
    if (start_y === end_y) {
        if (dir === 'top' && start_y - 1 === 0) {
            return Arr;
        }else if (dir === 'bottom' && start_y + 1 === rows) {
            return Arr
        }
        for (let i = start_x;i <= end_x;i ++){
            if (dir === 'top' && Maps[i][start_y - 2] !== 0) {
                Arr.push(i);                
            }else if (dir === 'bottom' && Maps[i][start_y + 1] !== 0) {
                Arr.push(i);                      
            }

        }
        return Arr;
    }
    // 寻找left和right可用的连接点
    if (start_x === end_x) {
        if (dir === 'left' && start_x -1 === 0) {
            return Arr;
        }else if (dir === 'right' && start_x + 1 === cols) {
            return Arr;
        }
        for (let i = start_y; i <= end_y;i++) {
            if ( dir === 'left' && Maps[start_x - 2][i] !== 0) {
                Arr.push(i)
            }else if (dir === 'right' && Maps[start_x + 1][i] !== 0) {
                Arr.push(i)
            }
        }
        return Arr;
    }
}

//创建房间的房门将其与通道连接起来
function createDoor() {
   for (let i of RoomsDungeon) {
       let X;
       let Y;
       let X1 = i.x/cell_width;
       let X2 = (i.x + i.width)/cell_width;
       let Y1 = i.y/cell_height;
       let Y2 = (i.y + i.height)/cell_height;
       let left = findLinePoint(X1, Y1, X1, Y2, 'left');
       let top = findLinePoint(X1, Y1, X2, Y1, 'top');
       let right = findLinePoint(X2, Y1, X2, Y2, 'right');
       let bottom = findLinePoint(X1, Y2, X2, Y2, 'bottom');
       if (left.length !== 0) {
            Y = left[random(0, left.length - 1)];
           startMazeCells(X1 - 1, Y, Door, 3);
           carve('pass', X1 - 1, Y);
       }
       if (top.length !== 0) {
           X = top[random(0, top.length -1)];
           startMazeCells(X, Y1 - 1, Door, 3);
           carve('pass', X, Y1 - 1);
       }
       if (right.length !== 0) {
           if (Math.random() > 0.4) {
            Y = right[random(0, right.length - 1)];
            startMazeCells(X2, Y, Door, 3);
            carve('pass', X2, Y); 
           }
       }
       if (bottom.length !== 0) {
           if (Math.random() > 0.6) {
               X = bottom[random(0, bottom.length - 1)];
               startMazeCells(X, Y2, Door, 3);
               carve('pass', X, Y2);                
           }
       }
   }   
}

//生成目标点周围的四个点
function ergodicNode1(currentPoint) {
    let x = currentPoint.x;
    let y = currentPoint.y;
    return [{x: x, y: y - 1}, {x: x + 1, y: y},
            {x: x, y: y + 1}, {x: x - 1, y: y}]
}

//按x值进行排序
function sortNodeX(a, b) {
    return a.x - b.x;
}

//寻找与门相连的走廊
function linkDoor() {
    let arr = []
    for (let i of Door) {
        let aroundPoint = ergodicNode1(i);
        for (let i of aroundPoint) {
            if (Maps[i.x][i.y] === 1) {
                arr.push(i);
            }
        }
    }
    return arr.sort(sortNodeX);
}



//寻找两个门之间的通路，寻路算法
function findAliveDungeon(start_x, start_y, end_x, end_y) {
    let openList = [];
    let closeList = [];
    let reslutList = [];
    openList.push({x:start_x, y: start_y}); 
    while (openList.length !== 0) {
        let currentPoint = openList.shift();
        let aroundPoint = ergodicNode1(currentPoint);
        closeList.push(currentPoint);
        if (currentPoint.x === end_x && currentPoint.y === end_y) {
            reslutList.unshift(currentPoint);
            while (currentPoint.x !== start_x || currentPoint.y !== start_y) {
                reslutList.unshift(currentPoint.parent);
                currentPoint = currentPoint.parent;
            }
            return reslutList;                       
        }
        for (let i in aroundPoint) {
            let item = aroundPoint[i];
            if (item.x >= 1 && item.y >= 1 &&
                item.x < cols - 1 && item.y < rows - 1 && 
                Maps[item.x][item.y] === 1 && //当前节点是否是路
                !isExist(closeList, item)){
                    let Manhattan_distance = Math.abs(end_x - item.x) * 10 + Math.abs(end_y - item.y) * 10;
                    if (!isExist(openList, item)) {
                        item['F'] = Manhattan_distance;
                        item['parent'] = currentPoint;
                        openList.push(item);
                    }else {
                        let index = isExist(openList, item);
                        if (openList[index].F > Manhattan_distance){
                            openList[index].F = Manhattan_distance;
                            openList[index].parent = currentPoint;
                        }                    
                    }
                }            
        }
        openList.sort(sortNode);   
    }
    if (openList.length === 0) {
        return reslutList;
    }       
}



//移除死胡同
function removeDeadEndsDungeon() {
    let newDoor = linkDoor();
    let newAliveDungeon = [...AliveDungeon1, ...AliveDungeon2];
    while(newDoor.length !== 0) {
        let currentPoint = newDoor.shift();
        for (let i of newDoor) {
            let arr = findAliveDungeon(currentPoint.x, currentPoint.y, i.x, i.y);
            for (let i of arr) {
                let item = i;
                if (isExist(newAliveDungeon, item)) {
                    let index = isExist(newAliveDungeon, item);
                    newAliveDungeon.splice(index,1);
                        AliveDungeon.push(item);
                        carve('pass', item.x, item.y);
                }
            }
        }         
    }
    for (let i  of newAliveDungeon) {
        Maps[i.x][i.y] = 0;  
    }    
}

//雕刻通道和房间顶部的墙
function carveTopWall() {
    for (let i = 0;i < cols;i++){
        for (let j = 0;j < rows - 1;j++) {
            if (Maps[i][j] === 0) {
                if (Maps[i][j + 1] !== 0) {
                    carve('topWall', i, j);
                }
            }
        }
    }
}
let setRoomNum;
//加载地图
function initMaps() {
    initMap();
     while (RoomsDungeon.length <= 8) {
         setRoomNum++
         let room = new Room(random(0, cols - 12) * cell_width, random(0, rows - 12) * cell_height, random(8, 12) * cell_width, random(8, 12) * cell_height);
         if (room.isOverlap()) {
             RoomsDungeon.push(room);
            //  room.draw();
         }
         if (setRoomNum > 300) {
             break;
         }
     }
     startMaze();
     growMaze();
     createDoor();
     removeDeadEndsDungeon();
     carveTopWall();
}