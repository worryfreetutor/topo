var MAX_VERTEX_NUM = 20; // 最大顶点个数
var MAX_PATH_NUM = 100;  // 最大路径数

var Spot;
var MGraph;
var spot;
var arccell
var graph
var Rank
var  cnt=0,tot=0;
var degree
var vis
var path
var path_number
var final_path
function get(key){                       // 构建邻接表

    Spot = function(name, data,angle) {
        this.name = name;    //顶点编号
        this.data = data;    //顶点信息
    }

    MGraph = function(vexs, adjMatrix, vexnum, arcnum, kind) {
        this.vexs = vexs; //顶点向量
        this.adjMatrix = adjMatrix; //邻接表
        this.vexnum = vexnum; // 图当前顶点数
        this.arcnum = arcnum; // 图当前弧（边）数
        this.kind = kind; //图的种类标志
    }

    spot = new Array();
    for(var i=0;i<MAX_VERTEX_NUM;i++)
        spot[i] = new Spot(null,null);

    arccell = new Array();
    for(var i=0;i<MAX_VERTEX_NUM;i++)
        arccell[i] = new Array();

    graph = new MGraph(spot,arccell,0,0,"有向图");

    Rank = new Array(); // 优先级数组，存放不同优先级的序列
    for(var i = 0;i<MAX_VERTEX_NUM;i++)
        Rank[i] = new Array();

    cnt=0,tot=0;//n是顶点的个数 ， m是边的条数 ， cnt用来表示有多少个优先级,tot表示图有无环
    degree = new Array();              // 入度数组
    for(var i=0;i<MAX_VERTEX_NUM;i++)
        degree[i]=0;
    vis = new Array();                 // 访问数组，用于表示是否被访问
    for(var i=0;i<MAX_VERTEX_NUM;i++)
        vis[i]=0;

    path = new Array();                // 路径
    path_number = 0;                   // 路径条数
    final_path = new Array();          // 存储所有路径的数组



    while(key != ""){
        var name1,name2;   // 顶点编号
        var str = "";
        var number1 = 0;   // 弧头顶点计数
        var number2 = 0;   // 弧尾顶点计数
        var IsSpot = false;// 判断该顶点是否重复
        key = key.substring(1,key.length);//删去“<”

        //alert(1+":"+key);

        while(key[number1] != ','){//获取顶点
            str += key[number1];
            number1++;
        }

        for(var number=1;number<=graph.vexnum;number++)
            if(graph.vexs[number].data == str){//若该顶点重复则获取该顶点的位置
                IsSpot = true;
                name1=number;
                break;
            }
        if(IsSpot == false){//若该顶点未重复则加入图中并获取该顶点的位置

            //alert(graph.vexnum);
            graph.vexs[graph.vexnum+1].data = str;
            graph.vexs[graph.vexnum+1].name = graph.vexnum+1;
            name1 = graph.vexnum+1;
            graph.vexnum++;
        }
        IsSpot = false;
        str = "";
        key = key.substring(number1+1,key.length);//删去“,”

        //alert(2+":"+key);

        while(key[number2] != '>'){//获取顶点
            str += key[number2];
            number2++;
        }
        for(var number=1;number<=graph.vexnum;number++)
            if(graph.vexs[number].data == str){//若该顶点重复则获取该顶点的位置
                IsSpot = true;
                name2 = number;
                break;
            }
        if(IsSpot == false){//若该顶点未重复则加入图中并获取该顶点的位置
            graph.vexs[graph.vexnum+1].data = str;
            graph.vexs[graph.vexnum+1].name = graph.vexnum+1;
            name2 = graph.vexnum+1;
            graph.vexnum++;
        }
        key = key.substring(number2+2,key.length);//删去“>”

        //alert(3+":"+key);

        graph.arcnum++;
        graph.adjMatrix[name1].push(name2);
    }
    topo();
    // printAll();

    return final_path;
}

var ArrayQueue;
ArrayQueue = function (){              // 队列
    var arr = [];
        //入队操作
    this.push = function(element){
        arr.push(element);
        return true;
    }
        //出队操作
    this.pop = function(){
        return arr.shift();
    }
        //获取队首
    this.getFront = function(){
        return arr[0];
    }
        //获取队尾
    this.getRear = function(){
        return arr[arr.length - 1]
    }
        //清空队列
    this.clear = function(){
        arr = [];
    }
        //获取队长
    this.size = function(){
        return length;
    }
}

function swap(a,b,c)  // 交换函数
{
    var temp=Rank[a][b];
    Rank[a][b]=Rank[a][c];
    Rank[a][c]=temp;
}

function reverse(nu, first, last)  // 倒序
{
    last--;
    while (first < last)
        swap(nu, first++, last--);
}

function next_permutation(nu, first, last)   // 全排列
{
	var i, j;
    i = last - 2;
    while (i >= 0 && Rank[nu][i] >= Rank[nu][i + 1]) i--;

    if (i == -1) {
        reverse(nu, first, last);
        return false;
    }

    j = last - 1;
    while (Rank[nu][j] <= Rank[nu][i]) --j;
    swap(nu, i, j);
    reverse(nu, i + 1, last);
    return true;
}


