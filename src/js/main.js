(function(w, d, $) {

  w.asyncToGetUbikeData = asyncToGetUbikeData

  function asyncToGetUbikeData() {

    let loadingBar = null
    function createLoadingBar() {
      loadingBar = document.createElement('div')
      loadingBar.id = 'map-loading-bar'
      loadingBar.innerHTML = '找尋資料與位置中...'
      loadingBar.classList.add('map-loading-bar-display')
      $(loadingBar).insertBefore($('#map'))
    }

    createLoadingBar()

    $.ajax('/api/v1/ubike-db.json', {
      success: successTask
    })

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
      zoom: 13
    }

    function initMap(dataResult) {
      getMap()
      createMarker(dataResult)
      createPersonGPSMarker()
    }

    function getMap() {
      map = new google.maps.Map(document.getElementById('map'), defaultSetting)
    }

    function createMarker(dataResult) {
      const mapData = dataResult
      mapData.map((site, index) => {
        const parseLetStringIntoFloat = parseFloat(site.lat),
              parseLngStringIntoFloat = parseFloat(site.lng),
              siteActive = site.act,
              siteNameTW = site.sna,
              siteNameEN = site.snaen,
              siteAddressTW = site.ar,
              siteAddressEN = site.aren,
              totalBike = site.tot,
              remainBike = site.sbi,
              returnBike = site.bemp,
              updateTime = site.mday
        const infowindow = new google.maps.InfoWindow({
          content: `
            <div>站點名稱(中文)：${siteNameTW}</div>
            <div>站點名稱(EN)：${siteNameEN}</div>
            <div>總共車位：${totalBike}</div>
            <div>剩餘車位：${remainBike}</div>
            <div>可還車位：${returnBike}</div>
            <div>地址(中文)：${siteAddressTW}</div>
            <div>地址(EN)：${siteAddressEN}</div>
            <div>是否還在營運：${siteActive === '1' ? '營運中' : '已暫停營運'}</div>
            <div>資料最後更新時間：${updateTime}</div>
          `
        });

        const marker = new google.maps.Marker({
          position: { lat: parseLetStringIntoFloat, lng: parseLngStringIntoFloat },
          map: map,
          title: site.sna,
          label: {
            fontFamily: 'Fontawesome',
            text: '\uf206'
          }
        })

        function openInfoWindow() {
          infowindow.open(map, marker)
        }

        marker.addListener('click', openInfoWindow)
      })
    }

    function createPersonGPSMarker() {
      navigator.geolocation.getCurrentPosition(function(location) {
        const lat = location.coords.latitude
        const lng = location.coords.longitude
        new google.maps.Marker({
          position: { lat: lat, lng: lng },
          map: map,
          title: '個人位置',
          label: {
            fontFamily: 'Fontawesome',
            text: '\uf007'
          }
        })
      const center = new google.maps.LatLng(lat, lng);
      map.panTo(center);
      loadingBar.classList.remove('map-loading-bar-display')
      loadingBar.classList.add('map-loading-bar-display-hidden')
      });
    }
  }
}(window, document, $))
