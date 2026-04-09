from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import subprocess
import json
import logging
import time
from werkzeug.utils import secure_filename
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from dotenv import load_dotenv

from speech_to_text import SpeechToText
from summarizer import Summarizer
from task_extractor import TaskExtractor

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Use local 'uploads' directory
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'm4a', 'ogg', 'flac', 'mp4', 'avi', 'mov'}
MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize global Gemini configuration
if os.getenv("GEMINI_API_KEY"):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    logger.info("Gemini API configured globally.")
else:
    logger.warning("GEMINI_API_KEY IS MISSING! AI features will fail.")

# Initialize Groq client (fallback)
groq_client = None
if os.getenv("GROQ_API_KEY"):
    try:
        from groq import Groq
        groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        logger.info("✅ Groq client initialized (fallback ready).")
    except Exception as e:
        logger.warning(f"Groq init failed: {e}")
else:
    logger.warning("GROQ_API_KEY not set — Groq fallback disabled.")

# Shared model instance to save resources
try:
    # whisper fallback instance
    stt_fallback = SpeechToText() 
    summarizer = Summarizer()
    task_extractor = TaskExtractor()
    ai_model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    logger.exception("Failed to initialize AI models: %s", str(e))
    stt_fallback = summarizer = task_extractor = ai_model = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_audio_duration(filepath):
    try:
        result = subprocess.run(
            ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', filepath],
            capture_output=True, text=True, check=True, timeout=15
        )
        return float(json.loads(result.stdout)['format']['duration'])
    except:
        return 0.0

def wait_for_files_active(files):
    """Waits for Gemini files to be processed and active."""
    logger.info("Waiting for Gemini to process large audio file...")
    for f in files:
        file = genai.get_file(f.name)
        while file.state.name == "PROCESSING":
            time.sleep(2)
            file = genai.get_file(f.name)
        if file.state.name != "ACTIVE":
            raise Exception(f"File {f.name} failed to process: {file.state.name}")

def is_quota_error(e):
    """Check if an exception is a quota/rate-limit error."""
    err_msg = str(e).lower()
    return "quota" in err_msg or "429" in err_msg or "resource has been exhausted" in err_msg

# ─────────────────────────────────────────────────────
# GROQ FALLBACK FUNCTIONS
# ─────────────────────────────────────────────────────
def groq_transcribe(filepath):
    """Transcribe audio using Groq Whisper Large v3 Turbo."""
    if not groq_client:
        raise Exception("Groq client not available")
    
    logger.info("🔄 GROQ FALLBACK: Transcribing with Whisper...")
    with open(filepath, "rb") as audio_file:
        transcription = groq_client.audio.transcriptions.create(
            file=(os.path.basename(filepath), audio_file),
            model="whisper-large-v3-turbo",
            response_format="text",
        )
    logger.info(f"✅ Groq transcription complete ({len(transcription)} chars)")
    return transcription

def groq_summarize(transcript, language):
    """Summarize transcript using Groq Llama 3.3 70B."""
    if not groq_client:
        raise Exception("Groq client not available")
    
    logger.info("🔄 GROQ FALLBACK: Summarizing with Llama 3.3...")
    prompt = f"""Analyze the following lecture transcript and provide a concise, direct summary in {language.capitalize()}.

CRITICAL INSTRUCTIONS:
- BE CONCISE: Scale the summary length to match the context.
- ZERO FLUFF: Avoid introductory phrases ("This transcript handles...", "The speaker discusses..."). 
- STUDENT-FIRST: Provide only the essential facts, actionable information, and core concepts. 
- NO META-DESCRIPTION: Do not explain what is missing or analyzed; just summarize what IS there.

Provide the following structured JSON response:
1. "summary": A brief, professional summary (direct and factual).
2. "keyPoints": A list of the most important takeaways (max 5 items, brief).
3. "topics": A list of the main subject areas (max 3 items).

Return ONLY the raw JSON object with these three keys.

Transcript:
\"\"\"{transcript}\"\"\""""
    
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_completion_tokens=2048,
    )
    return response.choices[0].message.content

def groq_extract_tasks(transcript):
    """Extract tasks using Groq Llama 3.3 70B."""
    if not groq_client:
        raise Exception("Groq client not available")
    
    logger.info("🔄 GROQ FALLBACK: Extracting tasks with Llama 3.3...")
    from datetime import datetime
    prompt = f"""You are an intelligent task extraction assistant. Analyze the following lecture transcript and extract actionable tasks and assignments.

CRITICAL INSTRUCTIONS:
- BE DIRECT: Extract ONLY what is explicitly mentioned. Do not add meta-commentary.
- CONCISE TITLES: Generate very brief, 2-4 word titles (e.g., "Neural Networks Assignment").
- SIMPLE DESCRIPTIONS: Limit descriptions to one clear, actionable sentence.
- AUTOMATED DEADLINE EXTRACTION: Deduce the exact deadline from the context.
  - Current Date: {datetime.now().strftime("%Y-%m-%d")}.
  - Default time to 18:00:00 if no specific time is mentioned.
- ZERO HALLUCINATION: If a detail isn't clear, don't guess.

For each task, provide:
1. "title": Short, unique name.
2. "description": One simple sentence summary.
3. "priority": "High", "Medium", or "Low".
4. "deadline": ISO 8601 format (YYYY-MM-DDTHH:MM:SS).

Return the result ONLY as a JSON array of objects. If no tasks are found, return [].

Transcript:
\"\"\"{transcript}\"\"\""""
    
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_completion_tokens=2048,
    )
    return response.choices[0].message.content

