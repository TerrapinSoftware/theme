var editor;

class Editor {

    constructor() {
        this.k = [];
        let i = 0;
        for (; i < 64;) {
            this.k[i] = 0 | Math.sin(++i % Math.PI) * 4294967296;
        }

        this.host = location.host.split(".");
        this.repo = this.host[0];
        this.host[0] = "auth";
        this.host = "https://" + this.host.join(".");
        this.frontMatter = "";
        this.session = {
            repo: this.repo,
            origPath: "",
            dir: "",
            path: "",
            first: "",
            last: "",
            email: "",
            token: "",
            sha: "",
            hash: ""
        };
        for (let key in sessionStorage) {
            if (key in this.session)
                this.session[key] = sessionStorage.getItem(key);
        }
        this.mde = new EasyMDE({
            autoDownloadFontAwesome: false,
            autosave: {
                enabled: true,
                uniqueId: "EditorContent",
                delay: 1000,
                submit_delay: 5000,
                text: "Autosaved: "
            },
            toolbar: ["bold", "italic", "strikethrough",
                {
                    name: "headings",
                    className: "fa fa-heading",
                    title: "Headings",
                    children: ["heading-1", "heading-2", "heading-3"]
                },
                'link', 'code', 'table', 'clean-block', 'horizontal-rule',
                '|', 'redo', 'undo',
                {
                    name: "upload",
                    className: "fa fa-cloud-upload-alt",
                    title: "Upload",
                    action: mde => {
                        editor.save();
                    }
                }, "preview", "side-by-side",
                "|", {
                    name: "exit",
                    className: "far fa-times-circle",
                    title: "Exit and Return to Page",
                    action: mde => {
                        editor.exit(false);
                    }
                }, {
                    name: "logout",
                    className: "fas fa-sign-out-alt",
                    title: "Log Out and Return to Page",
                    action: mde => {
                        editor.exit(true);
                    }
                }, "|", "guide"
            ],
            status: [
                {
                    className: "filename",
                    defaultValue: el => {
                        el.innerHTML = "";
                    },
                    onUpdate: el => {
                        el.innerHTML = "File: " + this.session.origPath;
                    }
                },
                "autosave", "lines", "words", "cursor",
                {
                    className: "user",
                    defaultValue: el => {
                        el.innerHTML = this.session.first ? "User: " + this.session.first : "";
                    },
                    onUpdate: el => {
                        el.innerHTML = this.session.first ? "User: " + this.session.first : "";
                    }
                }
            ],
            element: document.getElementById("editor-box"),
            initialValue: "",
            errorCallback: this.msgBox,
            renderingConfig: {
                sanitizerFunction: renderedHTML => {
                    return this.sanitize(renderedHTML);
                }
            }
        });
        //      this.mde.toggleSideBySide();
        $(".editor-statusbar").addClass("fullscreen");
        $(window).on("resize", _ => {
            let h = $("body").height() - $(".editor-toolbar").outerHeight() - $(".editor-statusbar").outerHeight();
            $(".CodeMirror").css("height", h);
        });
        this.mde.toggleFullScreen();

        let s = new URLSearchParams(location.search);
        let path = s.get("edit");
        if (!path) {
            if (!this.session.path)
                this.msgBox("You did not supply the name of the file to edit.");
        }
        else {
            path = path.split("/");
            let name = path.pop();
            if (s.has("sb"))
                name = "_sidebar.md";
            if (!name)
                name = "index";
            if (!name.includes("."))
                name += ".md";
            this.session.dir = path.join("/");
            path.push(name);
            this.setSession({ origPath: s.get("edit"), path: path.join("/") });
        }
        $('#edit-login-dlg').on('shown.bs.modal', function () {
            $('#edit-user').trigger('focus');
        });
        $('#edit-login-dlg input').on('keypress', event => {
            if (event.which === 13)
                this._login($("#edit-user").val(), $("#edit-pass").val());
        });
        $("#edit-login").on("click", _ => {
            this._login($("#edit-user").val(), $("#edit-pass").val());
        });
        $(window).trigger("resize");
    }

