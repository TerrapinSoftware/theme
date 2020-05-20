$(document).ready(function () {
    // Check if we want to hide header, footer, etc
    var q = new URLSearchParams(location.search);
    var s = (q.get("hide") || "").split(",");
    for (var el of s)
        $(".hide-" + el).hide();
    if (s.includes("sidebar"))
        delete window.Split;
    // Set up the splitter in case we have a sidebar layout
    // That layout includes $-splitter.js and defines sidebar_width
    if (window.Split) {
        $("#content-main").css("grid-template-columns", sidebar_width + "px 7px auto");
        Split({
            minSize: 0,
            columnGutters: [{
                track: 1,
                element: document.querySelector('#content-splitter'),
            }]
        });
    }
    /**
     * Iterate over all tables and check if the header is empty.
     * If so, hide that header.
     */
    $("thead tr").each(function (idx, tr) {
        empty = true;
        $("th", $(tr)).each(function (idx, th) {
            empty &= ($(th).text().trim() === "");
        });
        if (empty)
            $(tr).hide();
    });
    // Send a Verified event if there is no verification
    if (!window.verifyToken)
        $(window).trigger("verified");
});
$(window).on("verified resize", function() {
    var content = $("#content-right")[0];
    if (content) {
        var scrollbarWidth = (content.offsetWidth - content.clientWidth);
        $(".toc").css("right", scrollbarWidth);
    }
    $("iframe.pdf")
        // Set the height of a PDF iframe
        .height($("#content-splitter").height())
        // we want full width
        .parent().css({padding: 0, overflow: "hidden"});
});

/**
 * <iframe> support
 * 
 * If a page displays in an iframe, the page posts the following messages
 * to the embedding parent:
 * 
 * { cmd: "url", data: location.href } posted if ?history is set
 * { cmd: "height", data: $("body").outerHeight() } the total height of the page
 * { cmd: "link", data: link } if a link is clicked, the parent must react
 * { cmd: "pageclick", data: []} if the page was clicked (for activation responses)
 * 
 * Links posted to the parent are always absolute, with the current query string added.
 */
(function () {
    if (!window.parent)
        return;
    $(document).ready(_ => {
       // post the current URL to a parent if history is not present
        let params = new URLSearchParams(location.search);
        if (params.get("history") !== true && window.parent)
            window.parent.postMessage({ cmd: "url", data: location.href }, '*');

        // tell parent the height whenever the height of the doc changhes
        var elem = $(".content");
        var id = 0;
        $(window).on("resize", function() {
            // but with a short delay to avoid flicker
            if (id)
                clearTimeout(id);
            id = setTimeout(function() {
                window.parent.postMessage({ cmd: "height", data: elem.outerHeight(true) }, "*");
            }, 200);
        });
        $(window).trigger("resize");

        $("a").click(function (e) {
            let link = $(this).prop("href");
            const url = new URL(link);
            // Add our own query string
            var s = new URLSearchParams(location.search);
            s.forEach(function(value, key) {
                url.searchParams.set(key, value);
            });
            if (url.host !== location.host)
                // make the parent change the page (security issue)
                // note that Magento also needs to act!
                window.parent.postMessage({ cmd: "link", data: url.toString() }, "*");
            else if (location.pathname !== url.pathname || !url.hash)
                // Same host: we can handle that ourselves
                location.href = url;
            else {
                // Must handle directly because of CORS
                let elem = $(url.hash);
                if (elem.length) {
                    elem[0].scrollIntoView();
                    window.parent.postMessage({ cmd: "link", data: url.toString() }, "*");
                }
            }
            e.preventDefault();
            e.stopPropagation();
        });
        // send generic clicks to Logo so it can activate the panel
        $(document).on("click", function(ev) {
            try {
                if (window.parent)
                    window.parent.postMessage({ cmd: "pageclick", data: []}, "*");
            }
            catch (e) { }
        });
    });
})();

