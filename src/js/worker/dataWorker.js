self.addEventListener('message', function(e) {
  const apiUri = e.data.apiUri
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     successTask(this.responseText)
    }
  };
  const _that = self
  xhttp.onprogress = function(event) {
    if(event.lengthComputable) {
      _that.postMessage({
        status: 'progress',
        data: (event.loaded / event.total) * 100
      });
    }
  };
  xhttp.open('GET', apiUri, true);
  xhttp.send();
  function successTask(data) {
    try {
      const stringParseIntoJSON = JSON.parse(data)
      self.postMessage({
        status: 'done',
        data: stringParseIntoJSON
      });
      self.close()
    } catch(err) {
      throw new Error(err)
    }
  }
}, false);
