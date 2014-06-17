function FacebookLogin() {
    FB.login(function (e) {
        if (e.authResponse) {
            window.authToken = e.authResponse.accessToken;
            window.location.reload()
        }
    }, {
        scope: "user_likes,user_photos,publish_actions"
    })
}

function refreshPages() {
    window.location.reload()
}

function getAlbum() {
    $("#albumGET").remove();
    FB.api("/me/albums", function (e) {
        for (var t = 0; t < e.data.length; t++) {
            var n = e.data[t].id;
            var r = e.data[t].name;
            var i = '<option id="albumID" value=' + n + ">" + r + "</option>";
            $("#album").append(i);
            $("#album").prop("selectedIndex", -1)
        }
    })
}

function draw(e, t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height, imageX, imageY, imageWidth, imageHeight);
    ctx.drawImage(img3, 200, 400);
    $("#inputed").change(function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, img.width, img.height, imageX, imageY, imageWidth, imageHeight);
        ctx.drawImage(img3, 200, 400);
        var e = $("#inputed").val();
        ctx.fillStyle = "black";
        ctx.font = '20px "微軟正黑體"';
        ctx.fillText(e, 275, 445);
        ctx.drawImage(img2, 0, 0)
    });
    var n = $("#inputed").val();
    ctx.fillStyle = "black";
    ctx.font = '20px "微軟正黑體"';
    ctx.fillText(n, 275, 445);
    ctx.drawImage(img2, 0, 0);
    if (e) {
        drawDragAnchor(imageX, imageY);
        drawDragAnchor(imageRight, imageY);
        drawDragAnchor(imageRight, imageBottom);
        drawDragAnchor(imageX, imageBottom)
    }
    if (t) {
        ctx.beginPath();
        ctx.moveTo(imageX, imageY);
        ctx.lineTo(imageRight, imageY);
        ctx.lineTo(imageRight, imageBottom);
        ctx.lineTo(imageX, imageBottom);
        ctx.closePath();
        ctx.stroke()
    }
}

function drawDragAnchor(e, t) {
    ctx.fillStyle = "#F0F0F0";
    ctx.beginPath();
    ctx.arc(e, t, resizerRadius, 0, pi2, false);
    ctx.closePath();
    ctx.fill()
}

function anchorHitTest(e, t) {
    var n, r;
    n = e - imageX;
    r = t - imageY;
    if (n * n + r * r <= rr) {
        return 0
    }
    n = e - imageRight;
    r = t - imageY;
    if (n * n + r * r <= rr) {
        return 1
    }
    n = e - imageRight;
    r = t - imageBottom;
    if (n * n + r * r <= rr) {
        return 2
    }
    n = e - imageX;
    r = t - imageBottom;
    if (n * n + r * r <= rr) {
        return 3
    }
    return -1
}

function hitImage(e, t) {
    return e > imageX && e < imageX + imageWidth && t > imageY && t < imageY + imageHeight
}

function handleMouseDown(e) {
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);
    draggingResizer = anchorHitTest(startX, startY);
    draggingImage = draggingResizer < 0 && hitImage(startX, startY)
}

function handleMouseUp(e) {
    draggingResizer = -1;
    draggingImage = false;
    draw(true, false)
}

function handleMouseOut(e) {
    handleMouseUp(e)
}

function handleMouseMove(e) {
    if (draggingResizer > -1) {
        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);
        switch (draggingResizer) {
        case 0:
            imageX = mouseX;
            imageWidth = imageRight - mouseX;
            imageY = mouseY;
            imageHeight = imageBottom - mouseY;
            break;
        case 1:
            imageY = mouseY;
            imageWidth = mouseX - imageX;
            imageHeight = imageBottom - mouseY;
            break;
        case 2:
            imageWidth = mouseX - imageX;
            imageHeight = mouseY - imageY;
            break;
        case 3:
            imageX = mouseX;
            imageWidth = imageRight - mouseX;
            imageHeight = mouseY - imageY;
            break
        }
        if (imageWidth < 25) {
            imageWidth = 25
        }
        if (imageHeight < 25) {
            imageHeight = 25
        }
        imageRight = imageX + imageWidth;
        imageBottom = imageY + imageHeight;
        draw(true, true)
    } else if (draggingImage) {
        imageClick = false;
        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);
        var t = mouseX - startX;
        var n = mouseY - startY;
        imageX += t;
        imageY += n;
        imageRight += t;
        imageBottom += n;
        startX = mouseX;
        startY = mouseY;
        draw(false, true)
    }
}

