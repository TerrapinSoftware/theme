$(document).ready(function() {
    var code = localStorage.getItem("code");
    if (code) {
        $("#code").val(code);
        $("#remember").prop("checked", true);
    }
    $("#login").on("click", function(ev) {
        ev.preventDefault();
        $("#error").hide();
        var code = $("#code").val().trim().toUpperCase();
        var xmlhttp = new XMLHttpRequest();
        var url = "https://as.terrapinlogo.com?domain=book&user=" + code;
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    var data = JSON.parse(this.responseText);
                    sessionStorage.setItem("token", data.token);
                    if ($("#remember").is(":checked"))
                        localStorage.setItem("code", code);
                    else
                        localStorage.removeItem("code");
                    location.href = "/" + data.sku + "/";
                }
                $("#error").show();
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
        return false;
    })
});