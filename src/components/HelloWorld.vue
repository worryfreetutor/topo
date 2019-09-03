<template>
  <div>
    <!-- 单选框 -->
    <RadioGroup v-model="inputType">
      <Radio label="text">
        <Icon type="md-create" />
        <span>输入数据</span>
      </Radio>
      <Radio label="file">
        <Icon type="md-cloud-upload" />
        <span>从文件导入数据</span>
      </Radio>
    </RadioGroup>
    <br>
    <br>
    <!-- 输入文本框 -->
    <Input v-model="inputText" v-show="inputType === 'text'"
      type="textarea" :autosize="{minRows: 2,maxRows: 6}" placeholder="请按格式输入数据..."
      @on-blur="checkInputText"
    />
    <br>
    <!-- 上传文件框 -->
    <Upload
      type="drag"
      accept=".txt,.dat"
      action=""
      :before-upload="uploadFile"
      v-show="inputType === 'file'">
      <div style="padding: 20px 0">
        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
        <p>点击或将文件拖拽到这里上传</p>
      </div>
    </Upload>
    <br>
    <!-- 关系图 -->
    <b>关系图如下</b>
    <Card style="width:100%">
      <div id="graph" style="width:100%;height:600px"></div>
    </Card>
    <br>
    <!-- 选择高亮显示课程名 -->
    <Select v-model="highLight" clearable style="width:200px;" v-show="result.length !== 0">
      <Option v-for="item in courseList" :value="item" :key="item">{{ item }}</Option>
    </Select>
    <font>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</font>
    <!-- 导出文件按钮 -->
    <Button :size="buttonSize" icon="ios-download-outline" type="primary"
      v-show="result.length !== 0" @click="downloadFile">导出数据文件</Button>
    <br>
    <br>
    <!-- 输出文本框(高亮显示) -->
    <div style="border:1px solid #adcd3c;border-radius: 5px;background:#f2fddb" v-show="result.length !== 0">
      <font>生成课程安排结果</font>
      <div v-for="(item, index) in result" :key="index"  @click="showPathGraph(index)" style="cursor: pointer;font-size: 24px;">
        <font>{{ index+1 }}&nbsp;&nbsp;</font>
        <font>{{ item[0].split(highLight)[0] }}</font>
        <font v-show="item[0].indexOf(highLight) !== -1"  style="color: red;">{{ highLight }}</font>
        <font>{{ item[0].split(highLight)[1] }}</font>
      </div>
    </div>
    <br>
    <b v-show="result.length !== 0">路径图如下</b>
    <Card style="width:100%" v-show="result.length !== 0">
      <div id="roadmap" style="width:100%;height:600px"></div>
    </Card>
  </div>
</template>

<script>
  import echarts from "echarts"
  import {get} from './topo.js'
