// 検索ボタン
const searchBtn =
    document.getElementById("searchBtn");


searchBtn.addEventListener(
    "click",
    function () {

        // 入力内容を取得
        const keyword =
            document.getElementById("keyword").value.trim();

        const chair =
            document.getElementById("chair").checked;

        const stroller =
            document.getElementById("stroller").checked;

        const friendly =
            document.getElementById("friendly").checked;

        const currentLocation =
            document.getElementById("currentLocation").checked;

        // 条件未選択時のエラー
        if (
            !chair &&
            !stroller &&
            !friendly
        ) {

            const filterSection =
                document.getElementById("filterSection");

            const filterError =
                document.getElementById("filterError");


            filterSection.classList.add(
                "has-error"
            );

            filterError.classList.add(
                "show"
            );


            // 条件欄まで画面を戻す
            filterSection.scrollIntoView(
                {
                    behavior: "smooth",
                    block: "center"
                }
            );

            return;

        }


        // 現在地検索を使う場合
        if (currentLocation) {

            console.log("現在地を取得します");

            navigator.geolocation.getCurrentPosition(

                // 現在地取得成功
                function (position) {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    console.log(
                        "取得した緯度:",
                        latitude
                    );

                    console.log(
                        "取得した経度:",
                        longitude
                    );

                    console.log(
                        "位置精度:",
                        position.coords.accuracy
                    );


                    // 地図画面へ
                    window.location.href =
                        "map.html?" +
                        "keyword=" +
                        encodeURIComponent(keyword) +
                        "&lat=" +
                        latitude +
                        "&lng=" +
                        longitude +
                        "&chair=" +
                        chair +
                        "&stroller=" +
                        stroller +
                        "&friendly=" +
                        friendly;

                },


                // 現在地取得失敗
                function (error) {

                    console.log(
                        "位置情報の取得に失敗しました"
                    );

                    console.log(
                        "エラーコード:",
                        error.code
                    );

                    console.log(
                        "エラー内容:",
                        error.message
                    );

                    alert(
                        "現在地を取得できませんでした。位置情報の設定を確認してください。"
                    );

                }

            );

            return;

        }


        // 現在地検索を使わない場合
        window.location.href =
            "list.html?" +
            "keyword=" +
            encodeURIComponent(keyword) +
            "&chair=" +
            chair +
            "&stroller=" +
            stroller +
            "&friendly=" +
            friendly;

    }
);

// 条件を選択したらエラーを消す
const filterCheckboxes =
    document.querySelectorAll(
        "#chair, #stroller, #friendly"
    );

filterCheckboxes.forEach(
    function (checkbox) {

        checkbox.addEventListener(
            "change",
            function () {

                const isSelected =
                    document.getElementById("chair").checked ||
                    document.getElementById("stroller").checked ||
                    document.getElementById("friendly").checked;


                if (isSelected) {

                    document
                        .getElementById("filterSection")
                        .classList.remove(
                            "has-error"
                        );

                    document
                        .getElementById("filterError")
                        .classList.remove(
                            "show"
                        );

                }

            }
        );

    }
);