const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;


//options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoScroll = () =>{

    //new message element
    const $newMessage = $messages.lastElementChild

    //height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight =  $messages.offsetHeight

    //height of  message container
    const contianerHeight = $messages.scrollHeight

    //how far have i scrolled
    const scrollOffSet = $messages.scrollTop + visibleHeight

    if(contianerHeight-newMessageHeight <= scrollOffSet){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username : message.username.charAt(0).toUpperCase() + message.username.slice(1),
    message:message.text,
    createdAt:moment(message.createdAt).format('hh:mm a')
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll()
});

socket.on("locationMessage", (message) => {
  console.log(message);
  const html = Mustache.render(locationTemplate, {
    username : message.username.charAt(0).toUpperCase() + message.username.slice(1),
    url:message.url,
    createdAt:moment(message.createdAt).format('hh:mm a')
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll()
 
});

socket.on("roomData", ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
     room,
     users
    });
    document.querySelector('#sidebar').innerHTML =html;
   
  });

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");

  const userMessage = e.target.elements.userMessage.value;
  socket.emit("sendMessage", userMessage, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("Message Delivered");
  });
});



$sendLocationButton.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported ny your browser");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    socket.emit("sendLocation", { latitude, longitude }, (error) => {
      if (error) {
        return console.log(error);
      }
      $sendLocationButton.removeAttribute("disabled");
      console.log("Location Shared!");
    });
  });
});

socket.emit('join',{username,room},(error) => {
    if(error){
        alert(error)
        location.href ='/'
    }
  })