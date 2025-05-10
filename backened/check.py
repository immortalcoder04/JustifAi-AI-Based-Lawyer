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
# from sklearn.exceptions import InconsistentVersionWarning
import warnings
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ========== CONFIG ========== 
app = Flask(__name__, static_folder='static', static_url_path='/')  # Serve React's build folder
CORS(app)

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
ALLOWED_EXTENSIONS = {'pdf'}

# ========== SETUP ========== 
nltk.download('punkt')
# warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

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

def train_custody_models():
    np.random.seed(42)
    
    # Load the data from the Excel file
    df = pd.read_excel('data\Modified_Final_Database.xlsx')
    
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
    joblib.dump(custody_pipe, 'custody_model.pkl')
    joblib.dump(compensation_pipe, 'comp_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    train_custody_models()

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

    custody = joblib.load('custody_model.pkl').predict(df)[0]
    compensation = joblib.load('comp_model.pkl').predict(df)[0]

    return jsonify({
        "custody": custody,
        "compensation": round(float(compensation), 2)
    })

# ========== SERVE REACT BUILD ========== 
@app.route('/')
@app.route('/<path:path>')
def serve_react(path='index.html'):
    return send_from_directory(app.static_folder, path)


if __name__ == '__main__':
    app.run(debug=True)
