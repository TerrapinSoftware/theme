$(document).ready(function () {
    // Check if we want to hide header, footer, etc
    var q = new URLSearchParams(location.search);
    var s = (q.get("hide") || "").split(",");
    if (s.includes("header"))
        $(".header").remove();
    if (s.includes("footer"))
        $(".footer").remove();
    if (s.includes("toc"))
        $(".toc").remove();
    if (s.includes("sidebar")) {
        delete window.Split;
        $("#sidebar").remove();
    }
    // Set up the splitter in case we have a sidebar layout
    // That layout includes jquery-splitter.js and defines sidebar_width
    if (window.Split) {
        $(".content").css("grid-template-columns", sidebar_width + "px 7px auto");
        // since the inner div has absolute positioning
        $("#sidebar>div").width(sidebar_width - 20);    // padding of sidebar
        Split({
            minSize: 0,
            columnGutters: [{
                track: 1,
                element: document.querySelector('#splitter'),
            }],
            onDrag: function() {
                // since the inner div has absolute positioning
                $("#sidebar>div").width($("#sidebar").width());
            }
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
        $(document).trigger("verified");
});
$(document).on("verified", function() {
    // Set the height of a PDF iframe
    $("iframe.pdf").height($("#splitter").outerHeight());
});
