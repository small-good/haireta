const displayStep = 20;

let displayCount = displayStep;
let searchResults = [];

const backBtn =
    document.getElementById("backBtn");

const mapBtn =
    document.getElementById("mapBtn");

backBtn.addEventListener(
    "click",
    function () {
        window.location.href =
            "index.html";
    }
);

mapBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "map.html" +
            window.location.search;

    }
);

const topBtn =
    document.getElementById("topBtn");

topBtn.addEventListener(
    "click",
    function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);

// ショップカードのアクションボタン作成
function createShopActions(shop) {

    return `
    <div class="shop-actions">

        <a
            class="action-btn google-btn"
            href="https://www.google.com/search?q=${encodeURIComponent(
        shop.store_name + " " + (shop.address_full || "")
    )}"
            target="_blank">

            <img src="icons/google-g.svg">
            Google検索

        </a>

        <a
            class="action-btn map-btn"
            href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        shop.store_name + " " + (shop.address_full || "")
    )}"
            target="_blank">

            <img src="icons/google-maps.svg">
            マップで見る

        </a>

    ${shop.phone ? `
        <a
            class="phone-btn"
            href="tel:${shop.phone}">
            📞
        </a>
        ` : ""}

    </div>
    `;

}


// ショップカード生成
function createShopCards(filteredShops) {

    let html = "";

    filteredShops.forEach(shop => {

        html += `
        <div class="shop-card">

            <div class="shop-header">

                <div class="shop-name">
                    ${shop.store_name}
                </div>

                ${shop.genre ? `
                    <div class="shop-genre">
                        ${shop.genre}
                    </div>
                ` : ""}

            </div>

            ${createShopIcons(shop)}

            <div class="shop-comment">
                <span class="comment-label">メモ：</span>
                <span class="comment-text">
                    ${shop.q4_comment || "特記事項なし"}
                </span>
            </div>

            <div class="shop-address">
                <img src="icons/map-pin.png" class="address-icon">
                <span class="address-text">
                    ${shop.address_full || ""}
                    ${shop.distance != null ? " / " + formatDistance(shop.distance) : ""}
                </span>
            </div>

            ${createShopActions(shop)}

        </div>
        `;

    });

    return html;

}


// 検索結果が0件のときの表示
function createNoResultMessage(latitude, longitude) {

    if (latitude && longitude) {

        return `
        <div class="shop-card">

            <div class="shop-name no-result-title">
                📍 現在地周辺にお店がありません
            </div>

            <div class="shop-comment">
                現在は大田区を中心に、<br>
                掲載エリアを順次拡大しています。
            </div>

        </div>
        `;

    }

    return `
    <div class="shop-card">

        <div class="shop-name no-result-title">
            🔍 条件に合うお店が見つかりません
        </div>

        <div class="shop-comment">
            条件を変更するか、<br>
            別のエリアでお試しください。
        </div>

    </div>
    `;

}

// 通常検索の結果を表示
function displaySearchResults() {

    const displayedShops = searchResults.slice(
        0,
        displayCount
    );

    const html = createShopCards(
        displayedShops
    );

    document.getElementById("shopList").innerHTML =
        html;

    const moreBtn =
        document.getElementById("moreBtn");

    if (displayCount >= searchResults.length) {
        moreBtn.style.display = "none";
    } else {
        moreBtn.style.display = "block";
    }

}

const moreBtn =
    document.getElementById("moreBtn");

moreBtn.addEventListener("click", function () {

    displayCount += displayStep;

    displaySearchResults();

});


// TOPに戻るボタンを下にスクロールしたら表示
window.addEventListener(
    "scroll",
    function () {

        if (window.scrollY > 300) {
            topBtn.style.display = "block";
        } else {
            topBtn.style.display = "none";
        }

    }
);

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


// 本体
async function main() {

    // CSV読込
    const shops = await loadCsv();

    // デバッグ用
    console.log(shops);

    const {
        keyword,
        chair,
        stroller,
        friendly,
        latitude,
        longitude
    } = getSearchParams();

    if (latitude && longitude) {

        mapBtn.style.display =
            "block";

    } else {

        mapBtn.style.display =
            "none";

    }

    let shopsWithDistance = shops;

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

    console.log("現在地の緯度：" + latitude);
    console.log("現在地の経度：" + longitude);

    console.log(shopsWithDistance);

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

    // 検索結果を絞り込み
    let filteredShops = filterShops(
        shopsWithDistance,
        keyword,
        chair,
        stroller,
        friendly
    );

    let totalCount;

    if (latitude && longitude) {
        filteredShops = filterNearbyShops(
            filteredShops
        );

        totalCount = filteredShops.length;
        filteredShops = filteredShops.slice(
            0,
            50
        );

    } else {
        totalCount = filteredShops.length;
    }

    // 検索結果の表示
    if (filteredShops.length === 0) {

        document.getElementById("shopList").innerHTML =
            createNoResultMessage(
                latitude,
                longitude
            );

        document.getElementById("moreBtn").style.display =
            "none";

    } else if (latitude && longitude) {

        const html = createShopCards(
            filteredShops
        );

        document.getElementById("shopList").innerHTML =
            html;

        document.getElementById("moreBtn").style.display =
            "none";

    } else {

        searchResults = filteredShops;

        displaySearchResults();

    }

}

main();