def process_with_groq(filepath, language):
    """Full processing pipeline using Groq (transcribe → summarize → extract tasks)."""
    logger.info("🔄 === GROQ FALLBACK PIPELINE ACTIVATED ===")
    
    # 1. Transcribe
    transcript = groq_transcribe(filepath)
    
    # 2. Summarize
    summary_raw = groq_summarize(transcript, language)
    summary_text, key_points, topics = summarizer._parse_response(summary_raw)
    
    # 3. Extract tasks
    tasks_raw = groq_extract_tasks(transcript)
    tasks = task_extractor._parse_tasks(tasks_raw)
    
    logger.info("✅ Groq fallback pipeline complete!")
    return transcript, summary_text, key_points, topics, tasks


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok", 
        "api_key_set": bool(os.getenv("GEMINI_API_KEY")),
        "groq_available": groq_client is not None
    })

@app.route('/process', methods=['POST'])
def process_lecture():
    temp_files = []
    gemini_files = []
    try:
        logger.info("Received /process request")
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']
        if file.filename == '' or not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400

        language = request.form.get('language', 'english')
        
        # Save locally
        filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        temp_files.append(filepath)
        
        file_size = os.path.getsize(filepath)
        logger.info(f"Processing file: {filename}, size: {file_size / (1024*1024):.2f} MB")

        duration = get_audio_duration(filepath)
        
        # ───────────────────────────────────────────
        # TRY GEMINI FIRST
        # ───────────────────────────────────────────
        gemini_failed = False
        try:
            # 1. Prepare audio content via Gemini File API
            audio_content = None
            
            # Simple MIME hint for Gemini (improves processing speed)
            MIME_MAP = {'.m4a': 'audio/mp4', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.mp4': 'video/mp4'}
            ext = os.path.splitext(filename)[1].lower()
            mime_type = MIME_MAP.get(ext, 'audio/mpeg')

            logger.info(f"Uploading to Gemini File API: {filename} ({mime_type})")
            g_file = genai.upload_file(path=filepath, display_name=filename, mime_type=mime_type)
            gemini_files.append(g_file)
            wait_for_files_active([g_file])
            audio_content = g_file
            logger.info(f"Gemini File API ready: {g_file.uri}")

            # Safety configuration
            safety_settings = {
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            }

            # ROBUST MODEL FALLBACK CHAIN (within Gemini)
            def generate_with_fallback(prompt_list):
                models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest']
                last_err = None
                for m_name in models:
                    try:
                        logger.info(f"Attempting generation with model: {m_name}")
                        m = genai.GenerativeModel(m_name)
                        return m.generate_content(prompt_list, safety_settings=safety_settings)
                    except Exception as e:
                        last_err = e
                        err_msg = str(e).lower()
                        if "quota" in err_msg or "429" in err_msg or "404" in err_msg or "resource" in err_msg:
                            logger.warning(f"Model {m_name} failed (quota/not found), trying next...")
                            continue
                        raise e
                raise last_err

            # 1. Summary
            logger.info("Generating summary...")
            summary_prompt = summarizer._get_prompt(language)
            s_response = generate_with_fallback([summary_prompt, audio_content])
            summary_text, key_points, topics = summarizer._parse_response(s_response.text)
            
            # 2. Tasks
            logger.info("Extracting tasks...")
            task_prompt = task_extractor._get_prompt()
            t_response = generate_with_fallback([task_prompt, audio_content])
            tasks = task_extractor._parse_tasks(t_response.text)

            # 3. Transcript
            logger.info("Generating transcript...")
            transcript = ""
            try:
                transcript_prompt = f"Provide a full, verbatim transcript of this audio in {language.capitalize()}. Return ONLY the transcript text."
                tr_response = generate_with_fallback([transcript_prompt, audio_content])
                transcript = tr_response.text
            except:
                logger.warning("Gemini transcript generation failed, falling back to local STT.")
                transcript = stt_fallback.transcribe(filepath, language[:2]) or "Summary generated successfully, but the full transcript was unavailable."

        except Exception as gemini_err:
            if is_quota_error(gemini_err) and groq_client:
                logger.warning(f"⚠️ Gemini quota exhausted: {gemini_err}")
                logger.info("🔄 Switching to Groq fallback...")
                gemini_failed = True
            else:
                raise gemini_err

        # ───────────────────────────────────────────
        # GROQ FALLBACK (if Gemini quota exhausted)
        # ───────────────────────────────────────────
        if gemini_failed:
            transcript, summary_text, key_points, topics, tasks = process_with_groq(filepath, language)

        return jsonify({
            "transcript": transcript,
            "summary": {
                "content": summary_text,
                "keyPoints": key_points,
                "topics": topics,
                "confidence": 95
            },
            "tasks": tasks,
            "durationSeconds": duration
        })

    except Exception as e:
        logger.exception("AI Process crash")
        err_msg = str(e).lower()
        if "quota" in err_msg or "429" in err_msg:
            return jsonify({
                "error": "AI_QUOTA_EXHAUSTED",
                "message": "All AI providers are currently at capacity. Please try again in 1-2 minutes."
            }), 429
        
        return jsonify({
            "error": "AI_INTERNAL_ERROR",
            "message": str(e)
        }), 500
    finally:
        for f in temp_files:
            try: os.remove(f)
            except: pass
        for f in gemini_files:
            try: genai.delete_file(f.name)
            except: pass

if __name__ == '__main__':
    print(f"GenAI SDK Version: {genai.__version__}")
    print(f"Groq Available: {groq_client is not None}")
    app.run(host='0.0.0.0', port=5000, debug=True)