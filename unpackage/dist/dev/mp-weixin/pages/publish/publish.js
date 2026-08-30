"use strict";
const common_vendor = require("../../common/vendor.js");
const store_content = require("../../store/content.js");
const _sfc_main = {
  data() {
    return {
      text: "",
      images: [],
      voice: { path: "", duration: 0 },
      location: null,
      recording: false,
      recordSeconds: 0,
      recordTimer: null,
      recorder: null,
      innerAudio: null
    };
  },
  onLoad() {
    this.initRecorder();
    try {
      this.contentStore = store_content.useContentStore();
      this.contentStore.init();
    } catch (e) {
      common_vendor.index.__f__("error", "at pages/publish/publish.vue:99", "contentStore init failed", e);
    }
  },
  onUnload() {
    clearInterval(this.recordTimer);
    if (this.recorder && this.recording) {
      this.recorder.stop();
    }
    if (this.innerAudio) {
      this.innerAudio.destroy();
    }
  },
  methods: {
    initRecorder() {
      if (this.recorder)
        return;
      this.recorder = common_vendor.index.getRecorderManager();
      this.recorder.onStart(() => {
        this.recording = true;
        this.recordSeconds = 0;
        this.recordTimer = setInterval(() => {
          this.recordSeconds++;
          if (this.recordSeconds >= 60)
            this.stopRecord();
        }, 1e3);
      });
      this.recorder.onStop((res) => {
        this.recording = false;
        clearInterval(this.recordTimer);
        if (!res || !res.tempFilePath) {
          common_vendor.index.showToast({ title: "录音失败，请重试", icon: "none" });
          return;
        }
        const duration = Math.max(1, Math.round(this.recordSeconds));
        this.voice = { path: res.tempFilePath, duration: duration > 60 ? 60 : duration };
      });
      this.recorder.onError((err) => {
        this.recording = false;
        clearInterval(this.recordTimer);
        if (err && err.errMsg && err.errMsg.indexOf("auth") > -1) {
          common_vendor.index.showModal({
            title: "需要麦克风权限",
            content: "录音功能需要麦克风权限，请在设置中开启",
            confirmText: "去设置",
            success: (r) => {
              if (r.confirm)
                common_vendor.index.openSetting();
            }
          });
        } else {
          common_vendor.index.showToast({ title: "录音失败，请重试", icon: "none" });
        }
      });
    },
    chooseImage() {
      const rest = 9 - this.images.length;
      if (rest <= 0)
        return;
      common_vendor.index.chooseImage({
        count: rest,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.images = this.images.concat(res.tempFilePaths).slice(0, 9);
        }
      });
    },
    preview(index) {
      common_vendor.index.previewImage({
        current: index,
        urls: this.images
      });
    },
    removeImage(i) {
      this.images.splice(i, 1);
    },
    startRecord() {
      if (this.recording)
        return;
      this.initRecorder();
      common_vendor.index.getSetting({
        success: (res) => {
          const auth = res.authSetting["scope.record"];
          if (auth === true) {
            this.recorder.start({ duration: 6e4, format: "aac" });
          } else if (auth === void 0) {
            common_vendor.index.authorize({
              scope: "scope.record",
              success: () => {
                common_vendor.index.showToast({ title: "麦克风已开启，请再次按住录音", icon: "none" });
              },
              fail: () => {
                common_vendor.index.showToast({ title: "已拒绝录音权限", icon: "none" });
              }
            });
          } else {
            common_vendor.index.showModal({
              title: "需要麦克风权限",
              content: "录音功能需要麦克风权限，请在设置中开启",
              confirmText: "去设置",
              success: (r) => {
                if (r.confirm)
                  common_vendor.index.openSetting();
              }
            });
          }
        },
        fail: () => {
          this.recorder.start({ duration: 6e4, format: "aac" });
        }
      });
    },
    stopRecord() {
      if (!this.recording || !this.recorder)
        return;
      this.recorder.stop();
    },
    playVoice() {
      if (!this.voice.path)
        return;
      if (!this.innerAudio) {
        this.innerAudio = common_vendor.index.createInnerAudioContext();
      }
      this.innerAudio.src = this.voice.path;
      this.innerAudio.play();
    },
    chooseLocation() {
      common_vendor.index.chooseLocation({
        success: (res) => {
          this.location = {
            name: res.name || "所选位置",
            address: res.address || "",
            lat: res.latitude,
            lng: res.longitude
          };
        },
        fail: (err) => {
          if (err && err.errMsg && err.errMsg.indexOf("cancel") > -1) {
            return;
          }
          common_vendor.index.showToast({ title: "未能打开地图选点，请检查定位权限", icon: "none" });
        }
      });
    },
    submit() {
      if (!this.text.trim() && !this.images.length && !this.voice.duration) {
        common_vendor.index.showToast({ title: "写点什么吧", icon: "none" });
        return;
      }
      this.contentStore.publish({
        text: this.text.trim(),
        images: this.images,
        voice: this.voice,
        location: this.location
      });
      common_vendor.index.showToast({ title: "已呈上，待掌柜审核", icon: "none" });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 1200);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.text,
    b: common_vendor.o(($event) => $data.text = $event.detail.value, "d0"),
    c: common_vendor.t($data.text.length),
    d: common_vendor.f($data.images, (img, i, i0) => {
      return {
        a: img,
        b: common_vendor.o(($event) => $options.preview(i), i),
        c: common_vendor.o(($event) => $options.removeImage(i), i),
        d: i
      };
    }),
    e: $data.images.length < 9
  }, $data.images.length < 9 ? {
    f: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args), "1b")
  } : {}, {
    g: $data.recording ? 1 : "",
    h: $data.recording ? 1 : "",
    i: $data.recording ? 1 : "",
    j: common_vendor.t($data.recording ? "松开结束 · " + $data.recordSeconds + "″" : $data.voice.duration ? "已录制 " + $data.voice.duration + "″（点击下方可重录）" : "按住说话，松手完成"),
    k: $data.recording ? 1 : "",
    l: common_vendor.o((...args) => $options.startRecord && $options.startRecord(...args), "1b"),
    m: common_vendor.o((...args) => $options.stopRecord && $options.stopRecord(...args), "f9"),
    n: common_vendor.o((...args) => $options.stopRecord && $options.stopRecord(...args), "6f"),
    o: $data.voice.duration
  }, $data.voice.duration ? {
    p: common_vendor.o((...args) => $options.playVoice && $options.playVoice(...args), "cf"),
    q: common_vendor.o(($event) => $data.voice = {
      path: "",
      duration: 0
    }, "42")
  } : {}, {
    r: common_vendor.t($data.location ? $data.location.name : "添加所在书市位置"),
    s: common_vendor.o((...args) => $options.chooseLocation && $options.chooseLocation(...args), "13"),
    t: common_vendor.o((...args) => $options.submit && $options.submit(...args), "1c")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-bfce3555"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/publish/publish.js.map
