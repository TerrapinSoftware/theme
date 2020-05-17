/**
 * Accordion helper
 * 
 * Converts blockquotes to accordions. Inside the blockquote, each <h1> header
 * starts a new card, with the header becoming the card title.
 */
$(document).ready(function() {
    var acc = 0;
    $("#content-right blockquote").each(function(idx, bq) {
        var html = $(bq).html().split("\n");
        var out = '<div id="acc-' + ++acc + '">\n';
        var elem = null;
        var h1 = /<h1.*?>(.*?)<\/h1>/i;
        var n = 0;
        for (var line of html) {
            var m = h1.exec(line);
            if (m) {
                // An accordion header; close a previous one?
                if (n)
                    out += '</div></div></div>\n';
                var title = m[1].trim();
                var id = "acc-" + acc + "-" + ++n;
                out += '<div class="card"><div class="card-header">\n'
                    + '<a class="card-link collapsed" data-toggle="collapse" aria-expanded="false" href="#' + id + '">'
                    + title + '</a></div>\n'
                    + '<div id="' + id + '" class="collapse" data-parent="#acc-' + acc + '"><div class="card-body">\n';
            }
            else
                out += line + "\n";
        }
        if (!n)
            return;
        out += '</div></div></div>\n';
        $(bq).replaceWith($(out));
    });
});
