/**
 * Terrapin Site Search
 * 
 * This code depends on the file "search.json" on site, which has title, url, and content
 * properties. The content is the original markdown of the page. To parse that content,
 * the "marked" parser (https://marked.js.org/) is required. The parser boils down the
 * content to simple newline-separated strings.
 */
TerrapinSearch = {
    json: null,
    renderer: {
        code(text) { return "" },
        html(text) { return text.replace(/<br.*?>/g, "\n") },
        hr() { return "" },
        checkbox() { return "" },
        list(body) { return body },
        blockquote(text) { return text + "\n" },
        heading(text) { return "<h5>" + text + "</h5>\n" },
        paragraph(text) { return text.replace(/\n/g, " ") + "\n" },
        listitem(text) { return text + "\n" },
        table(header, body) { return header + "\n" + body + "\n" },
        tablerow(text) { return text },
        tablecell(text) { return text + "\n" },
        strong(text) { return text },
        codespan(text) { return text },
        br() { return "\n" },
        em(text) { return text },
        del(text) { return text },
        text(text) { return text },
        link(href, title, text) { return text }, 
        image(href, title, text) { return "" } 
    },
    /**
     * Load the index file from the server.
     * @param {string} url 
     */
    load: async function(url = "/assets/json/search.json") {
        if (!TerrapinSearch.json) {
            marked.use({ renderer: TerrapinSearch.renderer });
            try {
                let res = await fetch(url);
                TerrapinSearch.json = await res.json();
                for (let page of TerrapinSearch.json) {
                    if (page.content)
                        page.content = marked(page.content, { gfm: true, mangle: false });
                }
                return json;
            }
            catch (e) {
                return null;
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
        let re = TerrapinSearch._getRegExp(text);
        for (let page of TerrapinSearch.json) {
            if (!page.content)
                continue;
            let finds = [];
            let s = page.content;
            s.replace(re, function(match, m1, offset) {
                // find start and end of line
                let bgn = offset, end = offset;
                while (bgn > 0 && s[bgn] != "\n")
                    bgn--;
                while (end < s.length && s[end] !== "\n")
                    end++;
                let t = s.substring(bgn, end).trim();
                t = t.replace(re, '<span class="found">' + match + '</span>');
                if (!finds.includes(t))
                    finds.push(t);
            });
            if (finds.length)
                out.push({ title: page.title, url: page.url, finds });
        }
        let html = "";
        if (!out.length)
            html = '<b>No results for "' + text + '".</b>';
        else
         for (let res of out) {
            html += '<a class="searchresult" href="' + res.url + '" title="' + res.url + '"><h4>' + res.title + "</h4>";
            for (let line of res.finds) {
                html += '<p>' + line + '</p>';
            }
            html += '</a><hr/>';
        }
        $("#search-text").text(text);
        $("#search-result .modal-body").html(html);
        $(".searchresult").on("click", function(ev) {
            let href = $(this).attr("href").trim();
            let url = new URL(location.href);
            url.pathname = href;
            url.searchParams.set("s", text);
            location.href = url.toString();
        });
        $("#search-result").modal();
    },
    /**
     * Colorize all texts holding the search text given in the s= query arg.
     */
    colorize: function() {
        let search = new URLSearchParams(location.search);
        let text = search.get("s") || "";
        if (!text)
            return;
        $("#content-right").highlight(text, { ignoreCase: true, class: "found" });
        $("span.found:first-child")[0].scrollIntoView();
    },

    _getRegExp: function(text) {
        let reText = text.replace(/([\[\](){}.^$])/g, "\\$1");
        return new RegExp("(" + reText + ")", "ig");
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