    async load() {
        $("#wait-spinner").show();
        try {
            let res = await fetch(this.host + "/get/" + this.session.repo + this.session.path, {
                headers: {
                    Authorization: "token " + this.session.token
                }
            });
            if (!res.ok)
                this.errorBox(res.status);
            else {
                res = await res.json();
                switch (res.code) {
                    case 200:
                        let match = /^---.*?\n---/s.exec(res.content);
                        if (match) {
                            this.frontMatter = match[0];
                            res.content = res.content.substr(this.frontMatter.length);
                            this.mde.autosave();
                        }
                        let s = res.content.trim();
                        delete res.content;
                        delete res.code;
                        this.mde.value(s);
                        res.hash = this.md5(s);
                        this.setSession(res);   // token, sha
                        break;
                    case 403:
                        this.login();
                        break;
                    default:
                        this.errorBox(res.code);
                }
            }
        }
        catch (e) {
            this.msgBox(e.message);
        }
        finally {
            $("#wait-spinner").hide();
        }
    }

    async save() {
        $("#wait-spinner").show();
        let text = this.mde.value();
        let s = text;
        if (s)
            s = this.frontMatter + s;
        try {
            let res = await fetch(this.host + "/put/" + this.session.repo + this.session.path, {
                method: "POST",
                headers: {
                    Authorization: "token " + this.session.token
                },
                body: JSON.stringify({
                    message: "Updated by " + this.session.first,
                    committer: {
                        name: this.session.fist + " " + this.session.last,
                        email: this.session.email
                    },
                    sha: this.session.sha,
                    content: s
                })
            });
            if (!res.ok)
                this.errorBox(res.status);
            else {
                res = await res.json();
                if (res.code === 200)
                    this.setSession({ sha: res.sha, hash: this.md5(text) });
                else
                    this.errorBox(res.code);
            }
        }
        catch (e) {
            this.msgBox(e.message);
        }
        finally {
            $("#wait-spinner").hide();
        }
    }

    isModified() {
        let hash = this.md5(this.mde.value());
        return hash !== this.session.hash;
    }

    sanitize(html) {
        html = html.replace(/<img src="(.*?)"/gs, (match, url) => {
            if (!url.startsWith("http") && !url.startsWith("/"))
                return `<img src="${this.dir}/${url}"`;
            return match;
        });
        return html;
    }

    setSession(obj) {
        this.session = Object.assign(this.session, obj);
        for (let key in this.session)
            sessionStorage.setItem(key, this.session[key]);
    }
    login() {
        this._logout();
        $("#edit-login-dlg").modal();
    }
    async exit(logout) {
        if (this.isModified()) {
            let ok = await this.confirm("You have unsaved changes! Continue?", true);
            if (!ok)
                return;
        }
        let path = this.session.origPath;
        this.setSession({ sha: "", origPath: "", path: "", dir: "", hash: "" });
        this.mde.clearAutosavedValue();
        if (logout)
            this._logout();
        location.assign(path);
    }

    async _login(user, pass) {
        this._logout();
        user = encodeURIComponent(user);
        pass = encodeURIComponent(pass);
        let res = await fetch(this.host + "/login?user=" + user + "&pass=" + pass);
        if (res.ok) {
            res = await res.json();
            res.time = Date.now();
            if (res.code == 200) {
                this.session.sha = "";
                this.setSession(res);
                $("#edit-login-dlg").modal("hide");
                await this.load();
            } else
                $("#login-error").text("Bad username or password");
            $('#edit-user').trigger('focus');
        }
    }
    _logout() {
        this.mde.clearAutosavedValue();
        this.mde.value("");
        $("#login-error").text("");
        for (var key in this.session)
            sessionStorage.removeItem(key);
    }

