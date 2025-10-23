let instance = null;

export default class AudioRecorderService {
  constructor(props) {
    if (instance) {
      return instance;
    }

    this.props = props || {};
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.recordingState = 'idle'; // 'idle', 'recording', 'finished'

    instance = this;
  }

  async startRecording() {
    if (this.recordingState === 'recording') {
      console.warn('La grabación ya está en progreso.');
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.addEventListener('dataavailable', event => {
        this.audioChunks.push(event.data);
      });

      this.mediaRecorder.start();
      this.recordingState = 'recording';
      console.log('Grabación iniciada.');
      return true; 
    } catch (error) {
      console.error('Error al iniciar la grabación:', error);
      alert('No se pudo iniciar la grabación. Asegúrate de haber concedido los permisos para el micrófono.');
      this.recordingState = 'idle';
      return false;
    }
  }

  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.recordingState !== 'recording') {
        console.warn('No hay ninguna grabación activa para detener.');
        resolve(null);
        return;
      }

      this.mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });

        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }

        this.recordingState = 'finished';
        console.log('Grabación detenida. Blob creado.');
        resolve(audioBlob);
      }, { once: true }); 

      this.mediaRecorder.stop();
    });
  }

  getState() {
    return this.recordingState;
  }
}