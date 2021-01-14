function verifyToken() {
    debugger;
    var token = sessionStorage.getItem("token");
    if (token) {
        var xmlhttp = new XMLHttpRequest();
        var url = "https://as.terrapinlogo.com?domain=book&token=" + token;
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    var data = JSON.parse(this.responseText);
                    var path = location.pathname.substr(1).split('/');
                    // First path element must be == SKU
                    if (path[0] === data.sku) {
                        $("#name").text(data.name);
                        $(".wrapper").show();
                        $(window).trigger("verified");
                        return;
                    }
                }
                // leave it for now so people can return to a correct page
//                sessionStorage.removeItem("token");
                $(".wrapper").remove();
                location.href = "/";
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }
    else {
        $(".wrapper").remove();
        location.href = "/";
    }
};
verifyToken();

$(document).ready(function() {
    $("#logout").on("click", function(ev) {
        ev.preventDefault();
        sessionStorage.removeItem("token");
        location.href = "/";
    });
    setTimeout(function() {
        debugger;
        $("#logout").trigger("click");
    }, 30*60*1000);
});