function handleFiles(e) {
    var t = document.getElementById("canvas").getContext("2d");
    var n = URL.createObjectURL(e.target.files[0]);
    var r = new Image;
    r.onload = function () {
        t.drawImage(r, 270 / 2, 270 / 2)
    };
    r.src = n;
    $("#canvas").css("pointer-events", "none")
}

function PostImageToFacebook(e) {
    $(".info").append('<img src="img/loading.gif"/>');
    var t = document.getElementById("canvas");
    var n = t.toDataURL("image/png");
    try {
        blob = dataURItoBlob(n)
    } catch (r) {
        console.log(r)
    }
    var i = new FormData;
    i.append("access_token", e);
    i.append("source", blob);
    i.append("message", "這是HTML5 canvas和Facebook API結合教學");
    $("#sentimg").remove();
    try {
        $.ajax({
            url: "https://graph.facebook.com/me/photos?access_token=" + e,
            type: "POST",
            data: i,
            processData: false,
            contentType: false,
            cache: false,
            success: function (e) {
                console.log("success " + e);
                $(".info img").remove();
                $(".info").html("Posted Canvas Successfully. [<a href='http://www.facebook.com/photo.php?fbid=" + e.id + "&type=1&makeprofile=1&makeuserprofile=1'>Set to Profile Picture</a>]  or [<a href='http://www.facebook.com/profile.php?preview_cover=" + e.id + " /'>Cover Photo</a>]")
            },
            error: function (e, t, n) {
                $(".info").html("error " + n + " Status " + e.status)
            },
            complete: function () {
                alert("Posted to facebook")
            }
        })
    } catch (r) {
        console.log(r)
    }
}

function dataURItoBlob(e) {
    var t = atob(e.split(",")[1]);
    var n = new ArrayBuffer(t.length);
    var r = new Uint8Array(n);
    for (var i = 0; i < t.length; i++) {
        r[i] = t.charCodeAt(i)
    }
    return new Blob([n], {
        type: "image/png"
    })
}
window.fbAsyncInit = function () {
    FB.init({
        appId: "731179130279928",
        status: true,
        cookie: true,
        xfbml: true,
        version: "v1.0"
    });
    FB.getLoginStatus(function (e) {
        if (e.status === "connected") {
            window.authToken = e.authResponse.accessToken
        } else if (e.status === "not_authorized") {
            $("#main").html("<h1>Please authorized this apps</h1><h4> p/s: please allow browser popup for this website and refresh to use this apps</h4>");
            $("#facebookname,#sentimg,label").remove();
            FacebookLogin();
            $(".info").append('<input type="button" value="Reload" onClick="refreshPages()>"')
        } else {
            $("#main").html("<h1>Please login to use this apps</h1><h4> p/s: please allow browser popup for this website and refresh to use this apps</h4>");
            $("#facebookname,#sentimg,label").remove();
            FacebookLogin()
        }
    });
    $("#pattern").prop("selectedIndex", -1)
};
(function (e, t, n) {
    var r, i = e.getElementsByTagName(t)[0];
    if (e.getElementById(n)) {
        return
    }
    r = e.createElement(t);
    r.id = n;
    r.src = "//connect.facebook.net/en_US/all.js";
    i.parentNode.insertBefore(r, i)
})(document, "script", "facebook-jssdk");



