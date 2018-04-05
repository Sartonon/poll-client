import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

class App extends Component {
  state = {
    messages: [],
    username: "",
    usernameConfirmed: false,
    message: "",
    color: 0,
  };

  async componentDidMount() {
    await this.getPastMessages();
    this.getMessages();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.usernameConfirmed && this.state.usernameConfirmed) {
      const objDiv = document.getElementById("chatwindow");
      if (objDiv) {
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    }
  }

  getPastMessages = async () => {
    const { data } = await axios.get("http://poll.sartonon.fi/api/messages");
    this.setState({ messages: data });
  };

  getId = () => {
    if (this.state.messages.length > 0) {
      console.log(this.state.messages);
      return this.state.messages[this.state.messages.length - 1].id;
    }

    return null;
  };

  getMessages = async () => {
    try {
      const { data } = await axios.get(`http://poll.sartonon.fi/api/messages?id=${this.getId()}`);
      this.handleMessage(data);
      console.log(data);
      setTimeout(() => {
        this.getMessages();
      }, 5000);
    } catch (err) {
      console.log("error: ", err);
    }
  };

  sendMessage = async (e) => {
    e.preventDefault();
    const { data } = await axios.post("http://poll.sartonon.fi/api/messages", {
      name: this.state.username,
      message: this.state.message,
      color: this.state.color,
    });
    console.log(data);
    this.setState({ message: "", messages: [ ...this.state.messages, data ] });
  };

  handleMessage = data => {
    this.setState({ messages: [ ...this.state.messages, ...data ] });
    setTimeout(() => {
      const objDiv = document.getElementById("chatwindow");
      if (objDiv) {
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    }, 200);
  };

  changeUsername = (e) => {
    this.setState({ username: e.target.value })
  };

  confirmUsername = () => {
    this.setState({
      usernameConfirmed: true,
      color: `rgb(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(255)})`,
    });
  };

  handleMessageChange = (e) => {
    this.setState({ message: e.target.value });
  };

  renderMessages = () => {
    return this.state.messages.map((message, i) => {
      return (
        <div className="Message-wrapper" key={i}>
          <div className="Message-block" key={i} style={{ float: message.name === this.state.username ? "right" : "left" }}>
            <div className="Message-name" style={{ color: message.color }}>{message.name}</div>
            <div className="Message-content">{message.message}</div>
          </div>
        </div>
      );
    });
  };

  render() {
    const { usernameConfirmed } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Chat</h1>
        </header>
        {!usernameConfirmed ?
          <div className="Login-div">
            <p style={{ fontWeight: "bold", fontSize: "16px" }}>Anna käyttäjänimi</p>
            <input className="Login-input" value={this.state.username} onChange={this.changeUsername} type="text" />
            <div className="Ok-button" onClick={this.confirmUsername}>Ok</div>
          </div> :
          <div className="Chat-window">
            <div id="chatwindow" className="Message-div">
              {this.renderMessages()}
            </div>
            <form onSubmit={this.sendMessage}>
              <div className="Chat-input">
                <input className="Chat-inputfield" onChange={this.handleMessageChange} value={this.state.message} type="text" />
                <div className="Send-button" onClick={this.sendMessage}>Lähetä</div>
              </div>
            </form>
          </div>
        }
      </div>
    );
  }
}

export default App;
