// chat client

var socket = io.connect('http://www.skkuleaf.com');

(function () {
    $(document).ready(function () {
        // connect to randomChat
        socket.on('randomChatConnected', function () {
            console.log('randomChatPageConnected');
        });

        // start random chat
        $('#requestRandomChat').click(function () {
            $('#requestRandomChat').hide();
            $('#cancelRequest').show();
            socket.emit('requestRandomChat');
            console.log('requestRanChat');
        });

        // cancel request
        $('#cancelRequest').click(function () {
            $('#requestRandomChat').show();
            $('#cancelRequest').hide();
            socket.emit('cancelRequest');
        });

        // matching complete
        socket.on('completeMatch', function () {
            $('#sendChat').show();
            $('#inputText').css("width", "82%");
            document.getElementById('inputText').style.borderBottomRightRadius = "0";
            $('#cancelRequest').hide();
            $('#requestDisconnect').show();
            document.getElementById('chatField').innerHTML = '<span style = "color : #7ba8ca"> 채팅이 연결되었습니다 </span></br>';
        });

        $('#requestDisconnect').click(function () {
            $('#requestDisconnect').hide();
            $('#sendChat').hide();
            $('#requestRandomChat').show();
            $('#inputText').css("width", "100%");
            document.getElementById('inputText').style.borderBottomRightRadius = "6px";
            if (document.getElementById('chatField').innerHTML !== '' && document.getElementById('chatField').lastChild  !== '<span style = "color : #7ba8ca"> 채팅이 종료되었습니다. </span>') {
                $('#chatField').append('<span style = "color : #7ba8ca"> 채팅이 종료되었습니다. </span></br>');
            }
            socket.emit('disconnectChat');
        });

        socket.on('disconnectOther', function () {
            $('#requestDisconnect').hide();
            $('#sendChat').hide();
            $('#requestRandomChat').show();
            $('#inputText').css("width", "100%");
            document.getElementById('inputText').style.borderBottomRightRadius = "6px";
            if (document.getElementById('chatField').innerHTML !== '' && document.getElementById('chatField').lastChild  !== '<span style = "color : #7ba8ca"> 채팅이 종료되었습니다. </span>') {
                $('#chatField').append('<span style = "color : #7ba8ca"> 채팅이 종료되었습니다. </span></br>');
            }
        });

        // receiveMessage
        socket.on('receiveMessage', function (data) {
            $('#chatField').append('<span>' + data.message + '</span></br>');
            console.log('message come');
            var chatField = document.getElementById("chatField");
            chatField.scrollTop = chatField.scrollHeight;

        });

        // 상대방이 나갔을 때 나도 같이 로비로 나감.
        socket.on('disconnect', function () {
            if (document.getElementById('chatField').innerHTML !== '' && document.getElementById('chatField').lastChild !== '<span style = "color : #7ba8ca"> 채팅이 종료되었습니다. </span>') {
                $('#chatField').append('<span style = "color : #7ba8ca"> 채팅이 종료되었습니다. </span></br>');
            }
        });

        // 엔터입력 시
        $('#inputText').keyup(function (e) {
            if (e.keyCode == 13) {
                sendMessage();
            }
        });

        // 채팅 내용 전송 시
        $('#sendChat').click(function () {
            sendMessage();
        });

        var iscroll = new IScroll('#chatField', {
            mouseWheel: true
        });
    });
})();


var sendMessage = function () {
    var XSSfilter = function (content) {
        return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };

    var checkURL = function (string) {
        var URLregxp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

        var result = string.replace(URLregxp, '<a href="$1" target="_blank">$1</a>');

        return result;
    };

    var rowMessage = document.getElementById('inputText').value;

    var message = checkURL(XSSfilter(rowMessage));

    if (message === "" || message === null || message === undefined) {
        return;
    }
    else {
        socket.emit('sendMessage', {message: message});
    }
    document.getElementById('inputText').value = '';
};

var sendSystem = function () {

};

var pageWriteFunction = (function () {
    var util = {
        toMain: function () {
            window.location.reload();
            window.location = "/";
        }
    };

    return {
        toMain: util.toMain
    }
})();

var toMain = pageWriteFunction.toMain;
