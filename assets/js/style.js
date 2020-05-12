$(document).ready(function () {
    if (window.Split) {
        Split({
            minSize: 0,
            columnGutters: [{
                track: 1,
                element: document.querySelector('#splitter'),
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
});
$(document).on("verified", function() {
    // Set the height of a PDF iframe
    $("iframe.pdf").height($("#splitter").outerHeight());
});
