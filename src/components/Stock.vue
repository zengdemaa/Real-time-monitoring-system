<!-- 商家销量统计的横向柱状图 -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div>
  </div>
</template>
<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      currentIndex: 0, // 当前显示的数据
      timerID: null
    }
  },
  created() {
    this.$socket.registerCallBack('stockData', this.getData)
  },
  // 创建实例对象后
  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'stockData',
      chartName: 'stock',
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
    this.$socket.unRegisterCallBack('stockData')
  },
  methods: {
    // 初始化echartInstance对象
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.stock_ref, this.theme)
      // 对图表进行初始化配置的控制
      const initOption = {
        title: {
          text: '▍库存和销量分析',
          left: 20,
          top: 20
        }
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
      // const { data: res } = await this.$http.get('stock')
      this.allData = res
      // this.totalPage = Math.ceil(this.allData.length / 5)
      // 数据获取后进行图表的更新
      this.updateChart()
      this.startInterval()
    },
    // 更新图表
    updateChart() {
      const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ]
      const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8811C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#32E5E5', '#2E72BF']
      ]
      const start = this.currentIndex * 5
      const end = (this.currentIndex + 1) * 5
      const showData = this.allData.slice(start, end)
      const seriesData = showData.map((item, index) => {
        return {
          type: 'pie',
          center: centerArr[index],
          hoverAnmation: false, // 关闭移入饼图的动画效果
          labelLine: {
            show: false // 隐藏指示线
          },
          label: {
            position: 'center',
            color: colorArr[index][0]
          },
          data: [
            {
              name: item.name + '\n\n' + item.sales,
              value: item.sales,
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: colorArr[index][0]
                  },
                  {
                    offset: 1,
                    color: colorArr[index][1]
                  }
                ])
              }
            },
            {
              value: item.stock,
              itemStyle: {
                color: '#333843'
              }
            }
          ]
        }
      })
      const dataOption = {
        series: seriesData
      }
      this.chartInstance.setOption(dataOption)
    },
    startInterval() {
      // 函数节流
      if (this.timerID) {
        clearInterval(this.timerID)
      }
      this.timerID = setInterval(() => {
        this.currentIndex++
        const page = parseInt(this.allData.length / 5 - 1)
        if (this.currentIndex > page) {
          this.currentIndex = 0
        }
        this.updateChart()
      }, 5000)
    },
    // 当浏览器的大小发生变化时，进行屏幕的适配
    screenAdapter() {
      const titleFontSize = this.$refs.stock_ref.offsetWidth / 100 * 3.6
      const innerRadis = titleFontSize * 2.8
      const ouuterRadius = innerRadis * 1.12
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            type: 'pie',
            radius: [ouuterRadius, innerRadis],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [ouuterRadius, innerRadis],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [ouuterRadius, innerRadis],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [ouuterRadius, innerRadis],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [ouuterRadius, innerRadis],
            label: {
              fontSize: titleFontSize / 2
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