function toposort()        //普通的拓扑排序，即判断是否有环
{
	var i, j;
	tot = 0;
	for (i = 1; i <= graph.vexnum; i++)
        for (j = 0; j < graph.adjMatrix[i].length; j++)
            degree[graph.adjMatrix[i][j]]++;
    //for (i = 1; i <= graph.vexnum; i++)
    //    alert("degree"+i+":"+degree[i]);
    var que = new ArrayQueue();            //队列
    que.size = 0;
	for (i = 1; i <= graph.vexnum; i++) {
		if (degree[i] == 0) {
            que.push(i);
            que.size++;
            tot++;
		}
    }

    //alert("que.size:"+que.size);

	while (que.size != 0) {
        var k =que.getFront();
        que.pop();
        que.size--;
		for (j = 0; j < graph.adjMatrix[k].length; j++) {
            var tmp = graph.adjMatrix[k][j];
			degree[tmp]--;
			if (degree[tmp] == 0) {
                que.push(tmp);
                que.size++;
				tot++;
			}
		}
    }
    que.clear();
    //alert("tot:"+tot+" "+graph.vexnum);

	//返回true表示无环
	if (tot == graph.vexnum)
		return true;
	else
		return false;
}

function setPath(){     // 存储当前路径
    final_path[path_number] = new Array();
    // var str = path_number + 1 + ":";
    var str="";
    for (var i = 0; i < graph.vexnum-1; i++){
        str += graph.vexs[path[i]].data +"->";
    }
    str += graph.vexs[path[graph.vexnum-1]].data;
    final_path[path_number].push(str);
    path_number++;
}

function printAll()    //输出所有路径中的结果
{
    var str = "";
    for(var i=0;i<path_number;i++)
        str += final_path[i] + "\n";
     alert(str);
    //document.getElementById("text").value = str;

}
function DFS(i)                       //深搜，i表示当前为第i优先级，tot表示这时候path[]数组中有多少元素
{
    //alert("ok i:"+i+" tot:"+tot+" graph.vexnum:"+graph.vexnum+" cnt:"+cnt);
	if (tot >= graph.vexnum && i >= cnt) {    //递归的终止条件
        //alert("ok2");
		setPath();   //存储当前的一条路径
        return;
    }
	do {
		for (var j = 0; j < Rank[i].length; j++)
			path[tot++] = Rank[i][j];        //记录当前优先级的排列信息
        DFS(i + 1);                    //深搜进入下一步
        tot -= Rank[i].length;                //回溯，tot回到这一层的初始状态值
        //alert("tot:"+tot+" Rank["+i+"].length:"+Rank[i].length);

        //alert((next_permutation(i, 0, Rank[i].length)));
    } while (next_permutation(i, 0, Rank[i].length));    //STL中的全排列函数
    //alert(Rank[i][0]+Rank[i][1]+Rank[i][2]);
}
function findAll()               // 找出所有路径
{
	var i, j;
	for(i=0;i<MAX_VERTEX_NUM;i++){
        degree[i]=0;
        vis[i]=0;
    }
    for (i = 1; i <= graph.vexnum; i++)
		for (j = 0; j < graph.adjMatrix[i].length; j++)
            degree[graph.adjMatrix[i][j]]++;       //整理每个顶点的入度信息
    //for (i = 1; i <= graph.vexnum; i++)
    //   alert("degree"+i+":"+degree[i]);
	cnt = tot = 0;
    var que = new ArrayQueue();
    que.size = 0;
	while (tot < graph.vexnum) {      //由于建立每一层的优先级的时候队列都是要清空一次的，所以这里用这个循环结束条件
		for (i = 1; i <= graph.vexnum; i++) {
			if (degree[i] == 0 && !vis[i]) {
                que.push(i);
                que.size++;
				tot++;
                vis[i]++;
                Rank[cnt].push(i);
			}
		}
		while (que.size != 0) {
			var k = que.getFront();
            que.pop();
            que.size--;
			for (j = 0; j < graph.adjMatrix[k].length; j++) {
                var tmp = graph.adjMatrix[k][j];
				degree[tmp]--;
            }
        }
        cnt++;
	}
    for (i = 0; i < cnt; i++)
        Rank[i].sort(); //这里sort是为了在DFS的全排列函数中输出所有
    //for (i = 0; i < cnt; i++)
    //    for(j = 0; j <Rank[i].length;j++)
    //        alert("优先级"+i+":"+Rank[i][j]);
    /*
    var str="";
        for(var k=0;k<9;k++){
            for(var kk=0;kk<Rank[k].length;kk++)
                str+=Rank[k][kk]+" ";
            str+=";";
        }
        alert("str:"+str);
        */
    tot = 0;
    DFS(0);    //i和tot的初始值都是0
    //printAll();
}

function topo()  // 拓扑排序
{
    if (toposort()) {//无环，可进行拓扑排序
        //alert("无环");
        findAll();
	}
	else {  //有环
		alert("该有向图有环存在！");
	}
}
export{
    get
}
