setTimeout(() => {
    console.log('3 seconds have passed');
  }, 3000);
  var time = 0;
var timer = setInterval(() => {
  time += 2;
  console.log(time + ' seconds have passed!');
  if (time > 5){
    clearInterval(timer);
  }
}, 2000);
console.log(__dirname);
console.log(__filename);
