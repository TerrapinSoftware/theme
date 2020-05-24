/**
 * Terrapin Site Search
 * 
 * This code depends on the file "search.json" on site, which has title, url, and content
 * properties. The content contains %%H%% for headers (terminated by a newline), and %%PB%%
 * and %%PE%% for paragraph wrappers (the code below removes newlines in between).
 */
TerrapinSearch = {
    json: null,
    /**
     * Load the index file from the server.
     * @param {string} url 
     */
    load: async function(url = "/assets/json/search.json") {
        if (!TerrapinSearch.json) {
            try {
                let res = await fetch(url);
                TerrapinSearch.json = await res.json();
                for (let page of TerrapinSearch.json) {
                    if (page.content)
                        page.content = TerrapinSearch.parse(page.content);
                }
                return true;
            }
            catch (e) {
                TerrapinSearch.json = [];
                return false;
            }
        }
    },
    /**
     * Do the search and create the Found dialog.
     * @param {string} text 
     */
    find: async function(text) {
        if (!TerrapinSearch.json)
            await TerrapinSearch.load();
        let out = [];
        let reText = text.replace(/([\[\](){}.^$])/g, "\\$1");
        if (!reText.includes(" "))
            reText = "\\b" + reText + "\\b";    // word search
        let re = new RegExp(reText, "i");
        for (let page of TerrapinSearch.json) {
            if (!page.content)
                continue;
            let finds = [];
            for (let s of page.content.split("\n")) {
                s.replace(re, function(match, offset) {
                    // find start and end of line, max offset = 50
                    let bgn = offset, end = offset;
                    while (bgn > 0 && s[bgn] != "\n")
                        bgn--;
                    while (end < s.length && s[end] !== "\n")
                        end++;
                    let prefix = "";
                    if (offset - bgn > 50)
                        prefix = "...", bgn = offset - 50;
                    let t = s.substring(bgn, end).trim();
                    t = t.replace(re, '<span class="highlight">' + match + '</span>');
                    if (!finds.includes(t))
                        finds.push(prefix + t);
                });
            }
            if (finds.length)
                out.push({ title: page.title, url: page.url, finds });
        }
        let html = "";
        if (!out.length)
            html = '<b>No results for "' + text + '".</b>';
        else
         for (let res of out) {
            html += '<a class="searchresult" href="' + res.url + '" title="' + res.url + '"><h4>' + res.title + "</h4></a>";
            for (let line of res.finds) {
                html += '<p><a class="searchresult" href="' + res.url + '">' + line + '</a></p>';
            }
            html += '</a><hr/>';
        }
        $("#search-text").text(text);
        $("#search-result .modal-body").html(html);
        $(".searchresult").on("click", function(ev) {
            let href = $(this).attr("href").trim();
            let found = $(this).text();
            if (found.startsWith("..."))
                found = found.substr(3);
            sessionStorage.setItem("searchResult", JSON.stringify({ text, found }));
            let url = new URL(location.href);
            url.pathname = href;
            location.href = url.toString();
        });
        $("#search-result").modal();
    },
    /**
     * Colorize all texts holding the search text given in the sessionStorage.
     */
    colorize: function() {
        let found = sessionStorage.getItem("searchResult");
        sessionStorage.removeItem("searchResult");
        if (!found)
            return;
        found = JSON.parse(found);
        $("#content-right").highlight(found.text, { ignoreCase: true, class: "found" });
        var s = found.found.replace("'", "\\'");
        var c = $("#content-right");
        while (s.length) {
            found = $("#content-right *:contains('" + s + "'):last");
            if (found.length) {
                found[0].scrollIntoView();
                return;
            }
            // retry with 2 less characters
            s = s.substr(0, -2);
        }
        $("span.highlight:first-child")[0].scrollIntoView();
    },

    _getRegExp: function(text) {
        let reText = text.replace(/([\[\](){}.^$])/g, "\\$1");
        return new RegExp("(" + reText + ")", "ig");
    },

    parse: function(html) {
        // replace newlines in paragraphs with spaces
        html = html.replace(/%%PB%%([\s\S]*?)%%PE%%/img, function(match, text) {
            return text.replace(/\n/g, " ");
        });
        // generate headers
        html = html.replace(/%%H%%(.*?)\n/mg, "<h6>$1</h6>\n");
        // remove multiple newlines
        html = html.replace(/\n\s*\n/mg, "\n");
        return html;
    }
};

// make jquery :contains case insensitive
$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

$(document).ready(function() {
    $("#search-field").on("keydown", function(ev) {
        if (ev.keyCode === 13) {
            TerrapinSearch.find($(this).val());
            ev.preventDefault();
        }
    });
    TerrapinSearch.colorize();
});
