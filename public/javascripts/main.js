var pageWriteFunction = (function () {
    var card = {
        write: function (e) {
            e.preventDefault();

            var curForm = e.currentTarget.form,
                sendFormData = new FormData(curForm),
                url = "/card/add",
                request = new XMLHttpRequest();

            request.open("POST", url, true);
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200) {
                    var res = JSON.parse(request.responseText),
                        cardStart = getElementsByClassName("cardList")[0];

                }
            };
            //ajax가 동작하지 않더라도 request에서 formdata를 보내준다.
            request.send(sendFormData);
            //ajax 통신이 끝난 후 폼의 값을 초기화 해준다.
            //curForm[0] => textField
            curForm[0].value = "";

            window.location="/card";
        },

        addEvent : function() {
            var writeArea = document.getElementById('postTextArea'),
                writeButton = document.getElementById('writeButton');
            writeArea.addEventListener("click", util.writeSectionExpand, true);
            //writeButton.addEventListener("click", card.write, true);
        }
    };

    var comment = {
        write: function (e) {
            e.preventDefault();

            var curForm = e.currentTarget.form,
                sendFormData = new FromData(curForm),
                cardId = curForm[1].value,
                url = "/card/" + cardId + "/comment/add",
                request = new XMLHttpRequest();

            request.open("POST", url, true);
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200) {

                }
            };

            request.send(sendFormData);
            curForm[1].value = "";
        },

        addEvent : function () {
            var commentSection = document.getElementsByClassName("commentBody"),
                commentNum = commentSection.length;

            for (var i = 0; i < commentNum; i++) {
                commentSection[i].addEventListener("click", util.writeSectionExpand, true);
            }
        }
    };

    var util = {
        writeSectionExpand: function (e) {
            var curTextArea = e.toElement;
            curTextArea.oninput = function() {
                curTextArea.style.height = "";
                curTextArea.style.height = Math.min(curTextArea.scrollHeight, 100) + "px";
            };
        }
    };

    return {
        cardEventAdd : card.addEvent,
        commentEventAdd : comment.addEvent
    };
})();

(function() {
    pageWriteFunction.cardEventAdd();
    pageWriteFunction.commentEventAdd();
})();