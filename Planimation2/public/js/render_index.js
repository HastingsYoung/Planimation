var FileDropper = (function () {
    const _this = this;
    this.container = [];
    this.checkAvailability = function () {
        if (window.File && window.FileList && window.FileReader)
            return true;
        return false;
    };
    // input one file per time
    this.handleFiles = function (files) {
        if (_this.checkAvailability()) {
            if (window.FileReader && window.localStorage) {
                var file = files[0];
                const affix = file.name.split(/\./).pop().toLowerCase();
                if (affix != "pddl" && affix != "txt") {
                    alert("Not supported file format, please upload '.pddl' or '.txt' files.")
                    return false;
                }
                var reader = new FileReader();
                reader.addEventListener('load', function () {
                    _this.container.push(reader.result);
                });
                reader.readAsText(file, 'UTF-8');
                return true;
            }
        }
        alert("File reading not supported by browser! Please check the browser security settings!")
        return false;
    };
    this.get_container = function () {
        return _this.container;
    };
});

(function init($) {
    let fd = new FileDropper();
    $(".btn__start").click(function () {
        $(".ui.modal").modal({
            closable: false,
            inverted: true,
            onDeny: function () {
                // clear uploaded files
                localStorage.removeItem('file_container');
                $('.file_zone > .fa-check-circle-o').addClass('invisible');
                return false;
            },
            onApprove: function () {
                // retrieve file content
                localStorage.removeItem('file_container');
                localStorage.setItem('file_container', JSON.stringify(fd.get_container()));
                var array = localStorage.getItem('file_container');
                console.log(array);
                window.location.href = './canvas';
            }
        }).modal('show');
    });
    $(".modal > .btn__close").click(function () {
        $(".ui.modal").modal('hide');
    });

    // Add click event handler to button
    $('.file_zone').each(function () {
        var _this = $(this);
        var input = _this.children("input:first-child");
        var _input = document.querySelector("#" + input.attr("id"));
        _input.addEventListener("change", function () {
            var result = fd.handleFiles(this.files);
            if (result == true) {
                _this.children(".fa-check-circle-o.invisible").removeClass("invisible");
            }
        }, false);
    });
})(jQuery);