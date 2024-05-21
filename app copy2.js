
// ここからfirebase関係の準備

    // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getDatabase, ref, push, set, onChildAdded, remove, onChildRemoved, query, orderByChild, equalTo } 
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
    import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBtvGqCRqzJPGi5R4d8lTW9aWU4zZuR1yQ",
        authDomain: "bassfishing-feeeb.firebaseapp.com",
        databaseURL: "https://bassfishing-feeeb-default-rtdb.firebaseio.com",
        projectId: "bassfishing-feeeb",
        storageBucket: "bassfishing-feeeb.appspot.com",
        messagingSenderId: "573539226789",
        appId: "1:573539226789:web:f6f78831df8d1b3e27294c"
      };
    
    // 画像ファイルのアップロード準備１
    $("#input-files").on("change", function(e) {
        const file = e.target.files[0];
        const storageRef = sRef(storage, 'BassImages/' + file.name); // 'BassImages/'は任意のパス

        uploadBytes(storageRef, file).then((snapshot) => {
            console.log('Uploaded a blob or file!');
        });
    });
    // 画像ファイルのアップロード準備２
    $("#Lure-files").on("change", function(e) {
        const file = e.target.files[0];
        const storageRef = sRef(storage, 'LureImages/' + file.name); // 'BassImages/'は任意のパス

        uploadBytes(storageRef, file).then((snapshot) => {
            console.log('Uploaded a blob or file!');
        });
    });

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const storage = getStorage(app);
    const dbRef = ref(db, "Bass"); // ここはあなたのデータベース参照に合わせてください

// ページを開く、もしくは更新した際に自動でマップを表示

// まずは位置情報を取得する
navigator.geolocation.getCurrentPosition(function (position){
    const lati2 =  position.coords.latitude;
    const longi2 =  position.coords.longitude;
    // console.log("lati2:" + lati2);
    // console.log("longi2:" + longi2);
    GetMap(lati2, longi2)
});

// 地図の表示
var map; // グローバル変数として map を宣言

function GetMap(lati2, longi2) {
    if (!map) {
        map = new Microsoft.Maps.Map('#myMap', {
            zoom: 18,
            center: new Microsoft.Maps.Location(lati2 + 0.0008, longi2),
            mapTypeId: Microsoft.Maps.MapTypeId.road,
            showZoomButtons: false,
            showMapTypeSelector: false
        });
    } else {
        // マップの中心を更新
        map.setView({ center: new Microsoft.Maps.Location(lati2, longi2) });
    }
    reverseGeocode(); // 必要に応じて実装
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

onChildAdded(dbRef,function(data){
    const msg = data.val();//ここでデータ取得
    // const key = data.key; 
    let html = `
            <tr class="z-0 bg-green-300 border-b-2 border-b-gray-300" id="row-${data.key}">
                <td class="text-xs border-r-2 border-amber-200 key">${data.key}</td>
                <td class="border-r-2 border-amber-200">${msg.title}</td>
                <td class="text-center border-r-2 border-amber-200">${msg.cm}</td>
                <td class="text-xs text-center border-r-2 border-amber-200">${msg.gram}</td>
                <td class="text-xs text-center border-r-2 border-amber-200">${msg.species}</td>
                <td class="text-center border-r-2 border-amber-200 BassImageUrl"><img src="${msg.BassImageUrl}" alt="Uploaded image"></td>
                <td class="text-center border-r-2 border-amber-200 LureImageUrl"><img src="${msg.LureImageUrl}" alt="Uploaded image"></td>
                <td class="text-xs text-center border-r-2 border-amber-200">${msg.latitude}, ${msg.longitude}</td>
                <td class="text-xs text-center border-r-2 border-amber-200">${msg.area}</td>
                <td class="text-xs text-center border-r-2 border-amber-200">${msg.Wdescription}</td>
                <td class="text-xs text-center border-r-2 border-amber-200">${msg.temp}</td>
                <td class="text-xs text-center border-r-2 border-amber-200">${msg.Wspeed}</td>
                <td class="text-xs text-center border-r-2 border-amber-200">${msg.humidity}</td>
                <td class="text-xs text-center border-r-2 border-amber-200">${msg.comment}</td>
            </tr>
        `;
        $("#list").append(html);
        $("#output").scrollTop($("#output")[0].scrollHeight);
        addPinToMap(msg.latitude, msg.longitude, msg.cm, msg.gram, msg.species, msg.BassImageUrl, msg.LureImageUrl, msg.title);
});


        function addPinToMap(lati, longi, cm, gram, species, BassImageUrl, LureImageUrl, title) {
            // まずは日付時間の取得

            
            const description = `
            <div class="flex justify-around">
                <div>${cm} cm</div>
                <div>${gram} g</div>
                <div>${species}</div>
            </div>
                <div><img src="${BassImageUrl}"></div>
                <div><img src="${LureImageUrl}"></div>
           
            `;
        
            let pin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(lati, longi), {
                title: title,
                color: 'red' 
                
            });
            // インフォボックスを作成
            let infobox = new Microsoft.Maps.Infobox(pin.getLocation(), {
                title: title,
                description: description, 
                maxHeight: 256,
                // ここに追加の説明を入れることができる
                // actions: [{
                //     label: 'Handler1',
                //     eventHandler: function () {
                //         alert('Handler1');
                //     }
                    
                // }],
                visible: false // 初期状態では非表示
            
        
                
            });
        
            // ピンにイベントハンドラを設定し、クリック(マウスオーバー(mouseover)だとスマホで動作しない)でインフォボックスを表示
            Microsoft.Maps.Events.addHandler(pin, 'click', function () {
                infobox.setOptions({ visible: true });
            });
        
            map.entities.push(pin);
            map.entities.push(infobox);
        }















