class RectangleNode {
    constructor(xPos, yPos, rectWidth, rectHeight, level) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.rectWidth = rectWidth;
        this.rectHeight = rectHeight;
        this.roadWidth = 24;
        this.level = level;
        this.children = [];
        this.isLeaf = true;

        this.topLeft = [this.xPos + this.roadWidth / 2, this.yPos + this.roadWidth / 2];
        this.topRight = [this.xPos + this.roadWidth / 2 + this.rectWidth - this.roadWidth, this.yPos + this.roadWidth / 2];
        this.bottomRight = [this.xPos + this.roadWidth / 2 + this.rectWidth - this.roadWidth, this.yPos + this.roadWidth / 2 + this.rectHeight - this.roadWidth];
        this.bottomLeft = [this.xPos + this.roadWidth / 2, this.yPos + this.roadWidth / 2 + this.rectHeight - this.roadWidth];

        this.innerWidth = this.topRight[0] - this.topLeft[0];
        this.innerHeight = this.bottomLeft[1] - this.topLeft[1];
    }

    drawBoundary() {
        for (let i = 0; i < 2; i++) {
            context.lineWidth = this.roadWidth;
            context.strokeStyle = 'black';
            context.beginPath();
            context.moveTo(this.xPos, this.yPos + this.rectHeight * i);
            context.lineTo(this.xPos + this.rectWidth, this.yPos + this.rectHeight * i);
            context.stroke();

            context.lineWidth = 2;
            context.strokeStyle = 'white';
            context.beginPath();
            context.moveTo(this.xPos, this.yPos + this.rectHeight * i);
            context.lineTo(this.xPos + this.rectWidth, this.yPos + this.rectHeight * i);
            context.stroke();
        }

        for (let i = 0; i < 2; i++) {
            context.lineWidth = this.roadWidth;
            context.strokeStyle = 'black';
            context.beginPath();
            context.moveTo(this.xPos + this.rectWidth * i, this.yPos);
            context.lineTo(this.xPos + this.rectWidth * i, this.yPos + this.rectHeight);
            context.stroke();

            context.lineWidth = 2;
            context.strokeStyle = 'white';
            context.beginPath();
            context.moveTo(this.xPos + this.rectWidth * i, this.yPos);
            context.lineTo(this.xPos + this.rectWidth * i, this.yPos + this.rectHeight);
            context.stroke();
        }
    }

    drawCorners() {
        context.fillStyle = 'black';
        const radius = this.roadWidth / 2;

        const drawCornerCircle = (x, y) => {
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI, true);
            context.closePath();
            context.fill();
        };

        drawCornerCircle(this.xPos, this.yPos);
        drawCornerCircle(this.xPos + this.rectWidth, this.yPos);
        drawCornerCircle(this.xPos, this.yPos + this.rectHeight);
        drawCornerCircle(this.xPos + this.rectWidth, this.yPos + this.rectHeight);
    }

