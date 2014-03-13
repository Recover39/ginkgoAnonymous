(function () {
    var card = {
        write: function (e) {
            e.preventDefault();

            var curForm = e.currentTarget.form,
                sendFormData = new FormData(curForm),
                url = "/writeNewCard",
                request = new XMLHttpRequest();

            request.open("POST", url, true);
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200) {
                }
            };
            //ajax가 동작하지 않더라도 request에서 formdata를 보내준다.       
            request.send(sendFormData);
            //ajax 통신이 끝난 후 폼의 값을 초기화 해준다.
            //curForm[0] => textField
            curForm[0].value = "";
        }
    };

    var reply = {
        write: function (e) {
            e.preventDefault();

            var curForm = e.currentTarget.form,
                sendFormData = new FromData(curForm),
                cardId = curForm[1].value,
                url = "/addComment/" + cardId,
                request = new XMLHttpRequest();

            request.open("POST", url, true);
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200) {

                }
            };

            request.send(sendFormData);
            curForm[1].value = "";
        }
    }
})();