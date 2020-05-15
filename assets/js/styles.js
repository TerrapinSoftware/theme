$(document).ready(function () {
    // Set up the splitter in case we have a sidebar layout
    // That layout includes jquery-splitter.js and defines sidebar_width
    if (window.Split) {
        $(".content").css("grid-template-columns", sidebar_width + " 7px auto");
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
});
$(document).on("verified", function() {
    // Set the height of a PDF iframe
    $("iframe.pdf").height($("#splitter").outerHeight());
});