// onChildAdded(dbRef,function(data){
//     const msg = data.val();//ここでデータ取得
    // さらにピン留め

    
//     title:title,
//     cm: $("#cm").val(),
//     gram: $("#gram").val(),
//     species: $("#species").text(),
//     BassImageUrl: BassImageUrl,
//     LureImageUrl: LureImageUrl, 
//     latitude: $("#latitude").text(), 
//     longitude: $("#longitude").text(),
//     area: $("#area").text(), 
//     Wdescription: $("#Wdescription").text(), 
//     temp: $("#K").text(), 
//     Wspeed: $("#Wspeed").text(), 
//     humidity: $("#humidity").text(), 
//     comment: $("#comment").val(),




//     let html = `
//             <tr class="z-0 bg-green-300 border-b-2 border-b-gray-300" id="row-${data.key}">
//                 <td class="text-xs border-r-2 border-amber-200 key">${data.key}</td>
//                 <td class="border-r-2 border-amber-200">${msg.title}</td>
//                 <td class="text-center border-r-2 border-amber-200">${msg.cm}</td>
//                 <td class="text-xs text-center border-r-2 border-amber-200">${msg.gram}</td>
//                 <td class="text-xs text-center border-r-2 border-amber-200">${msg.species}</td>
//                 <td class="text-center border-r-2 border-amber-200 BassImageUrl"><img src="${msg.BassImageUrl}" alt="Uploaded image"></td>
//                 <td class="text-center border-r-2 border-amber-200 LureImageUrl"><img src="${msg.LuerImageUrl}" alt="Uploaded image"></td>
//                 <td class="text-xs text-center border-r-2 border-amber-200">${msg.latitude}, ${msg.longitude}</td>
//                 <td class="text-xs text-center border-r-2 border-amber-200">${msg.area}</td>
//                 <td class="text-xs text-center border-r-2 border-amber-200">${msg.Wdescription}</td>
//                 <td class="text-xs text-center border-r-2 border-amber-200">${msg.temp}</td>
//                 <td class="text-xs text-center border-r-2 border-amber-200">${msg.Wspeed}</td>
//                 <td class="text-xs text-center border-r-2 border-amber-200">${msg.humidity}</td>
//                 <td class="text-xs text-center border-r-2 border-amber-200">${msg.comment}</td>
//             </tr>
//         `;
//         $("#list").append(html);
//         $("#output").scrollTop($("#output")[0].scrollHeight);
// });
// }

