<template>
  <div>
    <div class="com-container" @dblclick="revertMap">
      <div class="com-chart" ref="map_ref"></div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import { getProvinceMapInfo } from '@/utils/map_utils'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      mapData: {} // 获取的省份地图的数据缓存
    }
  },
  created() {
    // 在组件创建完成之后进行回调函数的注册
    this.$socket.registerCallBack('mapData', this.getData)
  },
  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'mapData',
      chartName: 'map',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallBack('mapData')
  },
  methods: {
    async initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, this.theme)
      // 获取中国地图的矢量路径 http://localhost:9000/static/map/china.json
      const res = await axios.get('http://localhost:9000/static/map/china.json')
      this.$echarts.registerMap('china', res.data)
      const initOption = {
        title: {
          text: '▍商家分布',
          left: 20,
          top: 20
        },
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            areaColor: '#2E728F',
            borderColor: '#333'
          }
        },
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical'
        }
      }
      this.chartInstance.setOption(initOption)

      // 点击事件的监听
      this.chartInstance.on('click', async arg => {
        // 通过arg.name得到所点击的省份,省份是中文
        const proviceInfo = getProvinceMapInfo(arg.name)
        console.log(proviceInfo)
        // 获取这个省份的地图矢量数据
        // 判断当前所点击的这个省份的地图矢量在mapData中是否存在
        if (!this.mapData[proviceInfo.key]) {
          const { data: mapRes } = await axios.get('http://localhost:9000' + proviceInfo.path)
          this.$echarts.registerMap(proviceInfo.key, mapRes)
          this.mapData[proviceInfo.key] = mapRes.data
        }
        const changeOption = {
          geo: {
            map: proviceInfo.key
          }
        }
        this.chartInstance.setOption(changeOption)
      })
    },
    getData(res) {
      // const { data: res } = await this.$http.get('map')
      this.allData = res
      this.updateChart()
    },
    updateChart() {
      const legendArr = this.allData.map(item => {
        return item.name
      })
      const seriesArr = this.allData.map(item => {
        // 一个类别的所有散点数据
        // 如果想要在地图中显示散点的数据，给散点图添加一个配置，coordinateSystem:geo
        return {
          type: 'effectScatter',
          name: item.name,
          data: item.children,
          coordinateSystem: 'geo',
          rippleEffect: {
            scale: 8,
            brushType: 'stroke'
          }
        }
      })
      console.log(seriesArr)
      const dataOption = {
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter() {
      const titleFontSize = this.$refs.map_ref.offsetWidth / 100 * 3.6
      const adpterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize,
          textStyle: {
            fontSize: titleFontSize / 2
          }
        }
      }
      this.chartInstance.setOption(adpterOption)
      this.chartInstance.resize()
    },
    revertMap() {
      const revertOption = {
        geo: {
          map: 'china'
        }
      }
      this.chartInstance.setOption(revertOption)
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
