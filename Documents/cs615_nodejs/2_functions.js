function sayHi(){
    console.log('Hi');
  }
  sayHi();
  
  var sayBye = function(){
    console.log('Bye');
  }
  sayBye();
  
  function callFunction(fun){
    fun();
  }
  callFunction(sayBye);
  