// function handleError(error) {
//     console.error('Geolocation error:', error);
//     alert('位置情報の取得に失敗しました。'); // エラーをユーザーに知らせる
// }







// function GetMap(lati2, longi2) {
//     map = new Microsoft.Maps.Map('#myMap', {
//         zoom: 18,
//         center: new Microsoft.Maps.Location(lati2, longi2),
//         mapTypeId: Microsoft.Maps.MapTypeId.road,
//         showZoomButtons: false, //ズームボタンの有無
//         showMapTypeSelector: false, //地図の種類の変更可否
//         // disablePanning//地図のドラッグ可否
//         // disableZooming//ズームの可否
//         // showScalebar: false//スケールバーの表示
//         // showDashboard//ナビゲーションコントロールの有無
//     });
//     // $('#mapMain').fadeIn(1000);
//     //Make a request to reverse geocode the center of the map.
//     reverseGeocode();
// }



// // 位置情報取得
// function test() {
//     navigator.geolocation.getCurrentPosition(test2, handleError);
// }
// window.test = test;

// function handleError(error) {
//     console.error('Geolocation error:', error);
//     // エラーハンドリングの詳細なロジック
// }
// function test2(position) {
//     const lati =  position.coords.latitude;
//     const longi =  position.coords.longitude;


//     $("#latitude").text(lati);
//     $("#longitude").text(longi);

//     addPinToMap(lati, longi);

//     getWeather(lati, longi);
// }

// function addPinToMap(lati, longi) {
//     // マップが存在するか確認し、存在しない場合は新しく作成
//     if (!map) {
//         GetMap(lati, longi);
//     }

//     // 現在位置にピンを作成
//     let pin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(lati, longi), {
//         title: '現在地',
//         subTitle: 'あなたはここにいます',
//         color: 'red'
//     });

//     // ピンをマップに追加
//     map.entities.push(pin);
// }



    // let map,searchManager;
    // function GetMap(lati, longi) {
    //     map = new Microsoft.Maps.Map('#myMap', {
    //         zoom: 18,
    //         center: new Microsoft.Maps.Location(lati, longi),
    //         mapTypeId: Microsoft.Maps.MapTypeId.road,
    //         showZoomButtons: false, //ズームボタンの有無
    //         showMapTypeSelector: false, //地図の種類の変更可否
    //         // disablePanning//地図のドラッグ可否
    //         // disableZooming//ズームの可否
    //         showScalebar: false//スケールバーの表示
    //         // showDashboard//ナビゲーションコントロールの有無
    //     });
    //     $('#mapMain').fadeIn(1000);
    //     //Make a request to reverse geocode the center of the map.
    //     reverseGeocode();
    // }
    // function reverseGeocode() {
    //     //If search manager is not defined, load the search module.
    //     if (!searchManager) {
    //         //Create an instance of the search manager and call the reverseGeocode function again.
    //         Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
    //             searchManager = new Microsoft.Maps.Search.SearchManager(map);
    //             reverseGeocode();
    //         });
    //     } else {
    //         let searchRequest = {
    //             location: map.getCenter(),
    //             callback: function (r) {
    //                 //Tell the user the name of the result.
    //                 // alert(r.name);
    //                 $("#myMap2").fadeIn(1000).text(r.name);
    //                 var pin = new Microsoft.Maps.Pushpin(map.getCenter(), {
    //                     // title: r.name
    //                 });
    //                 map.entities.push(pin);
    //             },
    //             errorCallback: function (e) {
    //                 //If there is an error, alert the user about it.
    //                 alert("Unable to reverse geocode location.");
    //             }
    //         };
    //         //Make the reverse geocode request.
    //         searchManager.reverseGeocode(searchRequest);
    //     }
    // }
    //Search Button
    // document.getElementById("get").onclick = function(){
    //     Search();
    // };



    



$("#clear").on("click", function() {
    // ユーザーに確認を取る
    if (confirm("バタフライメモリーを消しますか？元に戻りませんよ？")) {
        const dbRef = ref(db, "Bass"); // Bassを参照

        // Bass データを全削除
        set(dbRef, null).then(() => {
            // HTML上のリストもクリア
            $("#list").empty();
            alert("データが全て削除されました。");
        // }).catch(error => {
        //     console.error("Error deleting data: ", error);
        });
    }else{
        // cancelなので記載しない
    }
});

