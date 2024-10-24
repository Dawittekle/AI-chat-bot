const inputMessage=document.querySelector('.input-message');
const chatBotBody=document.querySelector('.chatbot-body');
const sendMessage=document.querySelector('#send-message');
const fileInput=document.querySelector('#file-input');
const fileWrapper=document.querySelector('.file-upload-wrapper');
const cancelFile = document.querySelector('#cancel-file');



//setup API

const API_KEY="AIzaSyAsjy8-Rq7eW4l0Kba-Syfznpb48EBfuYU";

const API_URL=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;



const userData={
    message:null,
    file:{
        data:null,
        mime_type:null
    }
}


const chatHistory=[];


const creatMessageElement=(content,...classes)=>{
    const div = document.createElement('div');
    div.innerHTML=content;
    div.classList.add("message",...classes);
    return div;
}

//handling the message

const handleOutgoingMessage=(e)=>{
    e.preventDefault();

    userData.message=inputMessage.value.trim();
    inputMessage.value='';
    fileWrapper.classList.remove('file-upload-img');

    
    const messageContent=`<div class="message-text"></div>
                           ${userData.file.data ?` <img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment">`: ``}`;
    const outgoingDiv=creatMessageElement(messageContent,"user-message");
    outgoingDiv.querySelector('.message-text').textContent=userData.message;
    chatBotBody.appendChild(outgoingDiv);
    chatBotBody.scrollTo({top:chatBotBody.scrollHeight,behavior:"smooth"})

    


    setTimeout(()=>{

    const messageContent=` <img src="images/chatbot_icon.svg" class="chatbot-img">
                <div class="message-text ">
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>`
    const incomingDiv=creatMessageElement(messageContent,"bot-message","thinking");
    chatBotBody.appendChild(incomingDiv);
    chatBotBody.scrollTo({top:chatBotBody.scrollHeight,behavior:"smooth"})




    generateBotResponse(incomingDiv);

    },600)



}

//generate bot response by API
const generateBotResponse = async(incomingDiv)=>{
   const messageElement =incomingDiv.querySelector('.message-text');
//adding user tect to chat history
   chatHistory.push(
    {
        role:"user",
        parts:[{text:userData.message},...(userData.file.data ? [{inline_data : userData.file}]: [])]}
   )

    const requestOption ={
        method: "POST",
        Headers:{"Content-Type": "application/json" },
        body: JSON.stringify({
            contents:chatHistory
        })
    }

    try{
        const response = await fetch(API_URL,requestOption)
        const data  = await response.json();
        if(!response.ok) throw new Error(data.error.message)
        const apiResponse = data.candidates[0].content.parts[0].text.replace(/\s+/g, ' ')
        .replace(/\n|\r/g, '')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .replace(/[^a-zA-Z0-9.,!? ]/g, '') 
        .trim().trim();
        messageElement.innerText = apiResponse;
//adding bot response to chathistory
        chatHistory.push(
            {
                role:"model",
                parts:[{text:apiResponse}]}
           )
   
    }catch(error)
    {
        userData.file={};
        messageElement.innerText = error.message;
        messageElement.style.color="#ff0000";
    }finally{
        incomingDiv.classList.remove('thinking');
        chatBotBody.scrollTo({top:chatBotBody.scrollHeight,behavior:"smooth"})

    }

}

inputMessage.addEventListener('keydown',(e)=>{
    const userText=e.target.value.trim();
    if(e.key==='Enter'&&userText){
        handleOutgoingMessage(e);
    }
})

sendMessage.addEventListener('click',(e)=>{
    handleOutgoingMessage(e)
})

fileInput.addEventListener('change',()=>{

    const file = fileInput.files[0];
    if(!file) return;
    const reader =new FileReader();

    reader.onload = (e) => {
        fileWrapper.querySelector('.uploaded-img').src=e.target.result;
        fileWrapper.classList.add("file-upload-img");
        const base64String=e.target.result.split(",")[1];

        //store the input 
        userData.file={
            data:base64String,
            mime_type:file.type
        }

        fileInput.value="";
        

    }

    reader.readAsDataURL(file);

})

//initializing the Emojji
/*
const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none"
});

document.querySelector('.chatbot-form').appendChild(picker);*/



//cancel the uploaded file
cancelFile.addEventListener('click',()=>{
    userData.file={};
    fileWrapper.classList.remove('file-upload-img');
})

document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());

