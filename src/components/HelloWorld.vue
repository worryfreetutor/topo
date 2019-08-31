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
    <!-- 输入文本框 -->
    <Input v-model="inputText" v-show="inputType === 'text'"
      type="textarea" :autosize="{minRows: 2,maxRows: 6}" placeholder="请按格式输入数据..."
      @on-blur="checkInputText"
    />
    <!-- 上传文件框 -->
    <Upload
      type="drag"
      accept=".txt,.dat"
      action=""
      :before-upload="uploadFile"
      v-show="inputType === 'file'"
      style="width:400px;padding: 80px;">
      <div style="padding: 20px 0">
        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
        <p>点击或将文件拖拽到这里上传</p>
      </div>
    </Upload>
    <!-- 关系图 -->
    <b>关系图如下</b>
    <Card style="width:100%">
      <div id="graph" style="width:100%;height:600px"></div>
    </Card>
    <b>result: {{ relationStr }}</b>
    <br>
    <!-- 选择高亮显示课程名 -->
    <Select v-model="highLight" clearable style="width:200px">
      <Option v-for="item in courseList" :value="item" :key="item">{{ item }}</Option>
    </Select>
    <br>
    <b>{{ highLight }}</b>
    <br>
    <!-- 输出文本框(高亮显示) -->
    <div>
      <div v-for="(item, index) in result" :key="index"  @click="showCoursePath(index)" style="cursor: pointer;">
        <font>{{ item.split(highLight)[0] }}</font>
        <font v-show="item.indexOf(highLight) !== -1"  style="color: red;">{{ highLight }}</font>
        <font>{{ item.split(highLight)[1] }}</font>
      </div>
    </div>
    <br>
    <!-- 导出文件按钮 -->
    <Button size="large" icon="ios-download-outline" type="primary"
      v-show="relationStr !== ''" shape="circle" @click="downloadFile"></Button>
  </div>
</template>

<script>
  import echarts from "echarts"
export default {
  name: 'HelloWorld',
  data() {
    return {
      inputText: '',  // 输入框输入的内容
      inputType: 'text',  // text or file 输入的类型
      relationStr: '',  // 经过处理的节点关系数据
      result: [
        'a->b->c',
        'd->e->f'
      ],  // 结果数组
      // 不会起变量名 T_T
      courseList: [
        'a',
        'b',
        'c'
      ],  // 所有课程的数组
      highLight: ' ',  // 高亮显示的课程名，初始值为空格!
      showPathIndex: -1,  // 可视化展示的路径的下标，初始值为-1?
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
          // 初始化关系表
          this.initEcharts(val)
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
          // 初始化关系表
          this.initEcharts(val)
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
        tooltip: {},
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
      let set = new Set()
      let data = []
      // 组装links-结点之间的关系
      temp.forEach(ele =>{
        let source = ele.match(/<(\S*),/)[1]
        let target = ele.match(/,(\S*)>/)[1]
        set.add(source)
        set.add(target)
        links.push({
          source,
          target
        })
      })
      // 组装data-多少个结点
      set.forEach(ele => {
        data.push({
          name:ele
        })
      })
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
    showCoursePath(index) {
      this.showPathIndex = index;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
