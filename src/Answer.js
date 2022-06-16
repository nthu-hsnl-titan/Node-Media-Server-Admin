import React, { Component } from 'react';

import axios from 'axios';
import $ from 'jquery';
import { Modal, Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

class Answer extends Component {
  state = {
    sid: '0', //student ID
    eid: null, // exam ID
    qid: 0, // question ID
    qarr: [], // question image array
    sta: null, // null: display current time, 'W': display time wait for exam, 'E': examing, display duration.
    blurTimes: 2,
    duration: null,
    examDate: null,
    waitTime: null,
    min2ms: 60000, // minutes to ms
    s2ms: 1000, // second to ms
    host: 'http://3.38.144.35:5000',
    LoginVisible: false,
    WarnVisible: false,
    WarnModalVisible: false,
    confirmVisible: false,
    qimgs: (
      <div>
        <img
          src={require('./assets/Black_flag.svg.png')}
          className="d-block w-100"
          style={{ maxWidth: '1280px', maxHeight: '640px', alignSelf: 'center' }}
          alt="..."
        ></img>
      </div>
    ),
  };

  // onFocus = () => {
  //   console.log("Tab is in focus");
  // };
  onBlur = () => {
    if (this.state.sta === "E") {
      this.state.blurTimes--;
  
      if (this.state.blurTimes < 0) {
        this.state.sta = 'Q';
        alert("Exam qualification is canceled!");
      }
      else {
        alert("Warning: What are you doing?");
      }
    }
  };

  componentDidMount() {
    // window.addEventListener("focus", this.onFocus);
    window.addEventListener("blur", this.onBlur);

    var self = this;
    document.getElementById('addbut').onclick = () => {
      var students = ['110065511', '110062558', '106062242']; //, '110062558', '110062559']
      students.forEach((val, idx) => {
        axios
          .post(self.state.host + '/addData', {
            params: {
              sid: val, // student id
              eid: 2, // exam id
              duration: self.state.min2ms,
              date: new Date().getTime() + 0.1 * self.state.min2ms, // exam start times after now (in ms)
              update_at: new Date().getTime(),
            },
          })
          .catch(function (error) {
            console.log(error); // handle error
          });
      });
    };
    // $('#answer_group').hide();

    $('#sid').html(this.state.sid);

    setInterval(() => {
      var displayTime;
      if (this.state.sta === null) {
        displayTime = new Date().getTime() + 8 * 60 * this.state.min2ms;
        $('#dtime').html(
          '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-clock" viewBox="0 0 16 16">' +
            '<path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>' +
            '<path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>' +
            '</svg>' +
            '現在時間:' +
            '<span>' +
            this.convertMsToTime(displayTime, true) +
            '</span>'
        );
      } else if (this.state.sta === 'W') {
        displayTime = this.state.examDate - new Date().getTime();
        if (displayTime < 1000) {
          displayTime = 0;
          console.log('EXAM START!');
          //state = 'E';
          this.setState({ sta: 'E' });
          this.updateQuestionImg(this.state.eid);
          $('#answer_group').show();
        }
        $('#dtime').html(
          '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-clock" viewBox="0 0 16 16">' +
            '<path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>' +
            '<path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>' +
            '</svg>' +
            '距離考試時間:' +
            '<span>' +
            this.convertMsToTime(displayTime, false) +
            '</span>'
        );
      } else if (this.state.sta === 'E') {
        displayTime =
          this.state.examDate + this.state.duration - new Date().getTime();
        if (displayTime < 1000) {
          displayTime = 0;
          this.submitAnswer();
        }
        $('#dtime').html(
          '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-clock" viewBox="0 0 16 16">' +
            '<path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>' +
            '<path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>' +
            '</svg>' +
            '剩餘考試時間:' +
            '<span>' +
            this.convertMsToTime(displayTime, false) +
            '</span>'
        );
      } else if (this.state.sta === 'Q') {
        $('#dtime').html('考試結束');
      }
    }, 1000);

    var modalConfirm = function (callback) {
      $('#btn-confirm').on('click', function () {
        // $('#mi-modal').modal('show');
        self.setState({ confirmVisible: true });
      });

      $('#modal-btn-si').on('click', function () {
        callback(true);
        //$('#mi-modal').modal('hide');
        self.setState({ confirmVisible: false });
      });

      $('#modal-btn-no').on('click', function () {
        callback(false);
        //$('#mi-modal').modal('hide');
        self.setState({ confirmVisible: false });
      });
    };
    modalConfirm(function (confirm) {
      if (confirm) {
        //Acciones si el usuario confirma
        console.log('confirm');
      } else {
        //Acciones si el usuario no confirma
        console.log('close');
      }
    });
  }
  updateQuestionImg = (eid) => {
    var self = this;
    axios
      .get(self.state.host + '/getQuestionImg', {
        params: {
          eid: eid,
        },
      })
      .then(function (res) {
        var images = res.data;
        var carousel_items = [];

        self.setState({ qarr: [] });
        for (let i = 0; i < Object.keys(images).length; i++) {
          const element = images[i];
          self.state.qarr.push({
            idx: i,
            answer: [false, false, false, false],
          });
          var carousel_item = (
            <div key={i}>
              <img
                src={element}
                className="d-block w-100 border border-primary"
                alt="..."
                style={{ maxWidth: '1280px', maxHeight: '640px' }}
              ></img>
            </div>
          );
          carousel_items.push(carousel_item);
        }
        self.setState({ qid: 0 });
        self.setState({ qimgs: carousel_items });

        // document.getElementById('carouselImg').innerHTML = carousel_items;
      })
      .catch(function (error) {
        console.log(error); // handle error
      });
  };
  updateSid = () => {
    var new_sid = $('#sidText').val();
    this.setState({ sid: new_sid });
    var self = this;
    axios
      .get(self.state.host + '/getExamBYsid', {
        params: {
          sid: new_sid,
        },
      })
      .then(function (res) {
        let found = false;
        if (res.data == null) {
          console.log('No next exam!');
          self.setState({ WarnVisible: true });
          return;
        }
        // sort the data by exam start date, pick the latest one.
        var sorted_data = res.data.Items.sort((a, b) => {
          return a['date'] - b['date'];
        });

        for (let i = 0; i < sorted_data.length; i++) {
          // if answered, next
          if (sorted_data[i].hasOwnProperty('answer')) continue;
          if (sorted_data[i]['date'] > new Date().getTime()) {
            // if current time is before exam start
            self.setState({
              eid: sorted_data[i]['eid'],
              duration: sorted_data[i]['duration'],
              examDate: sorted_data[i]['date'],
              sta: 'W',
            });
            found = true;
            break;
          } else if (
            sorted_data[i]['date'] + sorted_data[i]['duration'] >
            new Date().getTime()
          ) {
            // if current time is during exam.
            self.setState({
              eid: sorted_data[i]['eid'],
              duration: sorted_data[i]['duration'],
              examDate: sorted_data[i]['date'],
              sta: 'E',
            });
            self.updateQuestionImg(self.state.eid);
            $('#answer_group').show();
            found = true;
            break;
          }
        }
        if (found === true) {
          $('#loginbut').html(
            'StudentID:' +
              '<span className="badge text-bg-secondary" id="sid"></span>'
          );
          $('#sid').html(self.state.sid); // change sid text to sid
          self.setState({ WarnVisible: false });
          self.hideLoginVisible();

          self.props.sendSID(self.state.sid);

        } else {
          console.log('No next exam!');
          self.setState({ WarnVisible: true });
        }
      })
      .catch(function (error) {
        console.log(error); // handle error
        return;
      });
  };
  padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }
  convertMsToTime(milliseconds, showcur = false) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    seconds = seconds % 60;
    minutes = minutes % 60;
    if (showcur) hours %= 24;
    return `${this.padTo2Digits(hours)}:${this.padTo2Digits(
      minutes
    )}:${this.padTo2Digits(seconds)}`;
  }
  checkAnswer = (event) => {
    let self = this;
    for (let i = 0; i < 4; i++) {
      if (self.state.qarr.length > 0) {
        let tmp = self.state.qarr;
        tmp[self.state.qid]['answer'][i] = document.getElementById(
          'flexCheck' + i
        ).checked;
        self.setState({ qarr: tmp });
      }
    }
  };

  submitAnswer = () => {
    if (this.state.sta === 'E') {
      console.log('EXAM END!');
      this.setState({ sta: 'Q' });
      axios
        .post(this.state.host + '/updateData', {
          params: {
            sid: this.state.sid, // student id
            eid: this.state.eid, // exam id
            update_at: new Date().getTime(),
            answer: this.state.qarr,
          },
        })
        .catch(function (error) {
          console.log(error); // handle error
        });
    } else {
      // $('#warn1-modal').modal('show');
      this.showWarnModalVisible();
    }
    this.hideconfirmVisible();
  };
  showLoginVisible = () => {
    this.setState({ LoginVisible: true });
  };
  hideLoginVisible = () => {
    this.setState({ LoginVisible: false });
  };
  showWarnModalVisible = () => {
    this.setState({ WarnModalVisible: true });
  };
  hideWarnModalVisible = () => {
    this.setState({ WarnModalVisible: false });
  };
  showconfirmVisiblee = () => {
    this.setState({ confirmVisible: true });
  };
  hideconfirmVisible = () => {
    this.setState({ confirmVisible: false });
  };
  changeSlide = (currentSlide) => {
    this.setState({ qid: currentSlide });
    for (let i = 0; i < 4; i++) {
      if (this.state.qarr.length > 0) {
        document.getElementById('flexCheck' + i).checked =
          this.state.qarr[currentSlide]['answer'][i];
      }
    }
  };
  render() {
    const SampleNextArrow = (props) => {
      const { className, style, onClick } = props;
      return (
        <div>
          <RightOutlined
            className={className}
            style={{
              ...style,
              color: 'black',
              fontSize: '15px',
              lineHeight: '1.5715',
            }}
            onClick={onClick}
          />
        </div>
      );
    };

    const SamplePrevArrow = (props) => {
      const { className, style, onClick } = props;
      return (
        <div>
          <LeftOutlined
            className={className}
            style={{
              ...style,
              color: 'black',
              fontSize: '15px',
              lineHeight: '1.5715',
            }}
            onClick={onClick}
          />
        </div>
      );
    };
    const settings = {
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
    };
    return (
      <div className="container">
        <div className="row justify-content-between">
          <button
            type="button"
            className="btn btn-primary col"
            id="addbut"
            style={{ maxWidth: '180px' }}
          >
            Add Exam
          </button>
          <button
            type="button"
            className="btn btn-primary col align-self-end"
            id="loginbut"
            onClick={this.showLoginVisible}
            style={{ maxWidth: '180px' }}
          >
            Login
            <span className="badge text-bg-secondary " id="sid">
              NULL
            </span>
          </button>
        </div>
        <div className="">
          <div className="row justify-content-start">
            <h3
              className=""
              style={{ textAlign: 'left', marginTop: '20px' }}
              id="dtime"
            >
              Time:
              <span></span>
            </h3>
          </div>
          <Carousel
            arrows
            {...settings}
            afterChange={this.changeSlide}
            id="carouselImg"
          >
            {this.state.qimgs}
          </Carousel>
        </div>

        <div id="answer_group">
          <div className="form justify-content-between">
            <div className="inputGroup col-3">
              <input
                name="flexCheck0"
                type="checkbox"
                value="0"
                id="flexCheck0"
                onClick={this.checkAnswer}
              />
              <label htmlFor="flexCheck0">A</label>
            </div>
            <div className="inputGroup col-3">
              <input
                name="flexCheck1"
                type="checkbox"
                value="1"
                id="flexCheck1"
                onClick={this.checkAnswer}
              />
              <label htmlFor="flexCheck1">B</label>
            </div>
            <div className="inputGroup col-3">
              <input
                name="flexCheck2"
                type="checkbox"
                value="2"
                id="flexCheck2"
                onClick={this.checkAnswer}
              />
              <label htmlFor="flexCheck2">C</label>
            </div>

            <div className="inputGroup col-3">
              <input
                name="flexCheck3"
                type="checkbox"
                value="3"
                id="flexCheck3"
                onClick={this.checkAnswer}
              />
              <label htmlFor="flexCheck3">D</label>
            </div>
          </div>
          <div className="row justify-content-end">
            <button type="button" className="btn btn-primary" id="btn-confirm">
              Submit
            </button>
          </div>
        </div>

        <Modal
          visible={this.state.LoginVisible}
          title="Please enter your student ID"
          onCancel={this.hideLoginVisible}
          onOk={this.updateSid}
        >
          <input
            id="sidText"
            type="text"
            className="form-control"
            placeholder="Student ID"
            aria-label="Student ID"
            aria-describedby="basic-addon2"
          ></input>
          {this.state.WarnVisible ? (
            <div id="warn_nodata" className="alert alert-danger" role="alert">
              沒有該學生考試資料!
            </div>
          ) : null}
        </Modal>
        <Modal
          visible={this.state.WarnModalVisible}
          title="Warning"
          onCancel={this.hideWarnModalVisible}
          onOk={this.hideWarnModalVisible}
        >
          無法提交!現在非考試時間內!
        </Modal>
        <Modal
          visible={this.state.confirmVisible}
          title="Answers submit"
          onCancel={this.hideconfirmVisible}
          onOk={this.submitAnswer}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="currentColor"
            className="bi bi-exclamation-triangle"
            viewBox="0 0 16 16"
          >
            <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z" />
            <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z" />
          </svg>
          Are you finished all questions?
        </Modal>
      </div>
    );
  }
}

export default Answer;
