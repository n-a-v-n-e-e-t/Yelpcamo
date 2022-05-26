// alert('connected');
const closeButton = document.querySelector('.close');
if(closeButton!=null){
    closeButton.addEventListener('click',function(event){
        closeButton.parentElement.parentElement.remove();
    });
}