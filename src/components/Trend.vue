<template>
  <div>
    <div class="com-container">
      <div class="title" :style="comStyle">
        <span>▍{{ choierTitle }}</span>
        <span class="iconfont title-icon" @click="showChoice = !showChoice" :style="comStyle">&#xe6eb;</span>
        <div class="select-con" v-show="showChoice">
          <div class="select-item" v-for="item in selectType" :key="item.key" @click="handelSelect(item.key, item.text)">
            {{ item.text }}
          </div>
        </div>
      </div>
      <div class="com-chart" ref="trend_ref"></div>
    </div>
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
      showChoice: false, // 是否显示可选项
      choiceType: 'map', // 显示的数据类型呢
      choierTitle: '地区销量趋势',
      titleFontSize: 0 // 指明标题的字体的大小
    }
  },
  created() {
    this.$socket.registerCallBack('trendData', this.getData)
  },
  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'trendData',
      chartName: 'trend',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallBack('trendData')
  },
  computed: {
    selectType() {
      if (!this.allData) {
        return []
      } else {
        return this.allData.type.filter(item => {
          return item.key !== this.choiceType
        })
      }
    },
    comStyle() {
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
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
  },
  methods: {
    // 初始化echartInstance对象
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme)
      const initOption = {
        xAxis: {
          type: 'category',
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          left: 20,
          top: '20%',
          icon: 'circle'
        },
        grid: {
          left: '3%',
          right: '4%',
          top: '35%',
          bottom: '1',
          containLabel: true
        }
      }
      this.chartInstance.setOption(initOption)
    },
    getData(res) {
      // axios获得的数据是一个promise对象，通过async和await获取
      // const { data: res } = await this.$http.get('trend')
      this.allData = res
      this.updateChart()
      console.log(res)
    },
    // 更新图表
    updateChart() {
      const colorArr1 = [
        'rgba(11,168,44,0.5)',
        'rgba(44,110,255,0.5)',
        'rgba(22,242,255,0.5)',
        'rgba(254,33,30,0.5)',
        'rgba(250,105,0,0.5)'
      ]

      const colorArr2 = [
        'rgba(11,168,44,0)',
        'rgba(44,110,255,0)',
        'rgba(22,242,255,0)',
        'rgba(254,33,30,0)',
        'rgba(250,105,0,0)'
      ]

      // 处理数据
      // 类目轴的数据
      const timeArr = this.allData.common.month
      // y轴的数据 series下的数据
      const valueArr = this.allData[this.choiceType].data
      const seriesArr = valueArr.map((item, index) => {
        return {
          name: item.name,
          type: 'line',
          data: item.data,
          stack: [this.choiceType],
          areaStyle: {
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colorArr1[index]
              }, // %0的颜色
              {
                offset: 1,
                color: colorArr2[index]
              }// %100的颜色
            ])
          }
        }
      })
      // 图例的数据
      const legendArr = valueArr.map(item => {
        return item.name
      })
      const dataOption = {
        xAxis: {
          data: timeArr
        },
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter() {
      this.titleFontSize = this.$refs.trend_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          ietmHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      // 图表的适配操作,手动的调用图表对象的resize，才能产生效果
      this.chartInstance.resize()
    },
    handelSelect(currentType, currentTitle) {
      this.choiceType = currentType
      this.choierTitle = currentTitle
      this.showChoice = false
      this.updateChart()
    }
  }
}
</script>
<style lang="less" scoped>
.title {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 10;
  color: #fff;

  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  }

  .select-con {
    transition: all 0.3s linear;

    .select-item {
      background: rgba(0, 0, 0, 0.8);
      text-align: center;
      padding: 8px 15px;
      border-bottom: 1px solid rgba(59, 146, 222, 0.5);
    }
  }
}
</style>