$("#album").change(function () {
    $("#photoContainer").html("");
    $("#photo").html("");
    console.log("test");
    var e = this.options[this.selectedIndex].value;
    var t = e + "/photos";
    FB.api(t, function (e) {
        for (var t = 0; t < e.data.length; t++) {
            var n = e.data[t].id;
            var r = e.data[t].name;
            var i = '<option id="photoID" value=' + n + ">" + r + "</option>";
            $("#photo").append(i);
            $("#photo").prop("selectedIndex", -1)
        }
    })
});
$("#photo").change(function () {
    $("#photoContainer").html("");
    var e = this.options[this.selectedIndex].value;
    FB.api(e, function (e) {
        var t = e.images[0].source;
        var n = e.name;
        var r = e.likes;
        if (r != null) {
            var i = e.likes.data.length
        } else {
            i = "0"
        }
        var s = "<strong>Get " + i + ' like </strong><br><figure><img style="display:hidden; width:0; height:0;" crossorigin="anonymous" id="albumPhoto" src="' + t + '" alt="' + n + '" ><figcaption>' + n + "</figcaption></figure>";
        $("#photoContainer").html(s)
    })
});
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var canvasOffset = $("#canvas").offset();
var offsetX = canvasOffset.left;
var offsetY = canvasOffset.top;
var startX;
var startY;
var isDown = false;
var pi2 = Math.PI * 2;
var resizerRadius = 8;
var rr = resizerRadius * resizerRadius;
var draggingResizer = {
    x: 0,
    y: 0
};
var imageX = 50;
var imageY = 50;
var imageWidth, imageHeight, imageRight, imageBottom;
var draggingImage = false;
var startX;
var startY;
var img = new Image;
img.crossOrigin = "Anonymous";
img.onload = function () {
    imageWidth = img.width;
    imageHeight = img.height;
    imageRight = imageX + imageWidth;
    imageBottom = imageY + imageHeight;
    draw(true, false)
};
$("#photo").change(function () {
    setTimeout(function () {
        img.src = $("#albumPhoto").attr("src")
    }, 1e3)
});
var img2 = new Image;
$("#pattern").change(function () {
    var e = this.options[this.selectedIndex].value;
    img2.src = e;
    draw()
});
var img3 = new Image;
img3.src = "img/typography.png";
$("#canvas").mousedown(function (e) {
    handleMouseDown(e)
});
$("#canvas").mousemove(function (e) {
    handleMouseMove(e)
});
$("#canvas").mouseup(function (e) {
    handleMouseUp(e)
});
$("#canvas").mouseout(function (e) {
    handleMouseOut(e)
});
window.onload = function () {
    var e = document.getElementById("input");
    e.addEventListener("change", handleFiles, false)
}		
		
		
		
		
		
		
		
		
		
		
		
		
		