// 任意のデータのみ消す
onChildAdded(dbRef, (snapshot) => {
        const key = snapshot.key;
        const data = snapshot.val();
        const option = `<option value="${key}">${data.name} (${key})</option>`;
        $("#dataSelect").append(option);
});

$("#delete").on("click", function() {
        const selectedKey = $("#dataSelect").val();
        if (confirm("削除しますか？")) {
            const itemRef = ref(db, `Bass/${selectedKey}`);
            remove(itemRef).then(() => {
                $("#dataSelect option[value='" + selectedKey + "']").remove();
                $(`#row-${selectedKey}`).remove(); // HTMLから行を削除
            }).catch(error => {
                console.error("Error deleting data: ", error);
            });
        }else{

        }
});

// 日付でソート
$("#filterDate").on("click", function() {
    const chosenDate = $("#dateChoice").val(); // 選択した日付を取得
    const formattedDate = new Date(chosenDate).toDateString(); // 日付を整形
    console.log(chosenDate);
    // 新しいテーブルのセットアップ
    $("#addedResults").html(`
    <h1 class="md:ml-3 md:text-left text-center" id="filterDate2"></h1>
    <div id="output" style="overflow: auto; height: 300px;">
        <table>
            <thead class="sticky top-0 z-20 bg-gray-300">
                <tr class="text-xs">
                    <th class="border-r-2 border-amber-200">Key</th>
                    <th class="px-4 border-r-2 border-amber-200">Name</th>
                    <th class="border-r-2 border-amber-200">Sex</th>
                    <th class="border-r-2 border-amber-200">Area</th>
                    <th class="border-r-2 border-amber-200">Coordinates</th>
                    <th class="border-r-2 border-amber-200">Weather Description</th>
                    <!-- <th class="">Icon</th> -->
                    <th class="border-r-2 border-amber-200">Temperature</th>
                    <th class="border-r-2 border-amber-200">Wind Speed</th>
                    <th class="border-r-2 border-amber-200">Humidity</th>
                    <th class="border-r-2 border-amber-200 px-10">Image</th>
                    <th class="border-r-2 border-amber-200">Comment</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody id="filtered-list"></tbody>
        </table>
    </div>
    `);

    // 日付に基づいてデータをフィルタリング
    onChildAdded(dbRef, (snapshot) => {
        const data = snapshot.val();
        const dataDate = new Date(data.date).toDateString(); // データの日付を整形
        $("#filterDate2").text(' <' + chosenDate +'でソート！>');
        if (dataDate === formattedDate) { // フィルタ条件に一致する場合のみ表示
            const html = `
                <tr class="z-0 bg-green-300 border-b-2 border-b-gray-300">
                    <td class="text-xs border-r-2 border-amber-200">${snapshot.key}</td>
                    <td class="border-r-2 border-amber-200">${data.name}</td>
                    <td class="border-r-2 border-amber-200">${data.sex}</td>
                    <td class="text-xs border-r-2 border-amber-200">${data.area}</td>
                    <td class="text-xs border-r-2 border-amber-200">${data.latitude}, ${data.longitude}</td>
                    <td class="text-xs border-r-2 border-amber-200">${data.Wdescription}</td>
                    <td class="text-xs border-r-2 border-amber-200">${data.temp}</td>
                    <td class="text-xs border-r-2 border-amber-200">${data.Wspeed}</td>
                    <td class="text-xs border-r-2 border-amber-200">${data.humidity}</td>
                    <td class="border-r-2 border-amber-200"><img src="${data.BassImageUrl}" alt="Uploaded image"></td>
                    <td class="text-xs border-r-2 border-amber-200">${data.comment}</td>
                    <td class="text-xs border-r-2 border-amber-200">${data.date}</td>
                </tr>
            `;
            $("#filtered-list").append(html);
        }
    });
});

