var formMethod = (function() {
    var psField = document.getElementsByClassName('form-control')[1],
        psReField = document.getElementsByClassName('form-control')[2],
        button = document.getElementsByClassName('signUp')[0];
        
    var validPassword = function() {
        if(psReField.value !== psField.value) {
            button.style.backgroundColor = "#f67373";
            button.style.borderColor = "#f67373";
            psReField.type = "text";
            psReField.value = "비밀번호를 다시 입력해주세요";
            psReField.color = "#999C9F";         
        }
        else {
            button.style.backgroundColor = "#428BCA";
            button.style.borderColor = "#428BCA";            
        }
    };
    
    var restorePsField = function() {
        psReField.type = "password";
        psReField.value = "";  
    };
    
    (function() {
       psReField.addEventListener("click",restorePsField,true); 
    })();
    
    return {
        validPassword : validPassword,
        hello : "hello" 
    };
}());

var validPassword = formMethod.validPassword;