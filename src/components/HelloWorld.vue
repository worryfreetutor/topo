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
      action=""
      :before-upload="uploadFile"
      v-show="inputType === 'file'"
      style="width:400px;padding: 80px;">
      <div style="padding: 20px 0">
        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
        <p>点击或将文件拖拽到这里上传</p>
      </div>
    </Upload>
    <b>result: {{ relationStr }}</b>
    <br>
    <!-- 输出文本框 -->
    <Input v-model="result" readonly type="textarea" :autosize="{minRows: 2,maxRows: 6}" placeholder="输出结果"/>
    <br>
    <!-- 导出文件按钮 -->
    <Button size="large" icon="ios-download-outline" type="primary" 
      v-show="relationStr !== ''" shape="circle" @click="downloadFile"></Button>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      inputText: '',  // 输入框输入的内容
      inputType: 'text',  // text or file 输入的类型
      relationStr: '',  // 经过处理的节点关系数据
      result: '2141514h'  // 结果数据
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
        }
      }
      return false;
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
        this.download(this.relationStr, 'test.txt');
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
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
