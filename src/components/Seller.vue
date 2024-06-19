<!-- 商家销量统计的横向柱状图 -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
  </div>
</template>
<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      // 当前显示页码
      currentPage: 1,
      totalPage: 0,
      // 定时器标识
      timerID: null
    }
  },
  created() {
    this.$socket.registerCallBack('sellerData', this.getData)
  },
  // 创建实例对象后
  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'sellerData',
      chartName: 'seller',
      value: ''
    })
    // 添加监听screenAdapter方法
    window.addEventListener('resize', this.screenAdapter)
    // 在页面加载完成的时候对屏幕进行主动的适配
    this.screenAdapter()
  },
  destroyed() {
    clearInterval(this.timerID)
    // 在组件销毁时，需要将监听器消耗掉
    window.removeEventListener('resiza', this.screenAdapter)
    this.$socket.unRegisterCallBack('sellerData')
  },
  methods: {
    // 初始化echartInstance对象
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, this.theme)
      // 对图表进行初始化配置的控制
      const initOption = {
        title: {
          text: '▍商家销售统计',
          left: 20,
          top: 20
        },
        grid: {
          top: '20%',
          left: '3%',
          right: '6%',
          bottom: '3%',
          containLabel: true // 距离是包含坐标轴上的文字
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              color: '2D3443'
            }
          }
        },
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: '#fff'
              }
            },
            itemStyle: {
              // 指明线性渐变
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                {
                  offset: 0,
                  color: '#5052EE'
                },
                {
                  offset: 1,
                  color: '#AB6EE5'
                }
              ])
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
      // 对图表对象进行鼠标事件的监听
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerID)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 获取服务器的数据
    getData(res) {
      // axios获得的数据是一个promise对象，通过async和await获取
      // const { data: res } = await this.$http.get('seller')
      this.allData = res
      // 对数组进行排序
      this.allData.sort((a, b) => {
        return a.value - b.value
      })
      this.totalPage = Math.ceil(this.allData.length / 5)
      // 数据获取后进行图表的更新
      this.updateChart()
      this.startInterval()
    },
    // 更新图表
    updateChart() {
      const start = (this.currentPage - 1) * 5
      const end = this.currentPage * 5
      const showData = this.allData.slice(start, end)
      const sellerNames = showData.map((item) => {
        return item.name
      })
      const sellerValues = showData.map((item) => {
        return item.value
      })
      const dataOption = {
        yAxis: {
          data: sellerNames
        },
        series: [
          {
            data: sellerValues
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    startInterval() {
      // 函数节流
      if (this.timerID) {
        clearInterval(this.timerID)
      }
      this.timerID = setInterval(() => {
        this.currentPage++
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1
        }
        this.updateChart()
      }, 3000)
    },
    // 当浏览器的大小发生变化时，进行屏幕的适配
    screenAdapter() {
      const titleFontSize = this.$refs.seller_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize
            }
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0]
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      // 图表的适配操作,手动的调用图表对象的resize，才能产生效果
      this.chartInstance.resize()
    }
  },
  computed: {
    ...mapState(['theme'])
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
<style lang="less" scoped></style>
