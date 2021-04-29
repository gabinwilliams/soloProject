import React, {useState} from 'react'
import { useDispatch, useSelector } from "react-redux";
import './Messages.css';
import MessagesHeader from '../MessagesHeader/MessagesHeader';
import MessagesInput from '../MessagesInput/MessagesInput';

const Messages = () => {
  
  const [chat, setChat] = useState('');

  const chatPerson = useSelector((store) => store.chat);

  return (
    <div>
      <MessagesHeader />
      <div className="messageContainer">
        <div className="chatContainer">
          <div className="messageOne">
              
                <div className="message1Image"
                  style={{backgroundImage: `url(https://images.unsplash.com/photo-1600603405959-6d623e92445c?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mzl8fG1hbnxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60)`}}>
                </div>
                <p>Message1 This is the first messages and it is long</p>
              
          </div>

          <div className="messageTwo">
              <div>
                <p>message2</p>
              </div>
          </div>
        </div>
        
      </div>
      <MessagesInput chat={chat} setChat={setChat}/>
    </div>
  )
}

export default Messages