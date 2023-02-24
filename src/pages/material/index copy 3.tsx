import React from "react";
class VideoDemo extends React.Component {
  constructor(prop: any) {
    super(prop);
    this.state = {
      recorder: null,
      stream: null,
      chunk: null,
      chunkURL: null,
    };
    this.recorder = null;
  }

  init() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(
      (stream) => {
        this.recorder = new window.MediaRecorder(stream);
        this.setState({
          stream: stream,
        });
      },
      (error) => {
        console.log("出错，请确保已允许浏览器获取音视频权限");
        console.log("error", error);
      }
    );
  }
  // 给record绑定事件的回调
  bindEvents() {
    this.recorder.ondataavailable = (e) => {
      this.setState({
        chunk: e.data,
      });
    };
    this.recorder.onstop = () => {
      let blob = new Blob([this.state.chunk], { type: "video/webm" });
      let videoStream = URL.createObjectURL(blob);
      this.setState({ chunkURL: videoStream });
      setTimeout(() => {
        console.log(this.state.chunkURL);
      }, 5000);
      this.refs.newvideo.play();
    };
  }
  // 点击开始
  clickStart() {
    this.onPreview();
    // this.onStart();
    this.bindEvents();
  }
  onPreview() {
    this.refs.video.srcObject = this.state.stream;
    this.refs.video.muted = true;
    this.refs.video.play();
  }
  onStart() {
    this.recorder.start();
  }
  clickEnd() {
    this.recorder.stop();
    this.refs.video.pause();
  }
  componentDidMount() {
    this.init();
  }

  render() {
    return (
      <div>
        {/* 这个video标签录制时看到实时画面使用 */}
        <video src="" ref="video" style={{ width: "100vw", height: "50vh" }}></video>
        <button onClick={this.clickStart.bind(this)}>开始</button>
        <button onClick={this.clickEnd.bind(this)}>停止</button>
        {this.state.chunkURL ? (
          <a href={this.state.chunkURL} download="test.webm">
            点击下载
          </a>
        ) : (
          ""
        )}
        {/* 这个video标签是录制完后把录制之后的数据处理为二进制流后进行展示使用 */}
        <video src={this.state.chunkURL} style={{ width: "100vw", height: "50vh" }} ref="newvideo"></video>
      </div>
    );
  }
}
export default VideoDemo;
