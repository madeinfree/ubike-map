self.addEventListener('message', function(e) {
  const apiUri = e.data.apiUri
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     successTask(this.responseText)
    }
  };
  xhttp.open('GET', apiUri, true);
  xhttp.send();
  function successTask(data) {
    try {
      const stringParseIntoJSON = JSON.parse(data)
      self.postMessage(stringParseIntoJSON);
    } catch(err) {
      throw new Error(err)
    }
  }
}, false);