    focus() {
        this.mde.codemirror.focus();
    }
    msgBox(s) {
        $("#msgbox .modal-body").html(s);
        $("#msgbox").modal();
    }
    errorBox(code) {
        this.msgBox(this.errorMsg(code));
    }
    errorMsg(code) {
        let s = {
            401: "The server rejected your call.",
            403: "You are not logged in.",
            404: this.session.origPath + " was not found.<br/>"
                 + "Please exit, or save a new file.",
            406: "Not called from a browser.",
            409: "Cannot save " + this.session.origPath,
            422: "Cannot save " + this.session.origPath
        }[code];
        if (!s)
            s = "Error code: " + code;
        this.msgBox(s);
    }
    /**
     * Display a Confirm (Yes/No) box. If no is true, No is set as the default.
     * Returns a Promise that resolves to true or false.
     */
    confirm(msg, no = false) {
        if (no) {
            $("#bs-confirm-yes").removeClass("btn-primary btn-ok").addClass("btn-cancel btn-default");
            $("#bs-confirm-no").removeClass("btn-cancel btn-default").addClass("btn-ok btn-primary");
        } else {
            $("#bs-confirm-no").removeClass("btn-primary btn-ok").addClass("btn-cancel btn-default");
            $("#bs-confirm-yes").removeClass("btn-cancel btn-default").addClass("btn-ok btn-primary");
        }
        $('#bs-confirm-msg').html(msg);

        var result = false;
        return new Promise(function (resolve, reject) {
            $('#bs-confirm-yes').one('click', function () {
                result = true;
            });
            $('#bs-confirm').one('hidden.bs.modal', function () {
                $('#bs-prompt').off('keypress');
                resolve(result);
            });
            $('#bs-confirm').modal("show");
        });
    }

    md5(s) {
        if (!s)
            return "";
        var i, b, c, d,
            h = [b = 0x67452301, c = 0xEFCDAB89, ~b, ~c],
            words = [],
            j = unescape(encodeURI(s)) + '\x80',
            a = j.length;

        s = (--a / 4 + 2) | 15;

        // See "Length bits" in notes
        words[--s] = a * 8;

        for (; ~a;) { // a !== -1
            words[a >> 2] |= j.charCodeAt(a) << 8 * a--;
        }


        for (i = j = 0; i < s; i += 16) {
            a = h;

            for (; j < 64;
                a = [
                    d = a[3],
                    (
                        b +
                        ((d =
                            a[0] +
                            [
                                b & c | ~b & d,
                                d & b | ~d & c,
                                b ^ c ^ d,
                                c ^ (b | ~d)
                            ][a = j >> 4] +
                            this.k[j] +
                            ~~words[i | [
                                j,
                                5 * j + 1,
                                3 * j + 5,
                                7 * j
                            ][a] & 15]
                        ) << (a = [
                            7, 12, 17, 22,
                            5, 9, 14, 20,
                            4, 11, 16, 23,
                            6, 10, 15, 21
                        ][4 * a + j++ % 4]) | d >>> -a)
                    ),
                    b,
                    c
                ]
            ) {
                b = a[1] | 0;
                c = a[2];
            }

            // See "Integer safety" in notes
            for (j = 4; j;) h[--j] += a[j];

            // j === 0
        }

        for (s = ''; j < 32;) {
            s += ((h[j >> 3] >> ((1 ^ j++) * 4)) & 15).toString(16);
            // s += ((h[j >> 3] >> (4 ^ 4 * j++)) & 15).toString(16);
        }

        return s;
    }
}

$(document).ready(_ => {
    editor = new Editor();

    let s = new URLSearchParams(location.search);
    if (!s.has("edit")) {
        $("#wait-spinner").show();
        return;
    }
    if (!sessionStorage.token)
        editor.login();
    else if (sessionStorage.time && sessionStorage.time < (Date.now() - 60 * 60000))
        editor.login();
    else if (!sessionStorage.hash)
        editor.load();
});
