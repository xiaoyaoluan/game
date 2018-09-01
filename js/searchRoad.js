//A*自动寻路算法
function searchRoad(start_x, start_y, end_x, end_y, Maps) {
    let openList = [];
    let closeList = [];
    let reslutList = []; 
    openList.push({x:start_x, y: start_y, G: 0});
    while (openList.length !== 0) {
        let currentPoint = openList.shift();
        let aroundPoint = ergodicNode(currentPoint);
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
            if (item.x >= 0 && item.y >= 0 &&
                item.x < cols && item.y < rows && 
                Maps[item.x][item.y] != 0 &&          //当前节点是否是障碍物
                Maps[currentPoint.x][item.y] != 0 &&  //当前节点左侧节点是否是障碍物
                Maps[item.x][currentPoint.y] != 0 &&  //当前节点上方节点是否是障碍物
                !isExist(closeList, item)){
                    let G = currentPoint.G + ((currentPoint.x - item.x) * (currentPoint.y - item.y) === 0 ? 10 : 14);//上下左右G为10，斜方向移动为14
                    let Manhattan_distance = Math.abs(end_x - item.x) * 10 + Math.abs(end_y - item.y) * 10;
                    if (!isExist(openList, item)) {
                        item['H'] = Manhattan_distance;
                        item['G'] = G;
                        item['F'] = item['H'] + item['G'];
                        item['parent'] = currentPoint;
                        openList.push(item);
                    }else {
                        let index = isExist(openList, item);
                        if (openList[index].G > G){
                            openList[index].G.G = G;
                            openList[index].G.F = openList[index].H + openList[index].G;
                            openList[index].G.parent = currentPoint;
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

// 生成目标点周围八个方向的点
function ergodicNode(currentPoint) {
    let x = currentPoint.x;
    let y = currentPoint.y;
    return [{x: x, y: y - 1}, {x: x + 1, y: y - 1},
            {x: x + 1, y: y}, {x: x + 1, y: y + 1},
            {x: x, y: y + 1}, {x: x - 1, y: y + 1},
            {x: x - 1, y: y}, {x: x - 1, y: y - 1}]
}

// 按F值进行排序
function sortNode(a, b) {
    return a.F - b.F;
}

// 判断点是否存在列表中
function isExist(List, point) {
    for (let i in List) {
        if (List[i].x === point.x && List[i].y === point.y) {
            return i;
        }
    }
    return false; 
}
