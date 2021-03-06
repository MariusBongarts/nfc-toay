<template>
  <div class="home">
    <button
      id="recButton"
      :class="recording ? 'Rec' : 'notRec'"
      @click="record"
    ></button>
    <button
      id="playButton"
      :class="playing ? 'Play' : 'notPlay'"
      @click="startAudio"
    ></button>
    <audio id="recordedAudio" ref="audioPlayer"></audio>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { FirebaseService } from '@/services/firebase.service';

// declare const MediaRecorder: any;
@Options({
  components: {},
})
export default class Home extends Vue {
  recording = false;
  playing = false;

  id = '1f023f05-8541-46d8-93a3-f07223df81f3';

  firebaseService = new FirebaseService();

  mediaRecorder!: MediaRecorder;
  player!: AudioBufferSourceNode;

  async startAudio() {
    if (!this.playing) {
      const base64 = await this.firebaseService.getBase64(this.id);
      const audioBuffer = await this.parseBase64ToAudioBuffer(base64);
      this.play(audioBuffer);
    }
    if (this.playing) {
      this.player.stop();
    }
    this.playing = !this.playing;
  }

  async record() {
    if (!this.recording) {
      await this.startRecording();
    }
    if (this.recording) {
      this.mediaRecorder.stop();
    }
    this.recording = !this.recording;
  }

  private async startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.start();
    const audioChunks: any[] = [];

    this.mediaRecorder.addEventListener('dataavailable', (event: any) => {
      audioChunks.push(event.data);
    });

    this.mediaRecorder.addEventListener('stop', async () => {
      const audioBlob = new Blob(audioChunks);
      const base64 = await this.parseAudioBlobToBase64(audioBlob);
      localStorage.base64 = base64;
      await this.firebaseService.saveBase64(this.id, base64);
    });
  }

  private async parseAudioBlobToBase64(audioBlob: Blob): Promise<string> {
    const reader = new window.FileReader();
    reader.readAsDataURL(audioBlob);
    return new Promise((res) => {
      reader.onloadend = () => {
        let base64 = reader.result + '';
        base64 = base64.split(',')[1];
        res(base64);
      };
    });
  }

  private async parseBase64ToAudioBuffer(base64: string): Promise<AudioBuffer> {
    const ab = new ArrayBuffer(base64.length);
    const buff = Buffer.from(base64, 'base64');
    const view = new Uint8Array(ab);
    for (let i = 0; i < buff.length; ++i) {
      view[i] = buff[i];
    }
    const context = new AudioContext();
    const buffer = await context.decodeAudioData(ab);
    return buffer;
  }

  private async play(audioBuffer: AudioBuffer) {
    const context = new AudioContext();
    this.player = context.createBufferSource();
    this.player.buffer = audioBuffer;
    this.player.connect(context.destination);
    this.player.start(0);
    this.player.onended = () => (this.playing = false);
  }
}
</script>

<style lang="scss">
#recButton,
#playButton {
  cursor: pointer;
  width: 90px;
  height: 90px;
  font-size: 0;
  border: 0;
  border-radius: 50%;
  margin: 40px;
  outline: none;
}
#recButton {
  background-color: red;
}
#playButton {
  background-color: #00a130;
}

.notRec {
  background-color: darkred;
}
.notPlay {
  background-color: #005319;
}

.Rec,
.Play {
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

.Rec {
  animation-name: pulse-rec;
}

.Play {
  animation-name: pulse-play;
}

@keyframes pulse-rec {
  0% {
    box-shadow: 0px 0px 5px 0px rgba(173, 0, 0, 0.3);
  }
  65% {
    box-shadow: 0px 0px 5px 13px rgba(173, 0, 0, 0.3);
  }
  90% {
    box-shadow: 0px 0px 5px 13px rgba(173, 0, 0, 0);
  }
}
@keyframes pulse-play {
  0% {
    box-shadow: 0px 0px 5px 0px #00661f;
  }
  65% {
    box-shadow: 0px 0px 5px 13px hsla(138, 100%, 21%, 0.308);
  }
  90% {
    box-shadow: 0px 0px 5px 13px hsla(138, 100%, 16%, 0.041);
  }
}
</style>
