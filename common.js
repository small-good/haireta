// CSV読込
async function loadCsv() {

    const response = await fetch("data/stores.csv");

    const csv = await response.text();

    const result = Papa.parse(csv, {

        header: true,
        skipEmptyLines: true

    });

    return result.data;

}

// URLから検索条件を取得
function getSearchParams() {

    // URLから検索条件を配列にして格納
    const params = new URLSearchParams(window.location.search);

    // 検索条件を分解して保存
    return {
        keyword: params.get("keyword"),
        genre: params.get("genre"),
        chair: params.get("chair"),
        stroller: params.get("stroller"),
        friendly: params.get("friendly"),
        latitude: params.get("lat"),
        longitude: params.get("lng")
    };

}

// 各店舗に現在地からの距離を追加
// 各店舗に現在地からの距離を追加
function addDistanceToShops(
    shops,
    latitude,
    longitude
) {

    return shops.map(shop => {

        // 緯度経度がない店舗
        if (!shop.lat || !shop.lng) {

            return {
                ...shop,
                distance: null
            };

        }

        const distance = calculateDistance(
            Number(latitude),
            Number(longitude),
            Number(shop.lat),
            Number(shop.lng)
        );

        return {
            ...shop,
            distance: distance
        };

    });

}

// 検索結果と一致する情報の取得
function filterShops(
    shops,
    keyword,
    genre,
    chair,
    stroller,
    friendly
) {

    return shops.filter(shop => {

        if (keyword) {

            const searchText =
                (
                    (shop.store_name || "") +
                    (shop.address_full || "") +
                    (shop.q4_comment || "")
                ).toLowerCase();

            if (
                !searchText.includes(
                    keyword.toLowerCase()
                )
            ) {
                return false;
            }

        }

        if (
            genre &&
            shop.genre !== genre
        ) {
            return false;
        }

        if (
            chair === "true" &&
            shop.q1_child_chair !== "available"
        ) {
            return false;
        }

        if (
            stroller === "true" &&
            shop.q2_stroller_usage !== "available"
        ) {
            return false;
        }

        if (
            friendly === "true" &&
            shop.q3_child_friendly !== "family_friendly"
        ) {
            return false;
        }

        return true;
    });

}

// 2地点間の距離を計算
function calculateDistance(
    lat1,
    lng1,
    lat2,
    lng2
) {

    const earthRadius = 6371;

    const latDiff =
        (lat2 - lat1) * Math.PI / 180;

    const lngDiff =
        (lng2 - lng1) * Math.PI / 180;

    const a =
        Math.sin(latDiff / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(lngDiff / 2) ** 2;

    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadius * c;

}

// 現在地から近い順に並べる
function sortShopsByDistance(shops) {

    return shops.sort(
        (a, b) => a.distance - b.distance
    );

}

// 現在地検索の結果を絞り込む
function filterNearbyShops(shops) {

    const maxDistance = 30;

    return shops.filter(

        shop =>
            shop.distance != null &&
            shop.distance <= maxDistance

    );

}

// 距離の表示を整える
function formatDistance(distance) {

    if (distance < 1) {
        return Math.round(distance * 1000) + "m";
    }

    return distance.toFixed(1) + "km";

}

// 子ども椅子の表示項目を変換
function getChairText(value) {

    switch (value) {
        case "available":
            return "あり";
        case "none":
            return "なし";
        default:
            return "不明";
    }

}

// ベビーカーの表示項目を変換
function getStrollerText(value) {

    switch (value) {
        case "available":
            return "OK";
        case "none":
            return "NG";
        default:
            return "不明";
    }

}

// 雰囲気の表示項目を変換
function getFriendlyText(value) {

    switch (value) {
        case "family_friendly":
            return "気兼ねしない";
        case "neutral":
            return "普通";
        case "not_recommended":
            return "気を使う";
        default:
            return "不明";
    }

}

// ショップカードの3項目作成
function createShopIcons(shop) {

    return `
    <div class="shop-icons">

        <span class="icon-item">
            <img src="icons/child-chair.png" class="shop-icon-img" alt="">
            ${getChairText(shop.q1_child_chair)}
        </span>

        <span class="icon-item">
            <img src="icons/stroller.png" class="shop-icon-img" alt="">
            ${getStrollerText(shop.q2_stroller_usage)}
        </span>

        <span class="icon-item">
            <img src="icons/family-friendly.png" class="shop-icon-img" alt="">
            ${getFriendlyText(shop.q3_child_friendly)}
        </span>

    </div>
    `;

}

// 検索条件表示の生成
function createConditionText(
    keyword,
    genre,
    chair,
    stroller,
    friendly,
    latitude,
    longitude
) {

    let conditionText = "【検索条件】<br>";
    let conditions = [];

    if (chair === "true") {
        conditions.push("子ども椅子あり");
    }

    if (stroller === "true") {
        conditions.push("ベビーカー入店可");
    }

    if (friendly === "true") {
        conditions.push("子連れ歓迎");
    }

    if (conditions.length > 0) {
        conditionText += conditions.join("・");
    }

    if (genre) {

        if (conditions.length > 0) {
            conditionText += "<br>";
        }

        conditionText += "ジャンル：" + genre;

    }


    if (keyword) {

        if (
            conditions.length > 0 ||
            genre
        ) {
            conditionText += "<br>";
        }

        conditionText += "キーワード：" + keyword;

    }

    if (latitude && longitude) {

        if (conditions.length > 0 ||
            genre ||
            keyword
        ) {
            conditionText += "<br>";
        }

        conditionText += "現在地から5km以内・近い順";

    }

    return conditionText;

}

// Googleマップの経路URLを作成
function createGoogleDirectionsUrl(shop) {

    const destination =
        [
            shop.store_name,
            shop.address_full
        ]
            .filter(Boolean)
            .join(" ");

    let url =
        "https://www.google.com/maps/dir/" +
        "?api=1" +
        "&destination=" +
        encodeURIComponent(destination);


    // Place IDがある場合は、店舗をより正確に指定
    if (shop.place_id) {

        url +=
            "&destination_place_id=" +
            encodeURIComponent(
                shop.place_id
            );

    }

    return url;

}


// 店舗カードのアクションボタン作成
function createShopActions(shop) {

    return `
        <div class="shop-actions">

            <!-- Google検索 -->
            <a
                class="action-btn google-btn"
                href="https://www.google.com/search?q=${encodeURIComponent(
        shop.store_name +
        " " +
        (shop.address_full || "")
    )}"
                target="_blank"
            >
                <img
                    src="icons/google-g.svg"
                    alt=""
                >
                Google検索
            </a>


            <!-- 経路 -->
            <a
                class="action-btn map-btn"
                href="${createGoogleDirectionsUrl(shop)}"
                target="_blank"
            >
                <img
                    src="icons/google-maps.svg"
                    alt=""
                >
                経路を見る
            </a>


            <!-- 電話 -->
            ${shop.phone ? `
                <a
                    class="phone-btn"
                    href="tel:${shop.phone}"
                    aria-label="電話をかける"
                >
                    📞
                </a>
            ` : ""}

        </div>
    `;

}