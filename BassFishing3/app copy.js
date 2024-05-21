// ここからfirebase関係の準備
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getDatabase, ref, push, set, onChildAdded, remove, onChildRemoved, query, orderByChild, equalTo } 
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
    import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

    // Firebaseの設定
    const firebaseConfig = {
        apiKey: "AIzaSyBtvGqCRqzJPGi5R4d8lTW9aWU4zZuR1yQ",
        authDomain: "bassfishing-feeeb.firebaseapp.com",
        databaseURL: "https://bassfishing-feeeb-default-rtdb.firebaseio.com",
        projectId: "bassfishing-feeeb",
        storageBucket: "bassfishing-feeeb.appspot.com",
        messagingSenderId: "573539226789",
        appId: "1:573539226789:web:f6f78831df8d1b3e27294c"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const storage = getStorage(app);
    const dbRef = ref(db, "Bass"); // ここはあなたのデータベース参照に合わせてください

    // 画像ファイルのアップロード準備１
    $("#input-files").on("change", function(e) {
        const file = e.target.files[0];
        const storageRef = sRef(storage, 'BassImages/' + file.name); 

        uploadBytes(storageRef, file).then((snapshot) => {
            console.log('Uploaded a blob or file!');
        });
    });
    // 画像ファイルのアップロード準備２
    $("#Lure-files").on("change", function(e) {
        const file = e.target.files[0];
        const storageRef = sRef(storage, 'LureImages/' + file.name); 

        uploadBytes(storageRef, file).then((snapshot) => {
            console.log('Uploaded a blob or file!');
        });
    });

// 地図の表示
var map; // グローバル変数として map を宣言

function initializeMap(lati, longi) {
        map = new Microsoft.Maps.Map('#myMap', {
            zoom: 18,
            center: new Microsoft.Maps.Location(lati + 0.0008, longi),
            mapTypeId: Microsoft.Maps.MapTypeId.road,
            showZoomButtons: false,
            showMapTypeSelector: true
        });
    loadPins();
}

// まずは位置情報を取得する
navigator.geolocation.getCurrentPosition(function (position){
    const lati2 =  position.coords.latitude;
    const longi2 =  position.coords.longitude;
    // console.log("lati2:" + lati2);
    // console.log("longi2:" + longi2);
    initializeMap(lati2, longi2)
});

function loadPins() {
    onChildAdded(dbRef,function(data){
        const msg = data.val();//ここでデータ取得
        let html = `
                <tr class="z-0 bg-green-300 border-b-2 border-b-gray-300" id="row-${data.key}">
                    <td class="text-xs text-center border-r-2 border-amber-200">${msg.title}</td>
                    <td class="text-xs text-center border-r-2 border-amber-200">${msg.cm}</td>
                    <td class="text-xs text-center border-r-2 border-amber-200">${msg.gram}</td>
                    <td class="text-xs text-center border-r-2 border-amber-200">${msg.species}</td>
                    <td class="text-center border-r-2 border-amber-200 BassImageUrl"><img src="${msg.BassImageUrl}" alt="Uploaded image"></td>
                    <td class="text-center border-r-2 border-amber-200 LureImageUrl"><img src="${msg.LureImageUrl}" alt="Uploaded image"></td>
                    <td class="text-xs px-2 text-center border-r-2 border-amber-200">${msg.area}</td>
                    <td class="text-xs px-4 text-center border-r-2 border-amber-200">${msg.Wdescription}</td>
                    <td class="text-xs text-center border-r-2 border-amber-200">${msg.temp}</td>
                    <td class="text-xs px-4 text-center border-r-2 border-amber-200">${msg.Wspeed}</td>
                    <td class="text-xs px-4 text-center border-r-2 border-amber-200">${msg.humidity}</td>
                    <td class="text-xs px-4 text-center border-r-2 border-amber-200">${msg.comment}</td>
                </tr>
            `;
            $("#list").append(html);
            $("#output").scrollTop($("#output")[0].scrollHeight);
            addPinToMap(parseFloat(msg.latitude), parseFloat(msg.longitude), msg.cm, msg.gram, msg.species, msg.BassImageUrl, msg.LureImageUrl, msg.title,  data.key);
    });
}


// ここからは位置情報取得ボタン押した後の動作
function test() {
    navigator.geolocation.getCurrentPosition(test2, handleError);
}
window.test = test;

function test2(position) {
    const lati = position.coords.latitude;
    const longi = position.coords.longitude;
    $("#latitude").text(lati);
    $("#longitude").text(longi);
    // addPinToMap(lati, longi);
    getWeather(lati, longi);
}

function handleError(error) {
    console.error('Geolocation error:', error);
}



function getWeather(lati, longi) {
    //＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    //まずはMAP表示処理
    //＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    const key   = "9791306e542ff7bb5de08402ca917b9a";  //***openwetherの自分のKEYを！！！！！！！！！！！！！！！***
    // const lat   = $("#latitude").val(lati);   //取得した緯度を使用するため必要なし
    // const lon   = $("#longitude").val(longi);  //取得した経度を使用するため必要なし
    
    const icon  = "https://openweathermap.org/img/wn/"
    
    //OpenWeatherAPI（天気情報を取得）現在時刻の情報を取得
    const url = 'https://api.openweathermap.org/data/2.5/weather?lat='+lati+'&lon='+longi+'&appid='+key+'&lang=ja';
    
    $.ajax({
        url:url,
        type:'get',
        cache:false,
        dataType:'json'
    }).done(function(data){
        // console.log(data.list[0].dt_txt);//オブジェクト変数を確認
        console.log(data);//オブジェクト変数を確認、これをconsoleで開いてデータがどこにあるか確認していく。
    
        let html = `
                <div class="w-full flex"> 
                    <div class="w-1/2 block text-center">
                        <div class="h-1/3" id="area">エリア：${data.name}</div>
                        <div class="" id="Wdescription">天気：${data.weather[0].description}</div>
                        <div class="mx-auto w-1/6"><img id="icon" src="${icon+data.weather[0].icon}@2x.png"></div>
                    </div>
                    <div class="w-1/2 block text-center">
                        <div class="h-1/3" id="K">気温：${data.main.temp}K</div>
                        <div class="h-1/3" id="Wspeed">風速：${data.wind.speed}m/s</div>
                        <div class="h-1/3" id="humidity">湿気：${data.main.humidity}%</div>
                    </div>
                </div>
            `;    
        
        $("#view").fadeIn(1000).html(html);
        // $("#area").html(data.city.name);
        // GetMap(lati, longi);
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("AJAX call failed: " + textStatus + ", " + errorThrown);
    });
    
    console.log(lati);
    console.log(longi); 
    
}

// ピンとインフォボックスを追加する関数
function addPinToMap(lati, longi, cm, gram, species, bassImageUrl, lureImageUrl, title, dataId) {
    const description = `
        <div class="flex justify-around">
            <div class="text-lg italic">${cm} cm</div>
            <div class="text-lg italic">${gram} g</div>
        </div>
        <div class="text-center text-lg italic">${species}</div>
        <div class="">
            <div class="flex justify-center"><img src="${bassImageUrl}" alt="Bass Image" style="width:100px;height:auto;"></div>
            <div class="my-1 flex justify-center"><img src="${lureImageUrl}" alt="Lure Image" style="width:100px;height:auto;"></div>
        </div>
        <div class="flex justify-end">
            <button class="active:bg-yellow-400 " id="delete-button-${dataId}">データを削除</button>
        </div>
    `;
    let pinColor;
    if (gram > 1200) {
        pinColor = "red";
    } else if (gram > 600){
        pinColor = "blue";
    } else {
        pinColor = "green";
    }


    let pin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(parseFloat(lati), parseFloat(longi)), {
        title: title,
        color: pinColor
    });

    // インフォボックスを作成
    let infobox = new Microsoft.Maps.Infobox(pin.getLocation(), {
        title: title,
        description: description,
        maxHeight: 300,
        maxWidth: 350,
        visible: false, // 初期状態では非表示
        // showPointer: true,     //Pointer
        // showCloseButton: true, //CloseButton

    });

    // ピンにイベントハンドラを設定し、クリックでインフォボックスを表示
    Microsoft.Maps.Events.addHandler(pin, 'click', function () {
        infobox.setOptions({ visible: true });

        setTimeout(() => { // インフォボックスの描画が終わってからイベントを設定するためにsetTimeoutを使用
            const deleteButton = document.getElementById(`delete-button-${dataId}`);
            if (deleteButton) {
                deleteButton.onclick = function() {
                    deleteData(dataId);
                };
            }
        }, 100);

    });

    map.entities.push(pin);
    map.entities.push(infobox);
    
}

