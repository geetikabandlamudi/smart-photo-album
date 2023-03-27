
$(document).ready(function() {
    var queryBtn = document.getElementById('query-button');
    var uploadBtn = document.getElementById('upload-button');
    var fileInput = document.getElementById('fileInput');
    var queryInput = document.getElementById('query');
    var fileNameSpan = document.getElementById('file-name');
    var audioIcon = document.getElementById('microphone-icon');

    
    /* ------------------------------------ QUERY INPUT EVENT LISTENER ------------------------------------- */
    queryInput.addEventListener('input', function() {
      var query = $('#query').val()
      if (query) {
        queryBtn.disabled = false;
      } else {
        queryBtn.disabled = true;
      }
    });

    queryBtn.addEventListener('click', function() {
      const container = document.getElementById('response');
      container.innerHTML = '';
      queryBtn.disabled = true;
      document.body.style.cursor='wait';
        query = $('#query').val();
        if(query == '') {
          container.textContent = 'You did not give me a category to search!';
          return;
        }
        callSearchPicturedApi(query)
        .then(response => response)
        .then(data => {
          // Display a success message
          const container = document.getElementById('response');
          console.log(data['data']['body'])
          urls = JSON.parse(data['data']['body'])['pictures'];
          console.log(urls, urls == undefined)
          if (urls == undefined || urls.length == 0) {
            container.textContent = 'Oops, no pictures available for this query!';
          }
          else{
            for (let i = 0; i < urls.length; i++) {
              const img = document.createElement("img");
              img.src = urls[i];
              container.appendChild(img);
            }
          }
          document.body.style.cursor='default';
          // message.textContent = data;
        })
        .catch(error => {
          // Display an error message
          const message = document.getElementById('response');
          message.textContent = 'Error in getting images: ' + error.message;
          document.body.style.cursor='default';
        });

    }, false);

    /* ------------------------------------ FILE INPUT EVENT LISTENER ------------------------------------- */
    fileInput.addEventListener('change', function() {
      var fileName = this.value.split("\\").pop();
      fileNameSpan.textContent = fileName;
      if (fileInput.value) {
        uploadBtn.disabled = false;
      } else {
        uploadBtn.disabled = true;
      }
    });


    uploadBtn.addEventListener('click', function()  {
      const fileInput = document.getElementById('fileInput');
      var reader = new FileReader();
      var file = fileInput.files[0];
      reader.onload = function (event) {
        const imageData = btoa(event.target.result);
        console.log('Reader body : ', imageData);
        
        callChatbotApi(imageData, file)
          .then(response => response)
          .then(data => {
            // Display a success message
            const message = document.getElementById('message');
            message.textContent = 'File uploaded successfully!';
            fileNameSpan.textContent = '';
            document.getElementById("upload-form").reset();
          })
          .catch(error => {
            // Display an error message
            const message = document.getElementById('message');
            message.textContent = 'Error uploading file: ' + error.message;
          });
    };
    reader.readAsBinaryString(fileInput.files[0]);
  }, false);

  /* ------------------------------------ VOICE RECOGNITION ------------------------------------- */

    const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
    recognition.continuous = true;
    
    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      queryInput.value = transcript;
      queryBtn.disabled = false;
    };
    recognition.onspeechend = function() {
      recognition.stop();
    };

    audioIcon.addEventListener("click", function() {
      recognition.start();
    });

    /* ------------------------------------ API CALLS ------------------------------------- */

    function callChatbotApi(filedata, file) {
        // params, body, additionalParams
        var re = /(?:\.([^.]+))?$/;
        var filename = $('input[type=file]').val().replace(/C:\\fakepath\\/i, '')
        // var ext = re.exec("file.name.with.dots.txt")[1];
        console.log(file.type)
        additionalHeaders = {'params': {'x-amz-meta-customLabels': $('#custom-labels').val(), 'Content-Type': 'base64'}}
        
        return sdk.uploadPut({'filename': filename, 'Content-Type': 'base64', 'x-amz-meta-customLabels': $('#custom-labels').val()}, filedata, additionalHeaders);
      }

    function callSearchPicturedApi(query) {
      return sdk.searchGet({'q': query}, {'q': query}, {});
    }
})