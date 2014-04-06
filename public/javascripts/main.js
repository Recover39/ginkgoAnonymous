var pageWriteFunction = (function () {
    var card = {
        addEvent: function () {
            var writeArea = document.getElementById('postTextArea'),
                writeButton = document.getElementById('writeButton');
            if (writeArea) {
                writeArea.addEventListener("click", util.writeSectionExpand, true);
            }
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

                    if (res.isAdmin === true) {
                        commentDiv.style.color = "#E85247";
                    }
                    else if (res.userSame === true) {
                        commentDiv.style.color = "#5C81E8";
                    }

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
        },

        toMain: function () {
            window.location.reload();
            window.location = "/";
        }
    };

    return {
        cardEventAdd: card.addEvent,
        commentEventAdd: comment.addEvent,
        toMain: util.toMain
    };
})();

var pageFunction = (function () {
    var load = {
        socket: io.connect('http://www.skkuleaf.com'),
        checkNewCard: function () {
            load.socket.on('newCard', load.showButton);
        },
        showButton: function () {
            $("#newCardButton").css("display", "block");
        },
        hideButton: function () {
            $("#newCardButton").css("display", "none");
        },
        newCard: function () {
            window.location.reload();
            load.hideButton();
            window.location = "/";
        },
        preventShowButton: function (socket) {
            load.socket.disconnect();
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
        toggleComment: function (e) {
            var cardComment = e.target.parentNode.parentNode.childNodes[3];
            console.log(cardComment);
            if (cardComment.style.display === 'none') {
                cardComment.style.display = 'block';
            }
            else {
                cardComment.style.display = 'none';
            }
        },
        addToggleComment: function () {
            var commentNumSection = $(".commitCount");
            commentNumSection.click(cardInfo.toggleComment);
            var commentSection = $(".cardComment");
            commentSection.css("display", 'none');
        }
    };

    (function () {
        cardInfo.showCardCommitTime();
        cardInfo.addToggleComment();
        load.checkNewCard();
    })();

    return {
        hideButton: load.hideButton,
        newCard: load.newCard,
        preventShowButton: load.preventShowButton
    }
})();

(function () {
    pageWriteFunction.cardEventAdd();
    pageWriteFunction.commentEventAdd();
})();

var newCard = pageFunction.newCard;
var preventShowButton = pageFunction.preventShowButton;
var toMain = pageWriteFunction.toMain;

