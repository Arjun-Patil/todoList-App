
module.exports = getday;
function getday(){
let today = new Date();
let pattern = {
weekday: "long",
day: "numeric",
month: "long"
}
let day = today.toLocaleDateString("en-US", pattern);
return day;
}
