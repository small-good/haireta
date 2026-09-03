// ボタン取得
const listBtn =
    document.getElementById("listBtn");

const mapBtn =
    document.getElementById("mapBtn");


// 入力内容を取得
function getSearchConditions() {

    const keyword =
        document
            .getElementById("keyword")
            .value
            .trim();

    const genre =
        document
            .getElementById("genre")
            .value;

    const chair =
        document
            .getElementById("chair")
            .checked;

    const stroller =
        document
            .getElementById("stroller")
            .checked;

    const friendly =
        document
            .getElementById("friendly")
            .checked;


    return {
        keyword,
        genre,
        chair,
        stroller,
        friendly
    };

}


// 子連れ条件をチェック
function validateFilters(conditions) {

    if (
        conditions.chair ||
        conditions.stroller ||
        conditions.friendly
    ) {
        return true;
    }


    const filterSection =
        document.getElementById(
            "filterSection"
        );

    const filterError =
        document.getElementById(
            "filterError"
        );


    filterSection.classList.add(
        "has-error"
    );

    filterError.classList.add(
        "show"
    );


    filterSection.scrollIntoView(
        {
            behavior: "smooth",
            block: "center"
        }
    );


    return false;

}


// URLパラメータ作成
function createSearchParams(
    conditions
) {

    const params =
        new URLSearchParams();


    params.set(
        "keyword",
        conditions.keyword
    );

    params.set(
        "genre",
        conditions.genre
    );

    params.set(
        "chair",
        conditions.chair
    );

    params.set(
        "stroller",
        conditions.stroller
    );

    params.set(
        "friendly",
        conditions.friendly
    );


    return params;

}


// ==============================
// 一覧で見る
// ==============================

listBtn.addEventListener(
    "click",
    function () {

        const conditions =
            getSearchConditions();


        if (
            !validateFilters(
                conditions
            )
        ) {
            return;
        }


        const params =
            createSearchParams(
                conditions
            );


        window.location.href =
            "list.html?" +
            params.toString();

    }
);


// ==============================
// 地図で見る
// ==============================

mapBtn.addEventListener(
    "click",
    function () {

        const conditions =
            getSearchConditions();


        if (
            !validateFilters(
                conditions
            )
        ) {
            return;
        }


        console.log(
            "現在地を取得します"
        );


        navigator
            .geolocation
            .getCurrentPosition(

                // 取得成功
                function (position) {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    const params =
                        createSearchParams(
                            conditions
                        );


                    params.set(
                        "lat",
                        latitude
                    );

                    params.set(
                        "lng",
                        longitude
                    );


                    window.location.href =
                        "map.html?" +
                        params.toString();

                },


                // 取得失敗
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
                        "地図を見るには現在地の取得が必要です。位置情報の設定を確認してください。"
                    );

                }

            );

    }
);


// ==============================
// 条件選択後はエラー解除
// ==============================

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
                    document
                        .getElementById(
                            "chair"
                        )
                        .checked ||

                    document
                        .getElementById(
                            "stroller"
                        )
                        .checked ||

                    document
                        .getElementById(
                            "friendly"
                        )
                        .checked;


                if (!isSelected) {
                    return;
                }


                document
                    .getElementById(
                        "filterSection"
                    )
                    .classList.remove(
                        "has-error"
                    );


                document
                    .getElementById(
                        "filterError"
                    )
                    .classList.remove(
                        "show"
                    );

            }
        );

    }
);