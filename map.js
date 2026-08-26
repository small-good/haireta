// 戻るボタン
const backBtn =
    document.getElementById("backBtn");

backBtn.addEventListener(
    "click",
    function () {

        history.back();

    }
);

// 一覧ボタン
const listBtn =
    document.getElementById("listBtn");

listBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "list.html" +
            window.location.search;

    }
);

// 検索条件ボタン
const conditionBtn =
    document.getElementById("conditionBtn");

const conditionPanel =
    document.getElementById("conditionPanel");


// 検索条件の詳細を開閉
conditionBtn.addEventListener(
    "click",
    function () {

        conditionPanel.classList.toggle("show");

        const isOpen =
            conditionPanel.classList.contains("show");

        conditionBtn.setAttribute(
            "aria-expanded",
            isOpen
        );

    }
);


// 地図上部に検索条件の要約を表示
function showConditionSummary(
    keyword,
    chair,
    stroller,
    friendly
) {

    const keywordElement =
        document.getElementById("conditionKeyword");

    const dividerElement =
        document.getElementById("conditionDivider");

    const countElement =
        document.getElementById("conditionCount");


    // 絞り込み条件の数
    const filterCount =
        [
            chair,
            stroller,
            friendly
        ].filter(
            function (condition) {

                return condition === "true";

            }
        ).length;


    // キーワードがある場合
    if (keyword) {

        keywordElement.textContent =
            keyword;

    } else {

        keywordElement.textContent =
            "現在地から5km以内";

    }


    // 絞り込み条件がある場合
    if (filterCount > 0) {

        dividerElement.style.display =
            "";

        countElement.style.display =
            "";

        countElement.textContent =
            "絞り込み" +
            filterCount +
            "件";

    } else {

        dividerElement.style.display =
            "none";

        countElement.style.display =
            "none";

    }

}

// 地図生成
function createMap(
    latitude,
    longitude
) {

    const lat =
        latitude || 35.5866;

    const lng =
        longitude || 139.7075;

    const map =
        L.map("map").setView(
            [
                Number(lat),
                Number(lng)
            ],
            16
        );

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }

    ).addTo(map);

    return map;

}

// 店舗詳細を表示
function showShopDetail(shop) {

    const shopDetail =
        document.getElementById("shopDetail");

    shopDetail.innerHTML = `

        <!-- スワイプ用のバー -->
        <div class="shop-detail-handle"></div>

        <!-- 店名・ジャンル -->
        <div class="shop-detail-header">

            <div class="shop-detail-name">
                ${shop.store_name}
            </div>

            ${shop.genre ? `
                <div class="shop-genre">
                    ${shop.genre}
                </div>
            ` : ""}

        </div>

        <!-- 子連れ情報 -->
        ${createShopIcons(shop)}

        <!-- コメント -->
        <div class="shop-detail-comment">
            <span class="shop-detail-comment-label">
                メモ：
            </span>

            <span>
                ${shop.q4_comment || "特記事項なし"}
            </span>
        </div>

        <!-- 住所 -->
        <div class="shop-detail-address">
            <img
                src="icons/map-pin.png"
                class="address-icon"
                alt=""
            >

            <span>
                ${shop.address_full || ""}
                ${shop.distance != null
            ? " / " + formatDistance(shop.distance)
            : ""}
            </span>
        </div>

        <!-- ボタン -->
        ${createShopActions(shop)}

    `;

    // 下からニュッと表示
    shopDetail.classList.add("show");

}

// 店舗詳細を下スワイプで閉じる
function enableShopDetailSwipe() {

    const shopDetail =
        document.getElementById("shopDetail");

    let startY = 0;
    let currentY = 0;

    // 指を置いた位置
    shopDetail.addEventListener(
        "touchstart",
        function (event) {

            startY =
                event.touches[0].clientY;

            // 指で動かしている間はアニメーションを止める
            shopDetail.style.transition =
                "none";

        }
    );

    // 指を動かしている間
    shopDetail.addEventListener(
        "touchmove",
        function (event) {

            currentY =
                event.touches[0].clientY - startY;

            // 下方向だけ動かす
            if (currentY > 0) {

                shopDetail.style.transform =
                    `translateY(${currentY}px)`;

            }

        }
    );

    // 指を離したとき
    shopDetail.addEventListener(
        "touchend",
        function () {

            // アニメーションを戻す
            shopDetail.style.transition =
                "transform 0.3s ease";

            // 80px以上下げたら閉じる
            if (currentY > 80) {

                shopDetail.classList.remove("show");

                shopDetail.style.transform = "";

            } else {

                // 少ししか動かしていなければ元の位置へ戻す
                shopDetail.style.transform = "";

            }

            currentY = 0;

        }
    );

}

// 本体
async function main() {

    // CSV読込
    const shops = await loadCsv();

    // URLの検索条件取得
    const {
        keyword,
        chair,
        stroller,
        friendly,
        latitude,
        longitude
    } = getSearchParams();

    // 検索条件表示の生成
    const conditionText = createConditionText(
        keyword,
        chair,
        stroller,
        friendly,
        latitude,
        longitude
    );

    document.getElementById("searchCondition").innerHTML =
        conditionText;

    showConditionSummary(
        keyword,
        chair,
        stroller,
        friendly
    );

    let shopsWithDistance = shops;

    // 現在地がある場合は距離を計算
    if (latitude && longitude) {

        shopsWithDistance = addDistanceToShops(
            shops,
            latitude,
            longitude
        );

        shopsWithDistance = sortShopsByDistance(
            shopsWithDistance
        );

    }

    // 条件で絞り込み
    let filteredShops =
        filterShops(
            shopsWithDistance,
            keyword,
            chair,
            stroller,
            friendly
        );

    // 現在地検索なら5km以内に絞る
    if (latitude && longitude) {

        filteredShops =
            filterNearbyShops(
                filteredShops
            );

    }

    console.log("地図の緯度：" + latitude);
    console.log("地図の経度：" + longitude);

    const map = createMap(
        latitude,
        longitude
    );

    if (
        latitude &&
        longitude
    ) {

        L.circleMarker(
            [
                Number(latitude),
                Number(longitude)
            ],
            {

                radius: 8,
                color: "#ffffff",
                weight: 3,
                fillColor: "#4285F4",
                fillOpacity: 1

            }

        )
            .addTo(map)
            .bindPopup(
                "現在地"
            );

    }

    // ピン表示
    filteredShops.forEach(function (shop) {

        if (!shop.lat || !shop.lng) {
            return;
        }

        const marker = L.marker([
            Number(shop.lat),
            Number(shop.lng)
        ]).addTo(map);

        marker.on(
            "click",
            function () {

                // 検索条件の詳細を閉じる
                conditionPanel.classList.remove("show");

                conditionBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );


                // 店舗詳細を表示
                showShopDetail(shop);


                // 選択したピンを一度中央へ移動
                map.panTo(
                    marker.getLatLng(),
                    {
                        animate: true
                    }
                );


                // 店舗詳細カードの高さに合わせて
                // ピンを画面上側へ移動
                setTimeout(
                    function () {

                        const shopDetail =
                            document.getElementById(
                                "shopDetail"
                            );

                        const moveDistance =
                            shopDetail.offsetHeight / 2;

                        map.panBy(
                            [
                                0,
                                moveDistance
                            ],
                            {
                                animate: true
                            }
                        );

                    },
                    250
                );

            }
        );

    });

    enableShopDetailSwipe();

}

main();