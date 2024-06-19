<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div>
    <span class="iconfont arr-left" @click="toLeft" :style="comStyle">&#xe6ef;</span>
    <span class="iconfont arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>
    <span class="hot-title" :style="cmStyle">{{ catName }}</span>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'

export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      consent: 0, // 选中图表
      titleFontSize: 0
    }
  },
  computed: {
    catName() {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.consent].name
      }
    },
    comStyle() {
      return {
        fontSize: this.titleFontSize * 2 + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
    cmStyle() {
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
    ...mapState(['theme'])
  },
  created() {
    // 在组件创建完成之后进行回调函数的注册
    this.$socket.registerCallBack('hotData', this.getData)
  },
  mounted() {
    this.initChart()
    // this.getData()
    // 发送数据给服务器，告诉服务器需要获取数据
    this.$socket.send({
      action: 'getData', // 调用方法
      socketType: 'hotData', // 唯一标识
      chartName: 'hot', // 哪一个图表数据的获取
      value: '' // 获取数据可以不传递
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed() {
    window.removeEventListener('reszie', this.screenAdapter)
    // 回调函数的取消
    this.$socket.unRegisterCallBack('hotData')
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.hot_ref, this.theme)
      const initOption = {
        title: {
          text: '▍热销商品销售金额占比',
          left: 20,
          top: 20
        },
        legend: {
          top: '15%',
          icon: 'circle'
        },
        tooltip: {
          show: true,
          formatter: (arg) => {
            const thirdCategory = arg.data.children
            // 计算出所有三级分类的数值总和,方便计算百分比
            let total = 0
            thirdCategory.forEach(item => {
              total += item.value
            })
            let resStr = ''
            thirdCategory.forEach(item => {
              resStr += `
              ${item.name} : ${parseInt(item.value / total * 100)}
              <br />
              `
            })
            return resStr
          }
        },
        series: [
          {
            type: 'pie',
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true
              },
              labelLine: {
                show: false
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
    },
    // res就是服务端发送给客户端的数据
    getData(res) {
      // const { data: res } = this.$http.get('hot')
      this.allData = res
      this.updateChart()
    },
    updateChart() {
      // 处理图表数据
      const titleData = this.allData.map(item => {
        return item.name
      })
      console.log(titleData)

      const legendData = this.allData[this.consent].children.map(item => {
        return item.name
      })
      const seriesData = this.allData[this.consent].children.map(item => {
        return {
          name: item.name,
          value: item.value,
          children: item.children
        }
      })
      const dataOption = {
        legend: {
          data: legendData
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: '50%',
            data: seriesData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter() {
      this.titleFontSize = this.$refs.hot_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        },
        series: [
          {
            radius: this.titleFontSize * 4.5,
            center: ['50%', '60%']
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    toLeft() {
      this.consent--
      if (this.consent < 0) {
        this.consent = this.allData.length - 1
      }
      this.updateChart()
    },
    toRight() {
      this.consent++
      if (this.consent > 2) {
        this.consent = 0
      }
      this.updateChart()
    }
  },
  watch: {
    theme() {
      // console.log('主题切换了')
      this.chartInstance.dispose() // 销毁当前的图表
      this.initChart() // 重新以最新的主题来初始化图表对象
      this.screenAdapter() // 完成图表的适配
      this.updateChart() // 更新图表的展示
    }
  }
}
</script>
<style lang="less" scoped>
.iconfont {
  position: absolute;
  cursor: pointer;
  color: #fff;
}

.arr-left {
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
}

.arr-right {
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
}

.hot-title {
  position: absolute;
  left: 80%;
  bottom: 20px;
  color: #fff;
}
</style>
