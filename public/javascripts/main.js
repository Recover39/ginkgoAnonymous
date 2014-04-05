var pageWriteFunction = (function () {
    var card = {
        addEvent: function () {
            var writeArea = document.getElementById('postTextArea'),
                writeButton = document.getElementById('writeButton');
            writeArea.addEventListener("click", util.writeSectionExpand, true);
        }
    };

    var comment = {
        write: function (e) {
            e.preventDefault();

            var curForm = e.currentTarget.form,
                appendTarget = curForm.parentNode.firstChild,
                sendFormData = new FormData(curForm),
                cardId = curForm[0].value,
            //curForm[1] => card_id
                url = "/card/" + cardId + "/comment/add",
                request = new XMLHttpRequest();

            if (curForm[1].value === "") {
                return;
            }

            request.open("POST", url, true);
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200) {
                    var res = JSON.parse(request.responseText),
                        commentFragment = document.createDocumentFragment(),
                        commentDiv = document.createElement('div');

                    commentDiv.className = "comment";
                    commentDiv.innerHTML = res.commentBody;
                    commentFragment.appendChild(commentDiv);

                    appendTarget.appendChild(commentFragment);

                    // change commentCount

                    var likeCountPattern = /\d+/, // regExp that find all digits
                        likeSection = curForm.parentNode.parentNode.childNodes[2].childNodes[0],
                        likeCountText = likeSection.innerText,
                        likeCountNum = likeCountPattern.exec(likeCountText);
                    likeCountNum = Number(likeCountNum); // change String type result to Number type
                    likeCountNum++; // increase comment Number

                    (function () {
                        likeSection.innerHTML = "댓글 " + likeCountNum + "개";
                    })();

                }
            };

            request.send(sendFormData);
            //curForm[0] => textField
            curForm[1].value = "";
        },

        addEvent: function () {
            var commentSection = document.getElementsByClassName("commentBody"),
                commentButton = document.getElementsByClassName("commentButton"),
                commentNum = commentSection.length;

            for (var i = 0; i < commentNum; i++) {
                commentSection[i].addEventListener("click", util.writeSectionExpand, true);
                commentButton[i].addEventListener("click", comment.write, true);
            }
        }
    };

    var util = {
        writeSectionExpand: function (e) {
            var curTextArea = e.toElement;
            curTextArea.oninput = function () {
                curTextArea.style.height = "";
                curTextArea.style.height = Math.min(curTextArea.scrollHeight, 100) + "px";
            };
        }
    };

    return {
        cardEventAdd: card.addEvent,
        commentEventAdd: comment.addEvent
    };
})();

var pageFunction = (function () {
    var load = {
        toMain: function () {
            window.location.reload();
            window.location = "/";
        }
    };

    var cardInfo = {
        showCardCommitTime: function () {
            var cardInfoDiv = $(".cardInfomation"),
                cardNum = cardInfoDiv.length,
                curTime = Date.now(),
                ms24Hour = 86400000;

            for (var i = 0; i < cardNum; i++) {
                var commitTime = cardInfoDiv[i].childNodes[1].innerText,
                    elapsedTime = (ms24Hour - (curTime - commitTime)) / 1000,
                    elapsedHours = Math.floor(((elapsedTime % 31536000) % 86400) / 3600),
                    elapsedMinutes = Math.floor((((elapsedTime % 31536000) % 86400) % 3600) / 60);

                //later, add color to Time
                cardInfoDiv[i].childNodes[1].innerHTML = "삭제까지 " + elapsedHours + "시간 " + elapsedMinutes + "분 남음";
            }
        },

        deleteCard: function (card_id) {
            $.ajax({
                type: "POST",
                url: "/card/" + card_id + "/delete"
            });
        }
    };

    (function () {
        cardInfo.showCardCommitTime();
    })();

    return {
        checkNewCard: load.checkNewCard,
        hideButton: load.hideButton,
        newCard: load.newCard,
        toMain: load.toMain
    }
})();

(function () {
    pageWriteFunction.cardEventAdd();
    pageWriteFunction.commentEventAdd();
})();

var newCard = pageFunction.newCard;
var toMain = pageFunction.toMain;