/*
window.fbAsyncInit = function(){
	FB.init({
		appId	:'731179130279928',
		xfbml	: true,
		version	:'v2.0'
		});



function FacebookLogin() {
    FB.login(function (e) {
        if (e.authResponse) {
            window.authToken = e.authResponse.accessToken;
            window.location.reload()
        }
    }, {
        scope: "user_likes,user_photos,publish_actions"
    })
}

function refreshPages() {
    window.location.reload()
}

function getAlbum() {
    $("#albumGET").remove();
    FB.api("/me/albums", function (e) {
        for (var t = 0; t < e.data.length; t++) {
            var n = e.data[t].id;
            var r = e.data[t].name;
            var i = '<option id="albumID" value=' + n + ">" + r + "</option>";
            $("#album").append(i);
            $("#album").prop("selectedIndex", -1)
        }
    })
}



//LOAD FACEBOOK SDK ASYNC，這是基本的東西，應該不用多說了吧
(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js"; 
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
	
	
FB.getLoginStatus(function(e) {
  if (e.status === 'connected') {
    //呼叫api把圖片放到#preview IMG tag 內
    window.authToken = e.authResponse.accessToken
  } else if (e.status === 'not_authorized') {
    //要求使用者登入，索取publish_actions權限
	 $("#main").html("<h1>Please authorized this apps</h1><h4> p/s: please allow browser popup for this website and refresh to use this apps</h4>");
     $("#facebookname,#sentimg,label").remove();
	FacebookLogin();
     $(".info").append('<input type="button" value="Reload" onClick="refreshPages()>"')
  } else {
    //同樣要求使用者登入
	$("#main").html("<h1>Please login to use this apps</h1><h4> p/s: please allow browser popup for this website and refresh to use this apps</h4>");
    $("#facebookname,#sentimg,label").remove();
    FacebookLogin()
  }
 });
 
 $("#pattern").prop("selectedIndex", -1)

};


(function (e, t, n) {
    var r, i = e.getElementsByTagName(t)[0];
    if (e.getElementById(n)) {
        return
    }
    r = e.createElement(t);
    r.id = n;
    r.src = "//connect.facebook.net/en_US/all.js";
    i.parentNode.insertBefore(r, i)
})(document, "script", "facebook-jssdk");
$("#album").change(function () {
    $("#photoContainer").html("");
    $("#photo").html("");
    console.log("test");
    var e = this.options[this.selectedIndex].value;
    var t = e + "/photos";
    FB.api(t, function (e) {
        for (var t = 0; t < e.data.length; t++) {
            var n = e.data[t].id;
            var r = e.data[t].name;
            var i = '<option id="photoID" value=' + n + ">" + r + "</option>";
            $("#photo").append(i);
            $("#photo").prop("selectedIndex", -1)
        }
    })
});
$("#photo").change(function () {
    $("#photoContainer").html("");
    var e = this.options[this.selectedIndex].value;
    FB.api(e, function (e) {
        var t = e.images[0].source;
        var n = e.name;
        var r = e.likes;
        if (r != null) {
            var i = e.likes.data.length
        } else {
            i = "0"
        }
        var s = "<strong>Get " + i + ' like </strong><br><figure><img style="display:hidden; width:0; height:0;" crossorigin="anonymous" id="albumPhoto" src="' + t + '" alt="' + n + '" ><figcaption>' + n + "</figcaption></figure>";
        $("#photoContainer").html(s)
    })
});




//以下為canvas的程式碼，基本上不需多動，依據comments修改即可
	
	//起始畫面
	var ctx = document.getElementById('canvas').getContext('2d'); //宣告變數找到頁面的canvas標籤的2d內容
	ctx.font='20px "Arial"'; //設定字體與大小
	ctx.fillText("Click here to start fill with Facebook Profile Picture", 40, 270); //設定預設的開始畫面
    var img = new Image(); // 新增圖像1
    img.src = "img/overlay.png"; //圖像路徑（路徑自己設，且自己加入想要的圖層）
	var img2 = new Image(); //新增圖像2
	img2.src = "img/overlayback.png" //圖像路徑
	var img3 = new Image();//新增圖像3
	img3.src = "img/typography.png"//圖像路徑
	
	

	//宣告基本變數
    var canvas=document.getElementById("canvas"); //宣告變數找到canvas標籤
    var ctx=canvas.getContext("2d"); //找到2d內容
    var canvasOffset=$("#canvas").offset();//找到offset
    var offsetX=canvasOffset.left;//左方
    var offsetY=canvasOffset.top;//上方
    var canvasWidth=canvas.width;//大小
    var canvasHeight=canvas.height;//高度
    var isDragging=false;//拖拉

    function handleMouseDown(e){//滑鼠按下的函數
      canMouseX=parseInt(e.clientX-offsetX);//抓滑鼠游標X
      canMouseY=parseInt(e.clientY-offsetY);//抓滑鼠游標y
      // set the drag flag
      isDragging=true;//宣告拖拉變數
    }

    function handleMouseUp(e){//滑鼠放掉的函數
      canMouseX=parseInt(e.clientX-offsetX);
      canMouseY=parseInt(e.clientY-offsetY);
      // clear the drag flag
      isDragging=false;
    }

    function handleMouseOut(e){//滑鼠移開的函數
      canMouseX=parseInt(e.clientX-offsetX);
      canMouseY=parseInt(e.clientY-offsetY);
      // user has left the canvas, so clear the drag flag
      //isDragging=false;
    }

    function handleMouseMove(e){//滑鼠移動的event
      canMouseX=parseInt(e.clientX-offsetX);
      canMouseY=parseInt(e.clientY-offsetY);
      // if the drag flag is set, clear the canvas and draw the image
      if(isDragging){ //當拖拉為True時
          	ctx.clearRect(0,0,canvasWidth,canvasHeight); //移除canvas起始的內容
			var profileIMG = document.getElementById("preview1");//抓html裡預載入的照片
			profileIMG.crossOrigin = "Anonymous"; // 這務必要做，為了讓Facebook的照片能夠crossdomain傳入到你的頁面，CORS Policy請參考https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image 
			//canvas.width = profileIMG.width;//設定canvas的大小需符合profileimg的大小
			//canvas.height = profileIMG.height;
			ctx.drawImage(profileIMG,0,0);//從XY軸0，0值開始畫如profileimg
			ctx.drawImage(img3,canMouseX-128/2,canMouseY-120/2); //劃入img3，並根據你的滑鼠游標移動，你可以自行更換想要移動的圖層，數值會因XY軸向有所不同
			ctx.drawImage(img2,0,0); //劃入img2
			var inputedText = $('#inputed').val();//抓取頁面inputed ID的內容
			ctx.fillStyle = "black"; //字體顏色
			ctx.font='20px "微軟正黑體"'; //字體大小和字形
			ctx.fillText(inputedText, canMouseX-1/2,canMouseY-30/2); //字體也可以依據滑鼠游標移動，所輸入的值可自行調整，若不想移動輸入的字體，可以把它改成（inputedText,0,0)X Y軸 0，0的位置
      }
    }

	//抓取滑鼠移動的event
    $("#canvas").mousedown(function(e){handleMouseDown(e);});
    $("#canvas").mousemove(function(e){handleMouseMove(e);});
    $("#canvas").mouseup(function(e){handleMouseUp(e);});
    $("#canvas").mouseout(function(e){handleMouseOut(e);});


//可以思考這程式要放在init內還是init外?




 //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<init end

function handleFiles(e) {
    var t = document.getElementById("canvas").getContext("2d");
    var n = URL.createObjectURL(e.target.files[0]);
    var r = new Image;
    r.onload = function () {
        t.drawImage(r, 270 / 2, 270 / 2)
    };
    r.src = n;
    $("#canvas").css("pointer-events", "none")
}



// Post a BASE64 Encoded PNG Image to facebook，以下程式為把照片po到facebook的方法，基本上這樣就可以不用動了，但思考authToken該怎麼拿到，因為這裡我並沒有把使用者登入的token載入到這函數內，所以它是不會得到token的
function PostImageToFacebook(authToken) {
	$('.info').append('<img src="img/loading.gif"/>')//載入loading的img
    var canvas = document.getElementById("canvas");//找canvas
    var imageData = canvas.toDataURL("image/png");//把canvas轉換PNG
    try {
        blob = dataURItoBlob(imageData);//把影像載入轉換函數
    } catch (e) {
        console.log(e);//錯誤訊息的log
    }
    var fd = new FormData();
    fd.append("access_token", authToken);//請思考accesstoken要怎麼傳到這function內
    fd.append("source", blob);//輸入的照片
    fd.append("message", "這是HTML5 canvas和Facebook API結合教學");//輸入的訊息
    try {
        $.ajax({
            url: "https://graph.facebook.com/me/photos?access_token=" + authToken,//GraphAPI Call
            type: "POST",
            data: fd,
            processData: false,
            contentType: false,
            cache: false,
            success: function (data) {
                console.log("success " + data);//成功log + photoID
                  $(".info").html("Posted Canvas Successfully. [<a href='http://www.facebook.com/" + data.id + " '>Go to Profile Picture</a>] "); //成功訊息並顯示連接
            },
            error: function (shr, status, data) {
                $(".info").html("error " + data + " Status " + shr.status);//如果錯誤把訊息傳到class info內
            },
            complete: function () {
                $(".info").append("Posted to facebook");//完成後把訊息傳到HTML的div內
            }
        });

    } catch (e) {
        console.log(e);//錯誤訊息的log
    }
}




// Convert a data URI to blob把影像載入轉換函數
function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {
        type: 'image/png'
    });
}
*/




