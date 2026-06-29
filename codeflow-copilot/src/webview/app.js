const vscode = acquireVsCodeApi();

document
.getElementById("explain")
.addEventListener("click",()=>{

const error=document
.getElementById("error")
.value;

vscode.postMessage({

command:"explain",

text:error

});

});

window.addEventListener("message",(event)=>{

document.getElementById("output").innerText=
event.data;

});