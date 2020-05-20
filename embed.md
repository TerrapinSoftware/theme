---
layout: default
toc: false
verify: false
---

## Test an embedded iframe

The embedded iframe below should auto-adjust to the content height

<iframe id="test" src="/index?hide=header,footer" style="width:100%"></iframe>

<script>
$(document).ready(function() {
    $(window).on("message", function(ev) {
        var data = ev.originalEvent.data;
        switch (data.cmd) {
            case "height":
                $("#test").height(data.data);
                break;
            case "link":
                location.href = data.data;
                break;
        }
    });
});
</script>