fillInnerRectangle(imageId = "background-image") {
    const img = document.getElementById(imageId);
    if (img) {
        context.drawImage(img, this.topLeft[0], this.topLeft[1], this.innerWidth, this.innerHeight);
    } else {
        console.error(`Image with id "${imageId}" not found.`);
    }
}

    splitNode() {
        const isVerticalSplit = Math.random() > 0.5;
        const splitPoint = {};

        if (isVerticalSplit) {
            splitPoint.x = this.level === 0 ? (this.xPos + this.xPos + this.rectWidth) / 2 : Math.random() * (this.rectWidth - MIN_SIZE) + this.xPos;
            splitPoint.y = this.yPos;

            const leftWidth = splitPoint.x - this.xPos;
            const rightWidth = this.rectWidth - leftWidth;

            if (leftWidth < MIN_SIZE || rightWidth < MIN_SIZE || this.rectHeight < MIN_SIZE) return;

            this.isLeaf = false;
            this.children.push(new RectangleNode(this.xPos, this.yPos, leftWidth, this.rectHeight, this.level + 1));
            this.children.push(new RectangleNode(splitPoint.x, splitPoint.y, rightWidth, this.rectHeight, this.level + 1));
        } else {
            splitPoint.x = this.xPos;
            splitPoint.y = this.level === 0 ? (this.yPos + this.yPos + this.rectHeight) / 2 : Math.random() * (this.rectHeight - MIN_SIZE) + this.yPos;

            const topHeight = splitPoint.y - this.yPos;
            const bottomHeight = this.rectHeight - topHeight;

            if (topHeight < MIN_SIZE || bottomHeight < MIN_SIZE || this.rectWidth < MIN_SIZE) return;

            this.isLeaf = false;
            this.children.push(new RectangleNode(this.xPos, this.yPos, this.rectWidth, topHeight, this.level + 1));
            this.children.push(new RectangleNode(splitPoint.x, splitPoint.y, this.rectWidth, bottomHeight, this.level + 1));
        }
    }
}

class BinarySpacePartitioningTree {
    constructor(rootNode) {
        this.rootNode = rootNode;
    }

    expandTree() {
        const queue = [this.rootNode];
        while (queue.length) {
            const node = queue.shift();
            node.splitNode();
            if (!node.isLeaf) {
                queue.push(...node.children);
            }
        }
    }

    getLeafNodes() {
        const leaves = [];
        const queue = [this.rootNode];
        while (queue.length) {
            const node = queue.shift();
            if (node.isLeaf) {
                leaves.push(node);
            } else {
                queue.push(...node.children);
            }
        }
        return leaves;
    }
}

class Building {
    constructor(width, height, images) {
        this.width = width;
        this.height = height;
        this.images = images;
    }

    drawBuilding(x, y) {
        const randomIndex = Math.floor(Math.random() * this.images.length);
        context.drawImage(this.images[randomIndex], x, y);
    }
}

const bigBuilding = new Building(80, 40, [document.getElementById("big-building-1"), document.getElementById("big-building-2"), document.getElementById("big-building-3")]);
const mediumBuilding = new Building(90, 24, [document.getElementById("medium-building")]);
const smallBuilding = new Building(16, 16, [document.getElementById("small-building")]);
const house = new Building(16, 16, [document.getElementById("house")]);

function createMap() {
    const root = new RectangleNode(0, 0, 1200, 1200, 0);
    root.drawBoundary();
    root.drawCorners();

    const bspTree = new BinarySpacePartitioningTree(root);
    bspTree.expandTree();
    const leafNodes = bspTree.getLeafNodes();

    leafNodes.forEach(leaf => {
        leaf.drawBoundary();
        leaf.drawCorners();
        leaf.fillInnerRectangle(); // This will now draw the image as the background

        const binXPosArray = [];
        let binPos = leaf.topLeft[0];
        while (binPos < leaf.topRight[0]) {
            binXPosArray.push(binPos);
            binPos += 80;
        }

        for (const linePos of binXPosArray) {
            context.fillStyle = 'grey';
            context.fillRect(linePos, leaf.topLeft[1], 2, leaf.innerHeight);
        }

        const buildings = [bigBuilding, mediumBuilding, smallBuilding, house];
        for (const binX of binXPosArray) {
            let currentY = leaf.topLeft[1];
            while (currentY < leaf.bottomLeft[1]) {
                const randomBuilding = buildings[Math.floor(Math.random() * buildings.length)];
                if (currentY + randomBuilding.height > leaf.bottomLeft[1] || binX + randomBuilding.width > leaf.topRight[0]) {
                    break;
                }
                randomBuilding.drawBuilding(binX, currentY);
                currentY += randomBuilding.height;
            }
        }
    });
}

const canvas = document.getElementById("myCanvas");
const context = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 1200;
const MIN_SIZE = 70;

createMap();