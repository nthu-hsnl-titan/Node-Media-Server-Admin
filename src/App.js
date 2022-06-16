import React, { Component } from 'react';
import { BrowserRouter as Router, Link, Route } from "react-router-dom";
import { Button, Icon, Layout, Menu } from 'antd';
import { createBrowserHistory } from 'history';
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import Streams from "./Streams";
import Answer from "./Answer";
import Invigilation from "./Invigilation";

import "./App.css"

import { Card, Table, Modal, Input } from "antd";
import { secondsToDhmsSimple } from "./Util";
import Flvplayer from "./Flvplayer";
import Cookies from 'universal-cookie';
import md5 from 'js-md5';


const { Header, Sider, Content, Footer } = Layout;

class App extends Component {

    fullTitle = "Invigilation";

    shortTitle = "NFT";

    state = {
        collapsed: false,
        title: this.fullTitle,
        pathname: "/"
    };

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
            title: this.state.collapsed ? this.fullTitle : this.shortTitle,
        });
    }

    componentWillReceiveProps(nextProps, nextContext) {
        console.log(nextProps, nextContext);
    }

    cookies = new Cookies();

  state = {
    streamsData: [],
    loading: false,
    visible: false,
    password: '',
    sid: "",
    // isInputSID: false,
    table: <div></div>
  };

  columns = [{
    title: 'Camera',
    dataIndex: 'Camera',
    key: 'Camera',
    render: (name, record) => {
        return <Flvplayer url={`/${record.app}/${record.name}.flv`} type="flv" width="100px" height="100px"/>;
    }
  }];

  componentDidMount() {
    this.setState({
      password: this.cookies.get('pass')
    })
  }

  updatePass = (e) => {
    let password = e.target.value;
    this.setState({
      password
    });
    this.cookies.set('pass', password, { path: '/', maxAge: 31536000 })
  }

//   updateSID = (e) => {
//     let sid = e.target.value;
//     this.setState({
//       sid
//     });
//     setIsInputSID(true);
//   }

  openVideo = (record) => {
    let sign = '';
    if (this.state.password) {
      let hash = md5.create();
      let ext = Date.now() + 30000;
      hash.update(`/${record.app}/${record.name}-${ext}-${this.state.password}`);
      let key = hash.hex();
      sign = `?sign=${ext}-${key}`;
    }
    this.videoModal = Modal.info({
      icon: null,
      title: "Video Player",
      width: 640,
      height: 480,
      content: <Flvplayer url={`/${record.app}/${record.name}.flv${sign}`} type="flv" />,
    });
  }

  receiveSID = (sid) => {
      this.setState({
        sid: sid
      });
      this.fetch();
  }

  fetch = () => {
    this.setState({ loading: true });
    fetch('/api/streams', {
      credentials: 'include'
    }).then(function (response) {
      return response.json();
    }).then((data) => {
      // Read total count from server
      let streamsData = [];
      let index = 0;
      for (let app in data) {
        for (let name in data[app]) {
            if (name == this.state.sid) {
                let stream = data[app][name].publisher;
                let clients = data[app][name].subscribers;
                if (stream) {
                  let now = new Date().getTime() / 1000;
                  let str = new Date(stream.connectCreated).getTime() / 1000;
                  let streamData = {
                    key: index++,
                    app,
                    name,
                    id: stream.clientId,
                    ip: stream.ip,
                    ac: stream.audio ? stream.audio.codec + " " + stream.audio.profile : "",
                    freq: stream.audio ? stream.audio.samplerate : "",
                    chan: stream.audio ? stream.audio.channels : "",
                    vc: stream.video ? stream.video.codec + " " + stream.video.profile : "",
                    size: stream.video ? stream.video.width + "x" + stream.video.height : "",
                    fps: stream.video ? Math.floor(stream.video.fps) : "",
                    time: secondsToDhmsSimple(now - str),
                    clients: clients.length
                  };
                  streamsData.push(streamData);
                }
            }
        }
      }
      this.setState({
        loading: false,
        streamsData,
      });
      this.setState({
        table: <Table
          dataSource={this.state.streamsData}
          columns={this.columns}
          loading={this.state.loading}
          bordered
          small
          pagination={false}
        />
      });
    }).catch(e => {
      this.setState({
        loading: false,
      });
    });
  }

    render() {
        return (
            <Router>
                <Layout style={{ minHeight: "100vh" }}>
                    <Sider
                        width={256}
                        trigger={null}
                        collapsible
                        collapsed={this.state.collapsed}>

                        <div className="logo"><h1>{this.state.title}</h1></div>

                        <Menu theme="dark" mode="inline"
                            defaultSelectedKeys={[createBrowserHistory().location.pathname]}
                        >
                            <Menu.Item key="/admin/">
                                <Link to="/admin/">
                                    <Icon type="dashboard" />
                                    <span>Dashboard</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="/admin/streams">
                                <Link to="/admin/streams">
                                    <Icon type="video-camera" />
                                    <span>Streams</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="/admin/invigilation">
                                <Link to="/admin/invigilation">
                                    <Icon type="video-camera" />
                                    <span>Invigilation</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="/admin/profile">
                                <Link to="/admin/profile">
                                    <Icon type="profile" />
                                    <span>Profile</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="/admin/answer">
                                <Link to="/admin/answer">
                                    <Icon type="profile" />
                                    <span>Answer</span>
                                </Link>
                            </Menu.Item>
                        </Menu>
                        <Card>
                            {/* <Input.Password
                                size="large"
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                style={{ marginBottom: "16px" }}
                                placeholder="input password"
                                onChange={this.updatePass}
                                value={this.state.password} /> */}
                            {/* <Input
                                size="large"
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                style={{ marginBottom: "16px" }}
                                placeholder="input studentID"
                                onChange={this.updateSID}
                                value={this.state.sid}
                                disabled={this.state.isInputSID} /> */}

                            { this.state.table }
                        </Card>
                    </Sider>
                    <Layout>
                        <Header style={{ background: '#fff', padding: 0 }}>
                            <Icon
                                className="trigger"
                                type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                                onClick={this.toggle}
                            />
                        </Header>
                        <Content style={{
                            margin: '24px 16px', minHeight: 280,
                        }}>
                            <Route exact path="/admin" component={Dashboard} />
                            <Route path="/admin/streams" component={Streams} />
                            <Route path="/admin/invigilation" component={Invigilation} />
                            <Route path="/admin/profile" component={Profile} />
                            <Route path="/admin/answer" render={() => <Answer sendSID = {this.receiveSID} />} />
                        </Content>
                        <Footer style={{ textAlign: 'center' }}>
                            Node-Media-Server ©2019 Created by <a href="http://nodemedia.cn" rel="noopener noreferrer" target="_blank">NodeMedia</a>.
                        </Footer>
                    </Layout>
                </Layout>


            </Router>
        );
    }

}

export default App;
