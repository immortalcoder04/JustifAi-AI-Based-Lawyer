from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import nltk
import PyPDF2
import pandas as pd
import numpy as np
from nltk.tokenize import sent_tokenize
from werkzeug.utils import secure_filename
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
import joblib
import warnings
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

# ========== CONFIG ========== 
app = Flask(__name__, static_folder='static', static_url_path='/')
CORS(app)

port = int(os.environ.get('PORT', 5000))
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
ALLOWED_EXTENSIONS = {'pdf'}

# Enable debug mode
app.debug = True

# Add logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# ========== SETUP ========== 
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

# Suppress specific sklearn warnings
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")
warnings.filterwarnings("ignore", category=FutureWarning, module="sklearn")

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# ========== PDF FUNCTIONS ========== 
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(pdf_path):
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        text = ''.join(page.extract_text() or '' for page in reader.pages)
        return text.strip()

def summarize_case(text):
    sentences = sent_tokenize(text)
    if not sentences:
        return "No valid text found in the document."

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(sentences)
    similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
    scores = similarity_matrix.sum(axis=1)
    ranked = [s for _, s in sorted(zip(scores, sentences), reverse=True)]
    num = min(4, len(ranked))
    summary = f"📌 **Case Summary**:\n{ranked[0]}\n\n🔹 **Key Legal Points:**"
    for i in range(1, num):
        summary += f"\n{i}️⃣ {ranked[i]}"
    return summary

@app.route('/summarization', methods=['GET'])
def get_summarization():
    return jsonify({"message": "Please use POST /upload endpoint to upload a PDF file for summarization"})

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files.get('file')
    if not file or file.filename == '' or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type or empty upload"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    text = extract_text_from_pdf(filepath)
    summary = summarize_case(text) if text else "No text found."
    os.remove(filepath)

    return jsonify({"summary": summary, "filename": file.filename})

# ========== ML FUNCTIONS ========== 
import pandas as pd

# Suppress version mismatch warnings
# warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

def train_custody_models():
    # Check if models already exist
    custody_model_path = os.path.join(MODEL_DIR, 'custody_model.pkl')
    comp_model_path = os.path.join(MODEL_DIR, 'comp_model.pkl')
    
    if os.path.exists(custody_model_path) and os.path.exists(comp_model_path):
        try:
            # Try loading the models to verify they work
            joblib.load(custody_model_path)
            joblib.load(comp_model_path)
            return
        except Exception as e:
            print(f"Error loading existing models: {e}")
            # If loading fails, we'll retrain the models
            if os.path.exists(custody_model_path):
                os.remove(custody_model_path)
            if os.path.exists(comp_model_path):
                os.remove(comp_model_path)
    
    np.random.seed(42)
    
    try:
        # Check if data file exists
        data_file_path = os.path.join(os.path.dirname(__file__), 'data', 'Modified_Final_Database.xlsx')
        if not os.path.exists(data_file_path):
            raise FileNotFoundError(f"Data file not found at {data_file_path}. Please ensure the data file is present.")
        
        # Load the data from the Excel file
        df = pd.read_excel(data_file_path)
        
        # Preprocess the data
        df['Divorce_Status'] = df['DivorceStatus'].apply(lambda x: 'Divorced' if x == 'Yes' else 'Not Divorced')
        df['Reason_for_Divorce'] = df['ReasonForDivorce']
        df['Child_Age'] = df['ChildAge']
        df['Custody_Granted_to'] = df['CustodyGrantedTo']
        df['Compensation'] = df['CompensationAmount']
        df['Father_Salary'] = df['FatherSalary']
        df['Mother_Salary'] = df['MotherSalary']
        
        # Drop the original columns
        df.drop(columns=['DivorceStatus', 'ReasonForDivorce', 'ChildAge', 'CustodyGrantedTo', 'CompensationAmount', 'FatherSalary', 'MotherSalary'], inplace=True)
        
        # Split the data into features and targets
        X = df.drop(['Custody_Granted_to', 'Compensation'], axis=1)
        y_custody = df['Custody_Granted_to']
        y_compensation = df['Compensation']

        # Define the preprocessor
        preprocessor = ColumnTransformer([ 
            ('num', StandardScaler(), ['Father_Salary', 'Mother_Salary', 'Child_Age']),
            ('cat', OneHotEncoder(), ['Divorce_Status', 'Reason_for_Divorce'])
        ])

        # Create the pipelines
        custody_pipe = Pipeline([('prep', preprocessor), ('clf', RandomForestClassifier())])
        compensation_pipe = Pipeline([('prep', preprocessor), ('reg', RandomForestRegressor())])

        # Train the models
        custody_pipe.fit(X, y_custody)
        compensation_pipe.fit(X, y_compensation)

        # Save the models
        joblib.dump(custody_pipe, custody_model_path)
        joblib.dump(compensation_pipe, comp_model_path)
        
        print("Models trained and saved successfully")
    except FileNotFoundError as e:
        print(f"Error: {str(e)}")
        raise
    except Exception as e:
        print(f"Error training models: {e}")
        raise

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Train models only if they don't exist
        try:
            train_custody_models()
        except FileNotFoundError as e:
            return jsonify({"error": str(e)}), 500
        except Exception as e:
            return jsonify({"error": f"Error training models: {str(e)}"}), 500

        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        try:
            df = pd.DataFrame([{
                'Father_Salary': data['father_salary'],
                'Mother_Salary': data['mother_salary'],
                'Divorce_Status': data['divorce_status'],
                'Reason_for_Divorce': data['reason_for_divorce'],
                'Child_Age': data['child_age']
            }])
        except KeyError as e:
            return jsonify({"error": f"Missing field {e}"}), 400

        # Load models from the correct directory
        custody_model_path = os.path.join(MODEL_DIR, 'custody_model.pkl')
        comp_model_path = os.path.join(MODEL_DIR, 'comp_model.pkl')
        
        custody = joblib.load(custody_model_path).predict(df)[0]
        compensation = joblib.load(comp_model_path).predict(df)[0]

        return jsonify({
            "custody": custody,
            "compensation": round(float(compensation), 2)
        })
    except Exception as e:
        print(f"Error in prediction: {e}")
        return jsonify({"error": "Failed to make prediction. Please try again."}), 500

# ========== FRONTEND ROUTES ==========
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

# Handle Chrome DevTools request
@app.route('/.well-known/appspecific/com.chrome.devtools.json')
def handle_chrome_devtools():
    return jsonify({"message": "Chrome DevTools configuration not available"}), 200

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# Catch-all route for frontend routes
@app.route('/chatbot')
@app.route('/summarization')
@app.route('/prediction')
@app.route('/about')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    logger.info(f"Starting server on port {port}")
    try:
        app.run(host='0.0.0.0', port=port, debug=True)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        raise