// 名前検索
$("#search").on("click", function() {
        // searchNameに入力したワードをgetSearchNameに与える
        const getSearchName = $("#searchName").val().trim();
        const dbRef = ref(db, "Bass");
        // dbRef内のカラムnameにgetSearchNameに与えれたワードがある場合、searchQueryに与える
        // equalToでは完全一致のみ
        const searchQuery = query(dbRef, orderByChild("name"), equalTo(getSearchName));
        
    $("#addedResults").html(`
    <h1 class="md:ml-3 md:text-left text-center" id="searchName2"></h1>
    <div id="output" style="overflow: auto; height: 300px;">
        <table>
            <thead class="sticky top-0 z-20 bg-gray-300">
                <tr class="text-xs">
                    <th class="border-r-2 border-amber-200">Key</th>
                    <th class="px-4 border-r-2 border-amber-200">Name</th>
                    <th class="border-r-2 border-amber-200">Sex</th>
                    <th class="border-r-2 border-amber-200">Area</th>
                    <th class="border-r-2 border-amber-200">Coordinates</th>
                    <th class="border-r-2 border-amber-200">Weather Description</th>
                    <!-- <th class="veryShort">Icon</th> -->
                    <th class="border-r-2 border-amber-200">Temperature</th>
                    <th class="border-r-2 border-amber-200">Wind Speed</th>
                    <th class="border-r-2 border-amber-200">Humidity</th>
                    <th class="border-r-2 border-amber-200 px-10">Image</th>
                    <th class="border-r-2 border-amber-200">Comment</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody id="search-list"></tbody>
        </table>
    </div>
    `);

    // onChildAdded(dbRef, (searchQuery) => {
    //     const data = searchQuery.val();
    //     // const dataDate = new Date(data.date).toDateString(); // データの日付を整形

    //     // if () { 
    //         const html = `
    //             <tr>
    //                 <td>${searchQuery.key}</td>
    //                 <td>${data.name}</td>
    //                 <td>${data.sex}</td>
    //                 <td>${data.area}</td>
    //                 <td>${data.latitude}, ${data.longitude}</td>
    //                 <td>${data.Wdescription}</td>
    //                 <td>${data.temp}</td>
    //                 <td>${data.Wspeed}</td>
    //                 <td>${data.humidity}</td>
    //                 <td class="BassImageUrl"><img src="${data.BassImageUrl}" alt="Uploaded image"></td>
    //                 <td>${data.comment}</td>
    //                 <td class="Date">${data.date}</td>
    //             </tr>
    //         `;
    //         $("#search-list").append(html);
    //     // }
    // });

    onChildAdded(searchQuery, function(snapshot) {
        const data = snapshot.val();
        // const dataDate = new Date(data.date).toDateString(); // データの日付を整形
        $("#searchName2").text('<' + getSearchName +'の検索結果>');
        // if () { 
            const html = `
                <tr class="z-0 bg-green-300 border-b-2 border-b-gray-300">
                    <td class="text-xs border-r-2 border-amber-200 key">${snapshot.key}</td>
                    <td class="border-r-2 border-amber-200">${data.name}</td>
                    <td class="text-center border-r-2 border-amber-200">${data.sex}</td>
                    <td class="text-xs text-center border-r-2 border-amber-200">${data.area}</td>
                    <td class="text-xs text-center border-r-2 border-amber-200">${data.latitude}, ${data.longitude}</td>
                    <td class="text-xs text-center border-r-2 border-amber-200">${data.Wdescription}</td>
                    <td class="text-xs text-center border-r-2 border-amber-200">${data.temp}</td>
                    <td class="text-xs text-center border-r-2 border-amber-200">${data.Wspeed}</td>
                    <td class="text-xs text-center border-r-2 border-amber-200">${data.humidity}</td>
                    <td class="text-center border-r-2 border-amber-200 BassImageUrl"><img src="${data.BassImageUrl}" alt="Uploaded image"></td>
                    <td class="text-xs text-center border-r-2 border-amber-200">${data.comment}</td>
                    <td class="text-xs text-center Date">${data.date}</td>
                </tr>
            `;
            $("#search-list").append(html);
        // }
    });


});