export default {
  name: 'HelloWorld',
  data() {
    return {
      inputText: '',  // 输入框输入的内容
      inputType: 'text',  // text or file 输入的类型
      relationStr: '',  // 经过处理的节点关系数据
      result: [],  // 结果数组
      // 不会起变量名 T_T
      courseList: [], // 所有课程的数组
      highLight: ' ',  // 高亮显示的课程名，初始值为空格!
      showPathIndex: -1,  // 楚煜大佬：可视化展示的路径的下标，初始值为-1? 小麦 ： ojbk，为楚煜大佬端茶递水。
      map: new Map() //使用全局变量map做键值对，实现数据和课程名字对应起来
    }
  },
  methods: {
    // 处理输入框输入
    checkInputText() {
      const val = this.checkInput(this.inputText);
      if (this.inputType === 'text') {
        if(!val) {
          this.$Notice.error({
            title: '输入格式错误',
          })
        } else {
          this.relationStr = val;
          // // 初始化关系表
          // this.initEcharts(val)

          // 拓扑排序
          this.result = get(val)
          if(this.result){
            // 初始化关系表
            this.initEcharts(val)
          }
        }
      }
    },
    // 导入文件数据
    uploadFile(file) {
      let reader = new FileReader();
      reader.readAsText(file)
      reader.onload = e => {
        this.$Notice.success({
          title: '导入成功'
        });
        const val = this.checkInput(e.target.result);
        if(!val) {
          this.$Notice.error({
            title: '输入格式错误',
          })
        } else {
          this.relationStr = val;
          // // 初始化关系表
          // this.initEcharts(val)
          // // 拓扑排序
          // this.result = get(val)
          // 拓扑排序
          this.result = get(val)
          if(this.result){
            // 初始化关系表
            this.initEcharts(val)
          }
        }
      }
      return false;
    },
    // 初始化图表
    initEcharts(val){
      // 处理数据为绘图需要的格式
      const {data , links} = this.organizeData(val)
      const myChart = echarts.init(document.getElementById("graph"))
      const option = {
        title: {
          text: '关系图'
        },
        tooltip: {
          formatter: '{b0}: {c0}'
        },
        toolbox:{
          show: true,
          feature: {
            restore: {},
            saveAsImage: {}
          }
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series : [
          {
            type: 'graph',
            layout: 'force',
            symbolSize: 50,
            roam: true,
            label: {
              normal: {
                fontSize:20,
                show: true,
              }
            },
            // 圆圈的背景颜色
            itemStyle:{
              color:'#F4606C'
            },
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: 10,
            edgeLabel: {
              normal: {
                textStyle: {
                  fontSize: 20
                }
              }
            },
            force: {
              repulsion: 2500,
              edgeLength: 500
            },
            data: data,
            // links: [],
            links: links,
            lineStyle: {
              normal: {
                opacity: 0.9,
                width: 4,
                curveness: 0
              }
            }
          }
        ]
      };
      myChart.setOption(option);
    },
    // 格式化数据
    organizeData(val){
      const temp = val.split(' ')
      let links = []
      // let set = new Set()
      let data = []
      // 组装links-结点之间的关系
      // temp.forEach(ele =>{
      //   let source = ele.match(/<(\S*),/)[1]
      //   let target = ele.match(/,(\S*)>/)[1]
      //   set.add(source)
      //   set.add(target)
      //   links.push({
      //     source,
      //     target
      //   })
      // })
      let num = 1
      this.map = new Map() // 初始化全局变量map
      let map = this.map
      temp.forEach(ele => {
        let source = ele.match(/<(\S*),/)[1]
        let target = ele.match(/,(\S*)>/)[1]
        if(!this.map.has(source)){
          this.map.set(source,num++ + '')
        }
        if(!this.map.has(target)){
          map.set(target,num++ + '')
        }
        links.push({
          source:map.get(source),
          target:map.get(target)
        })
      })
      this.courseList = [] // 清空全局存储结点数组
      // 组装data-多少个结点
      map.forEach((value,key)=>{
        data.push({
          name:value,
          value: key
        })
        this.courseList.push(key)
      })
      // let i = 1 // 结点代号，防止名字课程的名字过长。
      // set.forEach(ele => {
      //   data.push({
      //     name: i++,
      //     value: ele
      //   })
      //   this.courseList.push(ele)
      // })
      return {data,links}
    },
    // 校验输入格式
    checkInput(input) {
      // 去掉所有空白字符
      input = input.replace(/\s*/g,'');
      // 校验 <a,b> 格式
      input = /^(<[\u4e00-\u9fa5_a-zA-Z0-9]+,[\u4e00-\u9fa5_a-zA-Z0-9]+>)+$/.test(input) ? input : '';
      // 插入空格
      input = input.replace(/></g, '> <');
      return input;
    },
    // 导出文件
    downloadFile() {
      if ('download' in document.createElement('a')) {
        const fileData = this.result.join('\n');
        this.download(fileData, 'test.txt');
      } else {
        this.$Notice.error({
          title: '出错了!!!'
        })
      }
    },
    download(content, filename) {
      let link = document.createElement('a');
      link.download = filename;
      link.style.display = 'none';
      let blob = new Blob([content]);
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    // 点击显示路径图的下标
    showPathGraph(index) {
      this.showPathIndex = index;
      const {data,links} = this.organizeResult()  // 由于有showPathIndex全局变量，我们这里不用传参数（写给林总看的）
      const myChart = echarts.init(document.getElementById("roadmap"))
      const option = {
        title: {
          text: '路径图'
        },
        tooltip: {
          formatter: '{b0}: {c0}'
        },
        toolbox:{
          show: true,
          feature: {
            restore: {},
            saveAsImage: {}
          }
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series : [
          {
            type: 'graph',
            layout: 'force',
            symbolSize: 50,
            roam: true,
            label: {
              normal: {
                fontSize:20,
                show: true,
              }
            },
            // 圆圈的背景颜色
            itemStyle:{
              color:'#F4606C'
            },
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: 10,
            edgeLabel: {
              normal: {
                textStyle: {
                  fontSize: 20
                }
              }
            },
            force: {
              repulsion: 2500,
              edgeLength: 500
            },
            data: data,
            // links: [],
            links: links,
            lineStyle: {
              normal: {
                opacity: 0.9,
                width: 4,
                curveness: 0
              }
            }
          }
        ]
      };
      myChart.setOption(option);
    },
    // 处理排序后的结果，返回绘图需要的数据格式
    organizeResult(){
      let links = []
      let data = []
      const unformattedata = this.result[this.showPathIndex][0]
      const temp = unformattedata.split('->')
      // 遍历temp数组，获取结点之间的关系
      for(let i = 0 ; i<temp.length - 1; i++){
        links.push({
          source:this.map.get(temp[i]),
          target:this.map.get(temp[i+1])
        })
      }
      temp.forEach( ele => {
        data.push({
          name:this.map.get(ele),
          value:ele
        })
      })
      return {data,links}
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