window.deleteData = function(dataId) {
    console.log("deleteData called with dataId:", dataId); // デバッグ用のログ
    deleteDataFromFirebase(dataId);
}


function deleteDataFromFirebase(id) {
    if (confirm("このデータを消しますか")){
        const dataRef = ref(db, `Bass/${id}`);
        remove(dataRef).then(() => {
            alert("データが削除されました");
            location.reload();
        }).catch((error) => {
            console.error("削除エラー:", error);
        });
    }
       

}

// saveBtnを押した時の機能
$("#save").on("click", async function(){
    let BassImageUrl = "";
    if (document.getElementById('input-files').files.length > 0) {
        const file = document.getElementById('input-files').files[0];
        const storageRef = sRef(storage, 'BassImages/' + file.name);
        try{
            const snapshot = await uploadBytes(storageRef, file);
            BassImageUrl = await getDownloadURL(snapshot.ref);
        } catch (error) {
            console.error('Error uploading file and getting download URL', error);
        }
    }
    let LureImageUrl = "";
    if (document.getElementById('Lure-files').files.length > 0) {
        const file = document.getElementById('Lure-files').files[0];
        const storageRef = sRef(storage, 'LureImages/' + file.name);
        try{
            const snapshot = await uploadBytes(storageRef, file);
            LureImageUrl = await getDownloadURL(snapshot.ref);
        } catch (error) {
            console.error('Error uploading file and getting download URL', error);
        }
    }
        const now = new Date();
        const years = now.getFullYear().toString().padStart(4, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const dates = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const title = `${years} ${month}${dates} ${hours}:${minutes}`;

        const msg = {
            title:title,
            cm: $("#cm").val(),
            gram: $("#gram").val(),
            species: $("#species").val(),
            BassImageUrl: BassImageUrl,
            LureImageUrl: LureImageUrl, 
            latitude: $("#latitude").text(), 
            longitude: $("#longitude").text(),
            area: $("#area").text(), 
            Wdescription: $("#Wdescription").text(), 
            temp: $("#K").text(), 
            Wspeed: $("#Wspeed").text(), 
            humidity: $("#humidity").text(), 
            comment: $("#comment").val(),
        };

    const newEntry = push(dbRef);
    set(newEntry, msg);
});   



$("#clear").on("click", function() {
    // ユーザーに確認を取る
    if (confirm("BassMEMOを消しますか？元に戻りませんよ？")) {
        const dbRef = ref(db, "Bass"); // Bassを参照

        // Bass データを全削除
        set(dbRef, null).then(() => {
            // HTML上のリストもクリア
            $("#list").empty();
            alert("データが全て削除されました。");
        }).catch(error => {
            console.error("Error deleting data: ", error);
        });
    }
});

// 任意のデータのみ消す
onChildAdded(dbRef, (snapshot) => {
        const key = snapshot.key;
        const data = snapshot.val();
        const option = `<option value="${key}">${data.title} ${data.gram}グラム</option>`;
        $("#dataSelect").append(option);
});

$("#delete").on("click", function() {
        const selectedKey = $("#dataSelect").val();
        if (confirm("削除しますか？")) {
            const itemRef = ref(db, `Bass/${selectedKey}`);
            remove(itemRef).then(() => {
                $("#dataSelect option[value='" + selectedKey + "']").remove();
                $(`#row-${selectedKey}`).remove(); // HTMLから行を削除
                location.reload(); 
            }).catch(error => {
                console.error("Error deleting data: ", error);
            });
        }
});

// areaでソート
const uniqueAreas = new Set();
onChildAdded(dbRef, (snapshot) => {
    // const key = snapshot.key;
    const data = snapshot.val();
    if (data.area && !uniqueAreas.has(data.area)) {
        uniqueAreas.add(data.area);
        const option = `<option value="${data.area}">${data.area}</option>`;
        $("#areaSelect").append(option);
    }
});

// フィルタボタンのクリックイベント
$("#filterarea").on("click", function() {
    const selectedArea = $("#areaSelect").val();
    if (selectedArea) {
    
    $("#addedResults").html(`
    <h1 class="md:ml-3 md:text-left text-center" id="filterarea2"></h1>
    <div id="output" style="overflow: auto; height: 300px;">
        <table>
            <thead class="sticky top-0 z-20 bg-gray-300">
                <tr class="text-xs">
                    <th class="px-2 text-center border-r-2 border-amber-200">date</th>
                    <th class="px-2 font-xs text-center border-r-2 border-amber-200">cm</th>
                    <th class="px-4 text-center border-r-2 border-amber-200">g</th>
                    <th class="px-4 text-center border-r-2 border-amber-200">種別</th>
                    <th class="px-10 w-1/4 text-center border-r-2 border-amber-200">釣果</th>
                    <th class="px-10 w-1/4 text-center border-r-2 border-amber-200">ヒットルアー</th>
                    <th class="px-5 text-center border-r-2 border-amber-200">area</th>
                    <th class="px-8 text-center border-r-2 border-amber-200">天候</th>
                    <th class="text-center border-r-2 border-amber-200">気温</th>
                    <th class="px-4 text-center border-r-2 border-amber-200">風速</th>
                    <th class="px-4 text-center border-r-2 border-amber-200">湿気</th>
                    <th class="px-10 text-center border-r-2 border-amber-200">コメント</th>

                </tr>
            </thead>
            <tbody id="filtered-list"></tbody>
        </table>
    </div>
    `);
    filterByArea(selectedArea);
}
    
});

function filterByArea(area) {
    $("#filtered-list").empty();
onChildAdded(dbRef, (snapshot) => {
    const data = snapshot.val();
    $("#filterarea2").text('<' + 'areaでソート！>');
    if (data.area === area) {
        const html = `
            <tr class="text-xs z-0 bg-green-300 border-b-2 border-b-gray-300">
                <td class="text-xs text-center border-r-2 border-amber-200">${data.title}</td>
                <td class="text-xs text-center border-r-2 border-amber-200">${data.cm}</td>
                <td class="text-xs text-center border-r-2 border-amber-200">${data.gram}</td>
                <td class="text-xs text-center border-r-2 border-amber-200">${data.species}</td>
                <td class="text-center border-r-2 border-amber-200"><img src="${data.BassImageUrl}" alt="Uploaded image"></td>
                <td class="text-center border-r-2 border-amber-200"><img src="${data.LureImageUrl}" alt="Uploaded image"></td>
                <td class="text-xs px-2 text-center border-r-2 border-amber-200">${data.area}</td>
                <td class="text-xs px-4 text-center border-r-2 border-amber-200">${data.Wdescription}</td>
                <td class="text-xs text-center border-r-2 border-amber-200">${data.temp}</td>
                <td class="text-xs px-4 text-center border-r-2 border-amber-200">${data.Wspeed}</td>
                <td class="text-xs px-4 text-center border-r-2 border-amber-200">${data.humidity}</td>
                <td class="text-xs px-4 text-center border-r-2 border-amber-200">${data.comment}</td>
            </tr>
        `;
        $("#filtered-list").append(html);
    }
});
}


