(function(w, d, $) {

  w.asyncToGetUbikeData = asyncToGetUbikeData

  const INPROGRESS = 'progress',
        DONE = 'done',
        streets = new Set(),
        noActiveStreets = []

  function asyncToGetUbikeData() {

    let loadingBar = null,
        worker = null
    function createLoadingBar() {
      loadingBar = document.createElement('div')
      loadingBar.id = 'map-loading-bar'
      loadingBar.innerHTML = '找尋資料與位置中... 0%'
      loadingBar.classList.add('map-loading-bar-display')
      $(loadingBar).insertBefore($('#map'))
    }

    function createWorker() {
      worker = new Worker('/js/worker/dataWorker.js')
      worker.postMessage({
        apiUri: '/api/v1/ubike-db.json'
      })
      worker.addEventListener('message', function(e) {
        const workerData = e.data
        switch(workerData.status) {
          case INPROGRESS:
            const progressPercent = parseInt(workerData.data, 10)
            loadingBar.innerText = '找尋資料與位置中...' + progressPercent + '%'
          break
          case DONE:
            successTask(workerData.data);
          break
        }
      }, false);
    }

    createLoadingBar()
    createWorker()

    function successTask(data) {
      if (data && data.success) {
        const dataResult = data.result.records
        initMap(dataResult)
      }
    }

    let map
    let defaultSetting = {
      center: {
        lat: 25.0479146,
        lng: 121.5150967
      },
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false
    }

    function initMap(dataResult) {
      getMap()
      createMarker(dataResult)
      createPersonGPSMarker()
      panelController(map)
    }

    function getMap() {
      map = new google.maps.Map(document.getElementById('map'), defaultSetting)
    }

    function createMarker(dataResult) {
      const mapData = dataResult
      const markers  = mapData.map((site, index) => {
        const parseLetStringIntoFloat = parseFloat(site.lat),
              parseLngStringIntoFloat = parseFloat(site.lng),
              siteActive = site.act,
              siteNameTW = site.sna,
              siteNameEN = site.snaen,
              siteAddressTW = site.ar,
              siteAddressEN = site.aren,
              siteArea = site.sarea,
              totalBike = site.tot,
              remainBike = site.sbi,
              returnBike = site.bemp,
              updateTime = site.mday

        /*
         * 記錄可用區域
         */
        streets.add(siteArea)
        if (siteActive !== '1') {
          noActiveStreets.push({
            siteNameTW,
            siteNameEN,
            parseLetStringIntoFloat,
            parseLngStringIntoFloat
          })
        }
        const infowindow = new google.maps.InfoWindow({
          content: `
            <div>站點名稱(中文)：${siteNameTW}</div>
            <div>站點名稱(EN)：${siteNameEN}</div>
            <div>總共車位：${totalBike}</div>
            <div>可租車位：${remainBike}</div>
            <div>可還車位：${returnBike}</div>
            <div>地址(中文)：${siteAddressTW}</div>
            <div>地址(EN)：${siteAddressEN}</div>
            <div>是否還在營運：${siteActive === '1' ? '營運中' : '已暫停營運'}</div>
            <div>資料最後更新時間：${cutUpdatedDate(updateTime)}</div>
          `
        });

        const markerIcon = markerLabel(remainBike, siteActive)
        const marker = new google.maps.Marker({
          position: { lat: parseLetStringIntoFloat, lng: parseLngStringIntoFloat },
          map: map,
          title: site.sna,
          icon: markerIcon,
          label: {
            text: remainBike,
            color: parseInt(siteActive, 10) !== 1 ? 'white' : 'black'
          }
        })

        marker.addListener('click', openInfoWindow)

        function openInfoWindow() {
          infowindow.open(map, marker)
        }

        /*
         * 確認地圖 label 顏色
         * 綠色 - 正常營運，尚有車位
         * 橘色 - 正常營運，無車位
         * 黑色 - 停止營運
         */
        function markerLabel(remainBike, siteActive) {
          if (parseInt(remainBike, 10) > 0 && parseInt(siteActive, 10) === 1) {
            return {
              url: '/images/status/can-use-marker.png',
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(0, 20),
              labelOrigin: new google.maps.Point(12, 12)
            }
          } else if (parseInt(remainBike, 10) === 0 && parseInt(siteActive, 10) === 1) {
            return {
              url: '/images/status/cant-use-marker.png',
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(0, 20),
              labelOrigin: new google.maps.Point(12, 12)
            }
          } else if (parseInt(siteActive, 10) !== 1) {
            return {
              url: '/images/status/not-active-marker.png',
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(0, 20),
              labelOrigin: new google.maps.Point(12, 12)
            }
          }
        }

        function cutUpdatedDate(date) {
          return date.slice(0, 4) + '/' +
                  date.slice(4, 6) + '/' +
                  date.slice(6, 8) + ' ' +
                  date.slice(8, 10) + ':' +
                  date.slice(10, 12) + ':' +
                  date.slice(12, 14)
        }

        return marker
      })
      new MarkerClusterer(map, markers, {
          imagePath: 'http://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
        }
      );
      loadingBar.classList.remove('map-loading-bar-display')
      loadingBar.classList.add('map-loading-bar-display-hidden')
    }

    function createPersonGPSMarker() {
      // navigator.geolocation.getCurrentPosition(function(location) {
      //   const lat = location.coords.latitude
      //   const lng = location.coords.longitude
      //   new google.maps.Marker({
      //     position: { lat: lat, lng: lng },
      //     map: map,
      //     title: '個人位置',
      //     label: {
      //       fontFamily: 'Fontawesome',
      //       text: '\uf007'
      //     }
      //   })
      // const center = new google.maps.LatLng(lat, lng);
      // map.panTo(center);
      // });
    }
  }

  /*
   * 控制側邊欄位
   */

  function panelController(map) {
    const panel = $('#control-panel'),
           panelArrow = $('#control-panel-handle'),
           panelTipsTotalArea = $('#total-area'),
           panelTipsTotalNoActiveArea = $('#total-no-active-area')
    let panelArrowIsRight = false
    panelArrow.on('click', e => {
      if (panelArrowIsRight) {
        panelArrow[0].classList.remove('fa-arrow-left')
        panelArrow[0].classList.add('fa-arrow-right')
        panel.css({
          left: '-370px'
        })
        panelArrowIsRight = false
      } else {
        panelArrow[0].classList.remove('fa-arrow-right')
        panelArrow[0].classList.add('fa-arrow-left')
        panel.css({
          left: '0px'
        })
        panelArrowIsRight = true
      }
    })
    const streetsIntoHTML = Array.from(streets).reduce((curr, street, index) => {
      return index === 0 ? curr + street : curr + '、' + street
    }, '')
    const noActiveAreaIntoHTML = Array.from(noActiveStreets).reduce((curr, street, index) => {
      return index === 0 ?  curr + `<u><span id="no-active-streets-${index}">` + street.siteNameTW + '(' + street.siteNameEN + ')' + '</span></u>'
        :
        curr + `<span id="no-active-streets-${index}">` + '、' + '<u>' + street.siteNameTW + '(' + street.siteNameEN + ')' + '</span></u>'
    }, '')
    panelTipsTotalArea.html(streetsIntoHTML)
    panelTipsTotalNoActiveArea.html(noActiveAreaIntoHTML)
    /*
     * 綁定已結束營運位置
     */
    noActiveStreets.forEach((noActiveStreet, index) => {
      const street = $(`#no-active-streets-${index}`)
      street.css({
        cursor: 'pointer'
      })
      street.on('click', () => {
        const center = new google.maps.LatLng(noActiveStreet.parseLetStringIntoFloat, noActiveStreet.parseLngStringIntoFloat);
        map.panTo(center)
        map.setZoom(17)
      })
    })
  }

}(window, document, $))
