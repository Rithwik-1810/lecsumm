import logging

logger = logging.getLogger(__name__)

class SpeechToText:
    def __init__(self, model_size="tiny.en"):
        """Try to load Faster-Whisper, but gracefully degrade if not available."""
        self.model = None
        try:
            from faster_whisper import WhisperModel
            logger.info(f"Loading Faster-Whisper model '{model_size}'...")
            self.model = WhisperModel(model_size, device="cpu", compute_type="int8")
            logger.info("Faster-Whisper model loaded successfully")
        except ImportError:
            logger.warning("faster-whisper not installed — local STT disabled (using API fallback).")
        except Exception as e:
            logger.warning(f"Failed to load Whisper model: {e} — local STT disabled.")

    def transcribe(self, audio_path, language="en"):
        """Transcribe audio file using Faster-Whisper. Returns text or None."""
        if not self.model:
            return None
        try:
            logger.info(f"Transcribing {audio_path} with language '{language}'")
            segments, info = self.model.transcribe(audio_path, language=language, beam_size=5)
            text = " ".join([segment.text for segment in segments])
            logger.info(f"Transcription completed, got {len(text)} characters")
            return text
        except Exception as e:
            logger.exception("Error during transcription")
            return None